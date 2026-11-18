"""SEC-01 behavioral proof: the exported endpoints enforce auth and private responses.

The venv deliberately has no firebase_functions runtime, so the existing SEC-01
evidence is AST-structural only. These tests stub that runtime with a capturing
Response object and execute the real @_authenticated-decorated handlers.
"""
from __future__ import annotations

import importlib
import json
import sys
import types
from typing import Any

import pytest

import auth
import config
import responses
import validation


class _FakeResponse:
    """Stand-in for firebase_functions.https.https_fn.Response."""

    def __init__(self, body: str, status: int, headers: dict, mimetype: str | None = None):
        self.body = body
        self.status = status
        self.headers = dict(headers)
        self.mimetype = mimetype

    def json(self) -> Any:
        return json.loads(self.body)


@pytest.fixture
def main_module(monkeypatch):
    https_fn = types.ModuleType("firebase_functions.https.https_fn")
    https_fn.on_request = lambda **_kwargs: (lambda fn: fn)
    https_fn.Response = _FakeResponse

    https_pkg = types.ModuleType("firebase_functions.https")
    https_pkg.https_fn = https_fn

    firebase_functions = types.ModuleType("firebase_functions")
    firebase_functions.https_fn = https_fn
    firebase_functions.https = https_pkg
    firebase_functions.options = types.SimpleNamespace(
        MemoryOption=types.SimpleNamespace(MB_256="MB_256")
    )

    monkeypatch.setitem(sys.modules, "firebase_functions", firebase_functions)
    monkeypatch.setitem(sys.modules, "firebase_functions.https", https_pkg)
    monkeypatch.setitem(sys.modules, "firebase_functions.https.https_fn", https_fn)
    monkeypatch.delitem(sys.modules, "main", raising=False)
    module = importlib.import_module("main")
    monkeypatch.setitem(sys.modules, "main", module)
    try:
        yield module
    finally:
        sys.modules.pop("main", None)


@pytest.fixture
def stub_firestore_client(monkeypatch):
    """Let the handler reach the (stubbed) limiter without a real Firebase app."""
    firebase_admin = types.ModuleType("firebase_admin")
    firebase_admin.firestore = types.SimpleNamespace(client=lambda: object())
    monkeypatch.setitem(sys.modules, "firebase_admin", firebase_admin)
    return firebase_admin


class _Request:
    def __init__(self, headers=None, method="GET", body=None):
        self.headers = dict(headers or {})
        self.method = method
        self._body = body

    def get_json(self, silent=True):
        return self._body


def _context(uid="uid-1", company_id="company-a", **claim_overrides):
    claims = {"uid": uid, "companyId": company_id, **claim_overrides}
    return auth.AuthContext(
        uid=uid,
        email="user@example.test",
        company_id=company_id,
        is_admin=False,
        role=None,
        claims=claims,
    )


def _assert_no_store(response):
    for key, value in responses.PRIVATE_NO_STORE_HEADERS.items():
        assert response.headers[key] == value


def test_missing_header_returns_401_no_store_without_resolving_tenant(main_module, monkeypatch):
    def must_not_resolve(*_args, **_kwargs):
        raise AssertionError("tenant resolution must not run for an unauthenticated request")

    monkeypatch.setattr(main_module.auth, "resolve_auth_context", must_not_resolve)

    response = main_module.sharepoint_me(_Request())

    assert response.status == 401
    assert response.json() == responses.private_error(responses.ErrorKind.UNAUTHORIZED)[1]
    _assert_no_store(response)


@pytest.mark.parametrize("header", ["Basic abc", "Bearer", "Bearer ", "bearer a b"])
def test_malformed_bearer_returns_401_no_store(main_module, header):
    response = main_module.sharepoint_me(_Request(headers={"Authorization": header}))
    assert response.status == 401
    assert response.json()["error"]["code"] == "unauthorized"
    _assert_no_store(response)


def test_tenant_required_from_auth_error_returns_403_no_store(main_module, monkeypatch):
    monkeypatch.setattr(
        main_module.auth, "extract_bearer_token", lambda _header: "token-value"
    )

    def raise_tenant_required(*_args, **_kwargs):
        raise auth.AuthError(responses.ErrorKind.TENANT_REQUIRED)

    monkeypatch.setattr(main_module.auth, "resolve_auth_context", raise_tenant_required)

    response = main_module.sharepoint_me(
        _Request(headers={"Authorization": "Bearer token-value"})
    )

    assert response.status == 403
    assert response.json()["error"]["code"] == "tenant_required"
    _assert_no_store(response)


@pytest.mark.parametrize("method", ["POST", "PUT", "DELETE"])
def test_me_rejects_non_get_with_405_no_store(main_module, monkeypatch, method):
    monkeypatch.setattr(
        main_module.auth, "resolve_auth_context", lambda *_args, **_kwargs: _context()
    )
    response = main_module.sharepoint_me(
        _Request(headers={"Authorization": "Bearer token-value"}, method=method)
    )
    assert response.status == 405
    assert response.json()["error"]["code"] == "invalid_request"
    _assert_no_store(response)


def test_upload_intent_rejects_non_post_with_405_no_store(main_module, monkeypatch):
    monkeypatch.setattr(
        main_module.auth, "resolve_auth_context", lambda *_args, **_kwargs: _context()
    )
    response = main_module.sharepoint_upload_intent(
        _Request(headers={"Authorization": "Bearer token-value"}, method="GET")
    )
    assert response.status == 405
    assert response.json()["error"]["code"] == "invalid_request"
    _assert_no_store(response)


