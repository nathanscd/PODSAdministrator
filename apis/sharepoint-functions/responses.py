from __future__ import annotations

import json
from collections.abc import Mapping
from enum import Enum
from types import MappingProxyType
from typing import Any

__all__ = [
    "PRIVATE_NO_STORE_HEADERS",
    "ErrorKind",
    "ERROR_MESSAGES",
    "ApiError",
    "private_json",
    "private_error",
    "to_https_response",
    "safety_headers_present",
]

PRIVATE_NO_STORE_HEADERS = MappingProxyType(
    {
        "cache-control": "no-store, private, max-age=0, no-cache, must-revalidate",
        "pragma": "no-cache",
        "expires": "0",
        "x-content-type-options": "nosniff",
    }
)


class ErrorKind(str, Enum):
    UNAUTHORIZED = "unauthorized"
    FORBIDDEN = "forbidden"
    TENANT_REQUIRED = "tenant_required"
    INVALID_REQUEST = "invalid_request"
    PAYLOAD_TOO_LARGE = "payload_too_large"
    UNSUPPORTED_MEDIA_TYPE = "unsupported_media_type"
    RATE_LIMITED = "rate_limited"
    NOT_FOUND = "not_found"
    INTERNAL = "internal"


ERROR_MESSAGES = MappingProxyType(
    {
        ErrorKind.UNAUTHORIZED: "Authentication is required to access this resource.",
        ErrorKind.FORBIDDEN: "You do not have permission to access this resource.",
        ErrorKind.TENANT_REQUIRED: "A tenant context is required to complete this request.",
        ErrorKind.INVALID_REQUEST: "The request could not be understood or processed.",
        ErrorKind.PAYLOAD_TOO_LARGE: "The submitted payload exceeds the allowed size.",
        ErrorKind.UNSUPPORTED_MEDIA_TYPE: "The submitted media type is not supported.",
        ErrorKind.RATE_LIMITED: "Too many requests were made. Please try again later.",
        ErrorKind.NOT_FOUND: "The requested resource was not found.",
        ErrorKind.INTERNAL: "An internal error occurred while processing the request.",
    }
)

DEFAULT_STATUSES = MappingProxyType(
    {
        ErrorKind.UNAUTHORIZED: 401,
        ErrorKind.FORBIDDEN: 403,
        ErrorKind.TENANT_REQUIRED: 403,
        ErrorKind.INVALID_REQUEST: 400,
        ErrorKind.PAYLOAD_TOO_LARGE: 413,
        ErrorKind.UNSUPPORTED_MEDIA_TYPE: 415,
        ErrorKind.RATE_LIMITED: 429,
        ErrorKind.NOT_FOUND: 404,
        ErrorKind.INTERNAL: 500,
    }
)


class ApiError(Exception):
    def __init__(
        self,
        kind: ErrorKind,
        status: int | None = None,
        retry_after_seconds: int | None = None,
    ) -> None:
        self.kind = ErrorKind(kind)
        self.status = DEFAULT_STATUSES[self.kind] if status is None else status
        self.retry_after_seconds = retry_after_seconds
        super().__init__(ERROR_MESSAGES[self.kind])

    def __str__(self) -> str:
        return ERROR_MESSAGES[self.kind]

    def to_body(self) -> dict[str, dict[str, str]]:
        return {
            "error": {
                "code": self.kind.value,
                "message": ERROR_MESSAGES[self.kind],
            }
        }


def private_json(
    payload: Any,
    status: int = 200,
    extra_headers: Mapping[str, str] | None = None,
) -> tuple[int, Any, dict[str, str]]:
    headers = dict(PRIVATE_NO_STORE_HEADERS)
    if extra_headers:
        canonical = {key.lower(): key for key in headers}
        for key, value in extra_headers.items():
            existing = canonical.get(key.lower())
            if existing is not None:
                if headers[existing] != value:
                    raise ValueError("cannot override private response header: " + existing)
            else:
                canonical[key.lower()] = key
                headers[key] = value
    return (status, payload, headers)


def private_error(
    kind: ErrorKind,
    status: int | None = None,
    retry_after_seconds: int | None = None,
) -> tuple[int, dict[str, dict[str, str]], dict[str, str]]:
    error = ApiError(kind, status=status, retry_after_seconds=retry_after_seconds)
    extra_headers = None
    if error.retry_after_seconds is not None:
        extra_headers = {"retry-after": str(error.retry_after_seconds)}
    return private_json(error.to_body(), error.status, extra_headers)


def to_https_response(result: tuple[int, Any, dict[str, str]]) -> Any:
    status, body, headers = result
    try:
        from firebase_functions.https.https_fn import Response
    except ImportError:
        raise RuntimeError(
            "firebase_functions is required for to_https_response but is not installed"
        ) from None
    return Response(
        json.dumps(body),
        status=status,
        headers=headers,
        mimetype="application/json",
    )


def safety_headers_present(headers: Mapping[str, str] | None) -> bool:
    if not isinstance(headers, Mapping):
        return False
    lowered = {key.lower(): value for key, value in headers.items()}
    return all(
        lowered.get(key) == value for key, value in PRIVATE_NO_STORE_HEADERS.items()
    )
