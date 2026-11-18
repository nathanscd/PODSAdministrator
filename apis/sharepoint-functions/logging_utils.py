from __future__ import annotations

import hashlib
import json
import logging
from datetime import datetime, timezone
from typing import Any, Mapping

LOG_ALLOWED_KEYS = frozenset(
    {
        "event",
        "endpoint",
        "route",
        "status",
        "error_kind",
        "company_id",
        "uid_hash",
        "filename_hash",
        "mime",
        "size_bytes",
        "duration_ms",
        "key_version",
        "retry_after_seconds",
        "request_id",
        "outcome",
    }
)

SENSITIVE_KEY_FRAGMENTS = (
    "token",
    "secret",
    "password",
    "authorization",
    "cookie",
    "key",
    "credential",
    "blob",
    "ciphertext",
    "nonce",
    "aad",
    "signature",
)

_REDACTED = "[redacted]"


def redact_value(value: Any) -> str | int | float | bool | None:
    if value is None:
        return None
    if isinstance(value, str):
        return value if len(value) <= 200 else _REDACTED
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return value
    return _REDACTED


def scrub_payload(payload: Mapping[Any, Any]) -> dict[str, Any]:
    cleaned: dict[str, Any] = {}
    for key, value in payload.items():
        if not isinstance(key, str) or key not in LOG_ALLOWED_KEYS:
            continue
        redacted = redact_value(value)
        if redacted == _REDACTED:
            continue
        cleaned[key] = redacted
    return cleaned


def build_log_event(event: str, **fields: Any) -> dict[str, Any]:
    if not isinstance(event, str) or not event.strip():
        raise ValueError("event must be a non-empty string")
    payload = scrub_payload(fields)
    status = payload.get("status")
    if payload.get("error_kind") or (isinstance(status, int) and status >= 500):
        severity = "ERROR"
    elif isinstance(status, int) and status >= 400:
        severity = "WARNING"
    else:
        severity = "INFO"
    return {
        "event": event,
        "severity": severity,
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "fields": payload,
        "schema": "sharepoint-log-v1",
    }


def hash_identifier(value: str) -> str:
    if not isinstance(value, str) or not value:
        raise ValueError("value must be a non-empty string")
    return "h_" + hashlib.sha256(value.encode("utf-8")).hexdigest()[:16]


def log_event(logger: logging.Logger, event: str, **fields: Any) -> dict[str, Any]:
    built = build_log_event(event, **fields)
    message = json.dumps(built["fields"], sort_keys=True, separators=(",", ":"))
    severity = built["severity"]
    if severity == "ERROR":
        logger.error("%s %s", event, message)
    elif severity == "WARNING":
        logger.warning("%s %s", event, message)
    else:
        logger.info("%s %s", event, message)
    return built