def test_me_success_returns_only_the_auth_projection(main_module, monkeypatch):
    token_sentinel = "RAW_TOKEN_MUST_NOT_APPEAR"
    monkeypatch.setattr(
        main_module.auth,
        "resolve_auth_context",
        lambda *_args, **_kwargs: _context(access_token=token_sentinel),
    )

    response = main_module.sharepoint_me(
        _Request(headers={"Authorization": "Bearer token-value"})
    )

    assert response.status == 200
    body = response.json()
    assert set(body) == {"uid", "email", "companyId", "isAdmin", "role"}
    assert body == {
        "uid": "uid-1",
        "email": "user@example.test",
        "companyId": "company-a",
        "isAdmin": False,
        "role": None,
    }
    assert token_sentinel not in response.body
    _assert_no_store(response)


def test_unhandled_failure_returns_sanitized_500_no_store(main_module, monkeypatch):
    sentinel = "INTERNAL_FAILURE_SENTINEL_4b8d"

    def explode(*_args, **_kwargs):
        raise RuntimeError(sentinel)

    monkeypatch.setattr(main_module.auth, "resolve_auth_context", explode)

    response = main_module.sharepoint_me(
        _Request(headers={"Authorization": "Bearer token-value"})
    )

    assert response.status == 500
    assert response.json() == responses.private_error(responses.ErrorKind.INTERNAL)[1]
    assert sentinel not in response.body
    _assert_no_store(response)


@pytest.mark.parametrize(
    "payload",
    [
        None,
        [],
        {"filename": "a.pdf"},
        {"filename": "../../etc/passwd", "mime": "application/pdf", "size": 10},
        {"filename": "a.exe", "mime": "application/pdf", "size": 10},
    ],
)
def test_invalid_upload_payload_never_constructs_the_rate_limiter(
    main_module, monkeypatch, payload
):
    monkeypatch.setattr(
        main_module.auth, "resolve_auth_context", lambda *_args, **_kwargs: _context()
    )

    def must_not_initialize():
        raise AssertionError("Firestore limiter must not be built before validation passes")

    monkeypatch.setattr(main_module.auth, "initialize_firebase_app", must_not_initialize)

    response = main_module.sharepoint_upload_intent(
        _Request(headers={"Authorization": "Bearer token-value"}, method="POST", body=payload)
    )

    assert response.status == 400
    assert response.json()["error"]["code"] == "invalid_request"
    _assert_no_store(response)


def test_valid_upload_returns_normalized_metadata_and_public_rate_limit(
    main_module, stub_firestore_client, monkeypatch, clean_env
):
    monkeypatch.setattr(
        main_module.auth, "resolve_auth_context", lambda *_args, **_kwargs: _context()
    )
    monkeypatch.setattr(main_module.auth, "initialize_firebase_app", lambda: True)

    decision = validation.RateLimitDecision(
        allowed=True,
        remaining=29,
        reset_at="2026-11-18T00:01:00Z",
        limit=30,
    )

    class _FakeLimiter:
        def __init__(self, client):
            self.client = client

        def check(self, company_id, uid, endpoint):
            assert (company_id, uid, endpoint) == (
                "company-a",
                "uid-1",
                "/sharepoint/upload-intent",
            )
            return decision

    monkeypatch.setattr(main_module.validation, "FirestoreRateLimiter", _FakeLimiter)

    raw_filename = "Report FINAL.pdf"
    response = main_module.sharepoint_upload_intent(
        _Request(
            headers={"Authorization": "Bearer token-value"},
            method="POST",
            body={"filename": raw_filename, "mime": "application/pdf", "size": 10},
        )
    )

    assert response.status == 200
    assert response.json() == {
        "normalizedFilename": "Report_FINAL.pdf",
        "mime": "application/pdf",
        "sizeBytes": 10,
        "maxBytes": config.get_settings().max_upload_bytes,
        "rateLimit": {"remaining": 29, "resetAt": "2026-11-18T00:01:00Z"},
    }
    _assert_no_store(response)


def test_rate_limited_upload_returns_429_no_store_with_retry_after(
    main_module, stub_firestore_client, monkeypatch, clean_env
):
    monkeypatch.setattr(
        main_module.auth, "resolve_auth_context", lambda *_args, **_kwargs: _context()
    )
    monkeypatch.setattr(main_module.auth, "initialize_firebase_app", lambda: True)

    denied = validation.RateLimitDecision(
        allowed=False,
        remaining=0,
        reset_at="2026-11-18T00:01:00Z",
        limit=30,
    )

    class _FakeLimiter:
        def __init__(self, client):
            self.client = client

        def check(self, *_args):
            return denied

    monkeypatch.setattr(main_module.validation, "FirestoreRateLimiter", _FakeLimiter)

    response = main_module.sharepoint_upload_intent(
        _Request(
            headers={"Authorization": "Bearer token-value"},
            method="POST",
            body={"filename": "a.pdf", "mime": "application/pdf", "size": 10},
        )
    )

    assert response.status == 429
    assert response.json()["error"]["code"] == "rate_limited"
    assert "retry-after" in response.headers
    _assert_no_store(response)
