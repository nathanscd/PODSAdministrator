from __future__ import annotations

import base64
from concurrent.futures import ThreadPoolExecutor
from threading import Lock

import pytest

import crypto

TENANT = "company-a"
PURPOSE = "graph-refresh-token"
ENVELOPE_KEYS = {
    "algorithm",
    "keyVersion",
    "nonce_b64",
    "ciphertext_b64",
    "aad",
    "updatedAt",
}

_SHARED_BLOBS: list[crypto.EncryptedBlob] = []
_SHARED_LOCK = Lock()


@pytest.fixture
def key_v1(clean_env, monkeypatch, valid_key_b64):
    monkeypatch.setenv("SHAREPOINT_TOKEN_CRYPTO_KEY_V1", valid_key_b64)
    return valid_key_b64


@pytest.mark.parametrize("plaintext", ["tok", "ação-ñ-東京", ""])
def test_round_trip_exact_plaintext(key_v1, plaintext):
    blob = crypto.encrypt_blob(plaintext, TENANT, PURPOSE)
    assert crypto.decrypt_blob(blob, TENANT, PURPOSE) == plaintext


def test_two_hundred_encryptions_have_distinct_nonces(key_v1):
    nonces = [crypto.encrypt_blob("tok", TENANT, PURPOSE).nonce_b64 for _ in range(200)]
    assert len(set(nonces)) == 200


def test_nonce_length_and_ciphertext_tag(key_v1):
    plaintext = "refresh-token-value"
    blob = crypto.encrypt_blob(plaintext, TENANT, PURPOSE)
    nonce = base64.b64decode(blob.nonce_b64, validate=True)
    ciphertext = base64.b64decode(blob.ciphertext_b64, validate=True)
    assert len(nonce) == crypto.NONCE_BYTES == 12
    assert len(ciphertext) > len(plaintext.encode("utf-8"))


def test_aad_rejects_tenant_and_purpose_substitution(key_v1):
    blob = crypto.encrypt_blob("tok", TENANT, PURPOSE)
    with pytest.raises(crypto.CryptoError):
        crypto.decrypt_blob(blob, "company-b", PURPOSE)
    with pytest.raises(crypto.CryptoError):
        crypto.decrypt_blob(blob, TENANT, "other-purpose")


def test_ciphertext_tamper_raises_sanitized_decrypt_failed(key_v1):
    blob = crypto.encrypt_blob("tok", TENANT, PURPOSE)
    raw = base64.b64decode(blob.ciphertext_b64, validate=True)
    tampered = bytearray(raw)
    tampered[0] ^= 0x01
    envelope = blob.to_dict()
    envelope["ciphertext_b64"] = base64.b64encode(bytes(tampered)).decode("ascii")
    with pytest.raises(crypto.CryptoError) as exc_info:
        crypto.decrypt_blob(envelope, TENANT, PURPOSE)
    message = str(exc_info.value)
    assert message == "decrypt_failed"
    for source in (blob.ciphertext_b64, raw.decode("latin-1")):
        for index in range(len(source) - 7):
            assert source[index : index + 8] not in message


def test_firestore_shaped_dict_round_trip(key_v1):
    plaintext = " Firestore / dict -> blob "
    blob = crypto.encrypt_blob(plaintext, TENANT, PURPOSE)
    document = blob.to_dict()
    assert set(document) == ENVELOPE_KEYS
    restored = crypto.EncryptedBlob.from_dict(document)
    assert restored == blob
    assert crypto.decrypt_blob(document, TENANT, PURPOSE) == plaintext
    assert crypto.decrypt_blob(restored, TENANT, PURPOSE) == plaintext


def test_unknown_key_version_and_unsupported_algorithm(key_v1):
    blob = crypto.encrypt_blob("tok", TENANT, PURPOSE)
    envelope = blob.to_dict()
    envelope["keyVersion"] = 99
    with pytest.raises(crypto.UnknownKeyVersionError) as exc_info:
        crypto.decrypt_blob(envelope, TENANT, PURPOSE)
    assert exc_info.value.key_version == 99
    envelope = blob.to_dict()
    envelope["algorithm"] = "AES-256-CBC"
    with pytest.raises(crypto.CryptoError):
        crypto.decrypt_blob(envelope, TENANT, PURPOSE)


def test_build_aad_validation_and_tenant_binding(key_v1):
    assert crypto.build_aad(TENANT, PURPOSE).startswith("v1|")
    with pytest.raises(crypto.CryptoError):
        crypto.build_aad("", PURPOSE)
    with pytest.raises(crypto.CryptoError):
        crypto.build_aad(TENANT, "")
    assert crypto.build_aad("company-a", PURPOSE) != crypto.build_aad(
        "company-b", PURPOSE
    )


def test_parallel_encryption_nonces_unique_and_decryptable(key_v1):
    _SHARED_BLOBS.clear()
    expected: dict[str, str] = {}

    def worker(worker_id: int) -> None:
        for index in range(50):
            plaintext = f"value-{worker_id}-{index}"
            blob = crypto.encrypt_blob(plaintext, TENANT, PURPOSE)
            with _SHARED_LOCK:
                _SHARED_BLOBS.append(blob)
                expected[blob.nonce_b64] = plaintext

    with ThreadPoolExecutor(max_workers=2) as pool:
        list(pool.map(worker, range(2)))

    assert len(_SHARED_BLOBS) == 100
    nonces = [blob.nonce_b64 for blob in _SHARED_BLOBS]
    assert len(set(nonces)) == 100
    for blob in _SHARED_BLOBS:
        assert crypto.decrypt_blob(blob, TENANT, PURPOSE) == expected[blob.nonce_b64]
