from __future__ import annotations

import hashlib
import re
import threading
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Protocol, runtime_checkable

from responses import ERROR_MESSAGES, ErrorKind

ALLOWED_MIME_TYPES = frozenset(
    {
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "image/png",
        "image/jpeg",
        "text/plain",
        "text/csv",
    }
)

EXTENSION_BY_MIME = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
    "image/png": "png",
    "image/jpeg": "jpg",
    "text/plain": "txt",
    "text/csv": "csv",
}

MAX_UPLOAD_BYTES = 26214400
RATE_LIMIT_COLLECTION = "sharepointRateLimits"

_EXTENSION_PATTERN = re.compile(r"\.([A-Za-z0-9]{1,10})$")
_WHITESPACE_PATTERN = re.compile(r"\s+")
_FILENAME_CHARACTERS = ".-_()"


class UploadValidationError(Exception):
    def __init__(self, kind: ErrorKind, message: str | None = None) -> None:
        self.kind = ErrorKind(kind)
        super().__init__(message if message is not None else ERROR_MESSAGES[self.kind])


@dataclass(frozen=True)
class UploadMetadata:
    normalized_filename: str
    mime: str
    size_bytes: int
    extension: str
    content_hash: str | None = None


@dataclass(frozen=True)
class RateLimitDecision:
    allowed: bool
    remaining: int
    reset_at: str
    limit: int

    def to_public_dict(self) -> dict[str, Any]:
        return {"remaining": self.remaining, "resetAt": self.reset_at}


@runtime_checkable
class RateLimiter(Protocol):
    def check(self, company_id: str, uid: str, endpoint: str) -> RateLimitDecision: ...


class RateLimitUnavailable(Exception):
    def __init__(self) -> None:
        super().__init__("Rate limit state is unavailable; the request is denied.")


def _iso_seconds(epoch_seconds: int) -> str:
    return (
        datetime.fromtimestamp(epoch_seconds, tz=timezone.utc)
        .isoformat()
        .replace("+00:00", "Z")
    )


def normalize_filename(raw: Any) -> str:
    if not isinstance(raw, str) or not raw:
        raise UploadValidationError(ErrorKind.INVALID_REQUEST)
    segment = raw.replace("\\", "/").split("/")[-1]
    if segment in {".", ".."}:
        raise UploadValidationError(ErrorKind.INVALID_REQUEST)
    segment = "".join(
        character
        for character in segment
        if ord(character) >= 32 and ord(character) != 127
    )
    segment = _WHITESPACE_PATTERN.sub("_", segment).strip().strip(".").strip()
    segment = "".join(
        character
        for character in segment
        if character.isalnum() or character in _FILENAME_CHARACTERS
    )
    if not segment:
        raise UploadValidationError(ErrorKind.INVALID_REQUEST)
    match = _EXTENSION_PATTERN.search(segment)
    if match is None:
        return segment[:200]
    extension = match.group(1).lower()
    stem = segment[: match.start()][:200].rstrip(".")
    if not stem:
        raise UploadValidationError(ErrorKind.INVALID_REQUEST)
    return stem + "." + extension


def validate_upload_metadata(
    filename: Any,
    mime: Any,
    size_bytes: Any,
    max_bytes: int | None = None,
) -> UploadMetadata:
    normalized = normalize_filename(filename)
    if not isinstance(mime, str):
        raise UploadValidationError(ErrorKind.UNSUPPORTED_MEDIA_TYPE)
    clean_mime = mime.split(";", 1)[0].strip().lower()
    if clean_mime not in ALLOWED_MIME_TYPES:
        raise UploadValidationError(ErrorKind.UNSUPPORTED_MEDIA_TYPE)
    if isinstance(size_bytes, bool) or not isinstance(size_bytes, int) or size_bytes <= 0:
        raise UploadValidationError(ErrorKind.PAYLOAD_TOO_LARGE)
    effective_max = max_bytes
    if effective_max is None:
        from config import get_settings

        effective_max = get_settings().max_upload_bytes
    if (
        isinstance(effective_max, bool)
        or not isinstance(effective_max, int)
        or effective_max < 1
    ):
        raise UploadValidationError(ErrorKind.INVALID_REQUEST)
    if size_bytes > effective_max:
        raise UploadValidationError(ErrorKind.PAYLOAD_TOO_LARGE)
    expected_extension = EXTENSION_BY_MIME[clean_mime]
    actual_extension = (
        normalized.rsplit(".", 1)[1] if "." in normalized else ""
    )
    if actual_extension != expected_extension:
        raise UploadValidationError(ErrorKind.INVALID_REQUEST)
    return UploadMetadata(
        normalized_filename=normalized,
        mime=clean_mime,
        size_bytes=size_bytes,
        extension=expected_extension,
    )


