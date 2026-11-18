"""Shared pytest fixtures for the SharePoint Gen2 test suite."""
from __future__ import annotations

import base64
import os
import sys
from pathlib import Path
from typing import Iterator

import pytest

_CODEBASE_ROOT = Path(__file__).resolve().parents[1]
if sys.path[:1] != [str(_CODEBASE_ROOT)]:
    sys.path.insert(0, str(_CODEBASE_ROOT))

import config  # noqa: E402  (local module; sys.path prepared above)


@pytest.fixture
def clean_env(monkeypatch: pytest.MonkeyPatch) -> Iterator[None]:
    """Remove every SharePoint env var and reset the settings cache."""
    for key in tuple(os.environ):
        if key.startswith("SHAREPOINT_"):
            monkeypatch.delenv(key, raising=False)
    config.reset_settings_for_tests()
    try:
        yield
    finally:
        config.reset_settings_for_tests()


@pytest.fixture
def valid_key_b64() -> str:
    """Base64 of exactly 32 deterministic test bytes (not a real key)."""
    return base64.b64encode(bytes(range(32))).decode("ascii")


@pytest.fixture
def fake_settings() -> config.SharePointSettings:
    """A settings instance with non-secret test identifiers only."""
    return config.SharePointSettings(
        project_id="test-project",
        ms_client_id="test-ms-client-id",
        ms_tenant_id="test-tenant-id",
    )
