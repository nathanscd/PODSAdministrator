"""SEC-03 proof: secrets fail closed with names only and never leak values."""
from __future__ import annotations

import base64
from concurrent.futures import ThreadPoolExecutor

import pytest

import config
import secret_provider as sp

CLIENT_SECRET_ENV = "SHAREPOINT_MS_CLIENT_SECRET"
KEY_ENV = "SHAREPOINT_TOKEN_CRYPTO_KEY_V1"


def test_get_settings_returns_documented_defaults(clean_env):
    """Behavior 1: a clean environment yields the documented defaults."""
    settings = config.get_settings()
    assert settings.max_upload_bytes == 26214400
    assert settings.rate_limit_window_seconds == 60
    assert settings.rate_limit_max_requests == 30
    assert settings.active_crypto_key_version == 1


def test_client_secret_present_and_fail_closed_when_absent(clean_env, monkeypatch):
    """Behavior 2: the injected value is returned; absence fails by name."""
    sentinel = "ms-client-secret-sentinel-4c1d9e"
    monkeypatch.setenv(CLIENT_SECRET_ENV, sentinel)
    assert sp.get_client_secret() == sentinel

    monkeypatch.delenv(CLIENT_SECRET_ENV)
    with pytest.raises(sp.SecretUnavailableError) as exc_info:
        sp.get_client_secret()
    assert str(exc_info.value) == CLIENT_SECRET_ENV


def test_short_key_error_leaks_no_key_material(clean_env, monkeypatch):
    """Behavior 3: a 31-byte key fails with only the env name in the message."""
    material = base64.b64encode(b"q" * 31).decode("ascii")
    monkeypatch.setenv(KEY_ENV, material)

    with pytest.raises(sp.SecretUnavailableError) as exc_info:
        sp.get_crypto_key(1)
    message = str(exc_info.value)
    assert KEY_ENV in message
    for size in range(4, len(material) + 1):
        assert material[:size] not in message
        assert material[-size:] not in message


def test_non_base64_key_raises_typed_error(clean_env, monkeypatch):
    """Behavior 4: malformed base64 becomes SecretUnavailableError."""
    monkeypatch.setenv(KEY_ENV, "not-base64!!!")
    with pytest.raises(sp.SecretUnavailableError) as exc_info:
        sp.get_crypto_key(1)
    assert str(exc_info.value) == KEY_ENV


def test_settings_singleton_and_reset(clean_env):
    """Behavior 5: settings cache is idempotent until explicitly reset."""
    first = config.get_settings()
    assert config.get_settings() is first
    config.reset_settings_for_tests()
    assert config.get_settings() is not first


def test_concurrent_key_reads_are_consistent(clean_env, monkeypatch, valid_key_b64):
    """Behavior 6: 32 parallel reads return equal 32-byte material."""
    monkeypatch.setenv(KEY_ENV, valid_key_b64)

    def read(_index):
        return sp.get_crypto_key(1)

    with ThreadPoolExecutor(max_workers=8) as pool:
        results = list(pool.map(read, range(32)))

    assert len(results) == 32
    assert all(isinstance(item, bytes) and len(item) == 32 for item in results)
    assert all(item == results[0] for item in results)


def test_repr_and_str_never_contain_injected_secret(
    clean_env, monkeypatch, fake_settings
):
    """Behavior 7: no settings or exception representation carries the value."""
    sentinel = "sentinel-secret-value-8b7a2f"
    monkeypatch.setenv(CLIENT_SECRET_ENV, sentinel)
    monkeypatch.setenv(KEY_ENV, "not-base64!!!")

    settings = config.get_settings()
    for text in (repr(settings), str(settings), repr(fake_settings), str(fake_settings)):
        assert sentinel not in text

    with pytest.raises(sp.SecretUnavailableError) as exc_info:
        sp.get_crypto_key(1)
    assert sentinel not in str(exc_info.value)
    assert sentinel not in repr(exc_info.value)

    missing = config.MissingConfigError([CLIENT_SECRET_ENV])
    assert sentinel not in str(missing)
    assert sentinel not in repr(missing)


def test_missing_config_error_lists_only_names(clean_env):
    """Behavior 8: MissingConfigError is a comma-separated name list only."""
    names = ["SHAREPOINT_MS_CLIENT_ID", "SHAREPOINT_MS_TENANT_ID"]
    error = config.MissingConfigError(names)
    assert str(error) == "SHAREPOINT_MS_CLIENT_ID, SHAREPOINT_MS_TENANT_ID"
    assert error.names == tuple(names)
    assert all(name in str(error) for name in names)