def rate_limit_key(uid: str, endpoint: str, window_index: int) -> str:
    return hashlib.sha256(
        f"{uid}|{endpoint}|{window_index}".encode("utf-8")
    ).hexdigest()


def _snapshot_data(snapshot: Any) -> dict[str, Any]:
    if snapshot is None:
        return {}
    if hasattr(snapshot, "exists") and not snapshot.exists:
        return {}
    if hasattr(snapshot, "to_dict"):
        return snapshot.to_dict() or {}
    try:
        first = next(iter(snapshot))
    except (StopIteration, TypeError):
        return {}
    if first is None or not hasattr(first, "to_dict"):
        return {}
    return first.to_dict() or {}


class FirestoreRateLimiter:
    def __init__(self, client: Any, settings: Any = None) -> None:
        self._client = client
        self._settings = settings

    def check(self, company_id: str, uid: str, endpoint: str) -> RateLimitDecision:
        try:
            from firebase_admin import firestore

            settings = self._settings
            if settings is None:
                from config import get_settings

                settings = get_settings()
            window_seconds = settings.rate_limit_window_seconds
            limit = settings.rate_limit_max_requests
            now = int(time.time())
            window_index = int(now // window_seconds)
            window_start = window_index * window_seconds
            reset_epoch = window_start + 2 * window_seconds
            document_id = (
                f"{company_id}_{rate_limit_key(uid, endpoint, window_index)}"
            )
            document = self._client.collection(RATE_LIMIT_COLLECTION).document(
                document_id
            )
            transaction = self._client.transaction()

            def operation(current_transaction: Any) -> RateLimitDecision:
                data = _snapshot_data(current_transaction.get(document))
                count = data.get("count", 0)
                if isinstance(count, bool) or not isinstance(count, int):
                    raise ValueError("invalid stored counter")
                if data.get("windowStart") != window_start:
                    count = 0
                allowed = count < limit
                if allowed:
                    count += 1
                current_transaction.set(
                    document,
                    {
                        "count": count,
                        "windowStart": window_start,
                        "expiresAt": reset_epoch,
                    },
                )
                return RateLimitDecision(
                    allowed=allowed,
                    remaining=max(0, limit - count),
                    reset_at=_iso_seconds(reset_epoch),
                    limit=limit,
                )

            return firestore.transactional(operation)(transaction)
        except Exception:
            raise RateLimitUnavailable() from None


class InMemoryRateLimiter:
    """Test-only limiter; production traffic must use FirestoreRateLimiter."""

    def __init__(self, limit: int, window_seconds: int) -> None:
        self._limit = limit
        self._window_seconds = window_seconds
        self._counts: dict[tuple[str, str, str, int], int] = {}
        self._lock = threading.Lock()

    def check(self, company_id: str, uid: str, endpoint: str) -> RateLimitDecision:
        with self._lock:
            now = int(time.time())
            window_index = int(now // self._window_seconds)
            reset_epoch = (window_index + 2) * self._window_seconds
            key = (company_id, uid, endpoint, window_index)
            count = self._counts.get(key, 0)
            allowed = count < self._limit
            if allowed:
                count += 1
                self._counts[key] = count
            return RateLimitDecision(
                allowed=allowed,
                remaining=max(0, self._limit - count),
                reset_at=_iso_seconds(reset_epoch),
                limit=self._limit,
            )
