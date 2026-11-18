"""Fail-closed configuration for the SharePoint Gen2 codebase.

Only non-secret identifiers are read here. Secret values are resolved on
demand by :mod:`secret_provider` from environment variables injected by
Cloud Functions ``--set-secrets``. Never place a secret value in this module.
"""
from __future__ import annotations

import os
import threading
from dataclasses import dataclass

DEFAULT_MS_CLIENT_SECRET_ENV = "SHAREPOINT_MS_CLIENT_SECRET"
DEFAULT_CRYPTO_KEY_ENV_PREFIX = "SHAREPOINT_TOKEN_CRYPTO_KEY_V"

DEFAULT_ALLOWED_MIME_TYPES: tuple[str, ...] = (
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/png",
    "image/jpeg",
)


class ConfigurationError(Exception):
    """Base class for configuration failures. Carries names only, never values."""


class MissingConfigError(ConfigurationError):
    """Raised when required non-secret identifiers are absent.

    ``str(error)`` is exactly the comma-separated list of missing variable
    names: no value, length, prefix or hash is ever attached.
    """

    def __init__(self, names: str | list[str] | tuple[str, ...]):
        if isinstance(names, str):
            parsed = [part.strip() for part in names.split(",") if part.strip()]
        else:
            parsed = [str(name).strip() for name in names]
        self.names: tuple[str, ...] = tuple(parsed)
        super().__init__(", ".join(self.names))


def _int_env(name: str, default: int, *, minimum: int = 1) -> int:
    """Read a positive integer setting without ever raising on bad input."""
    raw = os.getenv(name)
    if raw is None or not raw.strip():
        return default
    try:
        value = int(raw)
    except ValueError:
        return default
    return value if value >= minimum else default


@dataclass(frozen=True)
class SharePointSettings:
    """Immutable settings. Contains environment *names*, never secret values."""

    project_id: str
    ms_client_id: str
    ms_tenant_id: str
    ms_client_secret_env: str = DEFAULT_MS_CLIENT_SECRET_ENV
    crypto_key_env_prefix: str = DEFAULT_CRYPTO_KEY_ENV_PREFIX
    active_crypto_key_version: int = 1
    max_upload_bytes: int = 26214400
    rate_limit_window_seconds: int = 60
    rate_limit_max_requests: int = 30
    allowed_mime_types: tuple[str, ...] = DEFAULT_ALLOWED_MIME_TYPES

    @classmethod
    def from_env(cls) -> "SharePointSettings":
        """Build settings from non-secret identifiers only.

        Missing or malformed values never raise: importing and constructing
        settings must work with no environment. Consumers that need an
        identifier call :meth:`require_identifiers` and fail closed there.
        """
        return cls(
            project_id=os.getenv("GOOGLE_CLOUD_PROJECT", "").strip()
            or os.getenv("FIREBASE_PROJECT_ID", "").strip(),
            ms_client_id=os.getenv("SHAREPOINT_MS_CLIENT_ID", "").strip(),
            ms_tenant_id=os.getenv("SHAREPOINT_MS_TENANT_ID", "").strip(),
            active_crypto_key_version=_int_env(
                "SHAREPOINT_ACTIVE_CRYPTO_KEY_VERSION", 1
            ),
            max_upload_bytes=_int_env("SHAREPOINT_MAX_UPLOAD_BYTES", 26214400),
            rate_limit_window_seconds=_int_env(
                "SHAREPOINT_RATE_LIMIT_WINDOW_SECONDS", 60
            ),
            rate_limit_max_requests=_int_env("SHAREPOINT_RATE_LIMIT_MAX_REQUESTS", 30),
        )

    def require_identifiers(self) -> None:
        """Fail closed when a non-secret identifier is missing (names only)."""
        missing: list[str] = []
        if not self.project_id:
            missing.append("GOOGLE_CLOUD_PROJECT")
        if not self.ms_client_id:
            missing.append("SHAREPOINT_MS_CLIENT_ID")
        if not self.ms_tenant_id:
            missing.append("SHAREPOINT_MS_TENANT_ID")
        if missing:
            raise MissingConfigError(missing)

    def crypto_key_env_name(self, key_version: int) -> str:
        """Return the injected environment name for a key version."""
        return f"{self.crypto_key_env_prefix}{key_version}"


_settings: SharePointSettings | None = None
_settings_lock = threading.Lock()


def get_settings() -> SharePointSettings:
    """Return the process-cached settings, built lazily on first use."""
    global _settings
    if _settings is None:
        with _settings_lock:
            if _settings is None:
                _settings = SharePointSettings.from_env()
    return _settings


def reset_settings_for_tests() -> None:
    """Drop the cached instance so the next call rebuilds from the environment."""
    global _settings
    with _settings_lock:
        _settings = None
