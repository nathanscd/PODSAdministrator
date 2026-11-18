"""Fail-closed access to secrets injected by Cloud Functions ``--set-secrets``.

Secrets are read from environment variables at call time and are never
cached, serialized or logged. Every error carries the environment variable
name only -- never a value, length, prefix or hash.
"""
from __future__ import annotations

import base64
import binascii
import os

from config import SharePointSettings, get_settings

_CRYPTO_KEY_BYTES = 32


class SecretUnavailableError(Exception):
    """A named secret is absent or unusable. ``str(error)`` is the env name."""

    def __init__(self, name: str):
        self.name = str(name)
        super().__init__(self.name)

    def __str__(self) -> str:
        return self.name


def get_client_secret(settings: SharePointSettings | None = None) -> str:
    """Return the injected Microsoft client secret, or fail closed by name."""
    active = settings if settings is not None else get_settings()
    name = active.ms_client_secret_env
    value = os.getenv(name)
    if value is None or not value.strip():
        raise SecretUnavailableError(name)
    return value


def get_crypto_key(
    key_version: int, settings: SharePointSettings | None = None
) -> bytes:
    """Return exactly 32 bytes for the requested key version, or fail closed."""
    active = settings if settings is not None else get_settings()
    name = active.crypto_key_env_name(key_version)
    raw = os.getenv(name)
    if raw is None or not raw.strip():
        raise SecretUnavailableError(name)
    return decode_key_material(raw, name)


def decode_key_material(
    raw: str,
    name: str = "SHAREPOINT_TOKEN_CRYPTO_KEY",
) -> bytes:
    """Base64-decode key material and require exactly 32 bytes.

    Decoding failures are translated to ``SecretUnavailableError`` so no
    library exception can escape carrying a fragment of the supplied value.
    """
    try:
        material = base64.b64decode(raw.strip(), validate=True)
    except (binascii.Error, ValueError, TypeError):
        raise SecretUnavailableError(name) from None
    if len(material) != _CRYPTO_KEY_BYTES:
        raise SecretUnavailableError(name)
    return material
