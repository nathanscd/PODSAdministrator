from __future__ import annotations

import base64
import binascii
import os
from collections.abc import Mapping
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from typing import Any

from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

import config
import secret_provider

ALGORITHM = "AES-256-GCM"
NONCE_BYTES = 12
KEY_BYTES = 32
SCHEMA_VERSION = "v1"


class CryptoError(Exception):
    pass


class UnknownKeyVersionError(CryptoError):
    def __init__(self, key_version: int):
        self.key_version = key_version
        self.version = key_version
        super().__init__(f"unknown_key_version:{key_version}")


@dataclass(frozen=True)
class EncryptedBlob:
    algorithm: str
    keyVersion: int
    nonce_b64: str
    ciphertext_b64: str
    aad: str
    updatedAt: str

    @property
    def key_version(self) -> int:
        return self.keyVersion

    @property
    def updated_at(self) -> str:
        return self.updatedAt

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Mapping[str, Any]) -> "EncryptedBlob":
        if not isinstance(data, Mapping):
            raise CryptoError("invalid_envelope")
        try:
            algorithm = data["algorithm"]
            key_version = data["keyVersion"]
            nonce_b64 = data["nonce_b64"]
            ciphertext_b64 = data["ciphertext_b64"]
            aad = data["aad"]
            updated_at = data["updatedAt"]
        except KeyError:
            raise CryptoError("invalid_envelope") from None
        if not all(
            isinstance(value, str)
            for value in (algorithm, nonce_b64, ciphertext_b64, aad, updated_at)
        ):
            raise CryptoError("invalid_envelope")
        return cls(
            algorithm=algorithm,
            keyVersion=_validate_key_version(key_version),
            nonce_b64=nonce_b64,
            ciphertext_b64=ciphertext_b64,
            aad=aad,
            updatedAt=updated_at,
        )


def _validate_key_version(key_version: Any) -> int:
    if (
        not isinstance(key_version, int)
        or isinstance(key_version, bool)
        or key_version < 1
    ):
        raise CryptoError("invalid_key_version")
    return key_version


def _resolve_key(key_version: int) -> bytes:
    try:
        key = secret_provider.get_crypto_key(key_version)
    except secret_provider.SecretUnavailableError:
        raise UnknownKeyVersionError(key_version) from None
    if not isinstance(key, bytes) or len(key) != KEY_BYTES:
        raise CryptoError("invalid_key_material")
    return key


def build_aad(tenant_id: str, purpose: str) -> str:
    if not isinstance(tenant_id, str) or not tenant_id.strip():
        raise CryptoError("tenant_required")
    if not isinstance(purpose, str) or not purpose.strip():
        raise CryptoError("purpose_required")
    if "|" in tenant_id or "|" in purpose:
        raise CryptoError("invalid_aad_component")
    return f"{SCHEMA_VERSION}|{tenant_id}|{purpose}"


def encrypt_blob(
    plaintext: str,
    tenant_id: str,
    purpose: str,
    key_version: int | None = None,
) -> EncryptedBlob:
    if not isinstance(plaintext, str):
        raise CryptoError("plaintext_must_be_str")
    if key_version is None:
        key_version = config.get_settings().active_crypto_key_version
    version = _validate_key_version(key_version)
    aad = build_aad(tenant_id, purpose)
    key = _resolve_key(version)
    nonce = os.urandom(NONCE_BYTES)
    ciphertext = AESGCM(key).encrypt(
        nonce, plaintext.encode("utf-8"), aad.encode("utf-8")
    )
    return EncryptedBlob(
        algorithm=ALGORITHM,
        keyVersion=version,
        nonce_b64=base64.b64encode(nonce).decode("ascii"),
        ciphertext_b64=base64.b64encode(ciphertext).decode("ascii"),
        aad=aad,
        updatedAt=datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    )


def decrypt_blob(
    blob_or_dict: EncryptedBlob | Mapping[str, Any],
    tenant_id: str,
    purpose: str,
) -> str:
    if isinstance(blob_or_dict, EncryptedBlob):
        envelope = blob_or_dict
    else:
        envelope = EncryptedBlob.from_dict(blob_or_dict)
    if envelope.algorithm != ALGORITHM:
        raise CryptoError("unsupported_algorithm")
    if not envelope.aad.startswith(f"{SCHEMA_VERSION}|"):
        raise CryptoError("unsupported_schema_version")
    key = _resolve_key(_validate_key_version(envelope.keyVersion))
    aad = build_aad(tenant_id, purpose).encode("utf-8")
    try:
        nonce = base64.b64decode(envelope.nonce_b64, validate=True)
        ciphertext = base64.b64decode(envelope.ciphertext_b64, validate=True)
    except (binascii.Error, ValueError, TypeError):
        raise CryptoError("decrypt_failed") from None
    if len(nonce) != NONCE_BYTES or not ciphertext:
        raise CryptoError("decrypt_failed")
    try:
        plaintext = AESGCM(key).decrypt(nonce, ciphertext, aad)
    except InvalidTag:
        raise CryptoError("decrypt_failed") from None
    try:
        return plaintext.decode("utf-8")
    except UnicodeDecodeError:
        raise CryptoError("decrypt_failed") from None
