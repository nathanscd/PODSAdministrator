from __future__ import annotations

import pytest

import auth
from responses import ErrorKind

SENTINEL = "SENTINEL_LEAK_MARKER_9f3c1d"


def _claims(**overrides):
    value = {"uid": "uid-1", "email": "user@example.test"}
    value.update(overrides)
    return value


def _verifier(value):
    def verify(_token):
        return value

    return verify


def _expired_error(message):
    try:
        from firebase_admin.auth import ExpiredIdTokenError

        return ExpiredIdTokenError(message)
    except Exception:
        return ValueError(message)


def test_missing_authorization_header_is_unauthorized():
    with pytest.raises(auth.AuthError) as exc_info:
        auth.extract_bearer_token(None)
    assert exc_info.value.kind is ErrorKind.UNAUTHORIZED


def test_malformed_authorization_headers_are_rejected():
    for header in ("Basic abc", "Bearer", "Bearer ", "bearer a b"):
        with pytest.raises(auth.AuthError) as exc_info:
            auth.extract_bearer_token(header)
        assert exc_info.value.kind is ErrorKind.UNAUTHORIZED
        assert "abc" not in str(exc_info.value)
    assert auth.extract_bearer_token("Bearer   validtoken") == "validtoken"


def test_verifier_failures_collapse_to_unauthorized_without_exception_text():
    errors = [ValueError(SENTINEL), _expired_error(SENTINEL)]
    for error in errors:
        def failing_verifier(_token):
            raise error

        with pytest.raises(auth.AuthError) as exc_info:
            auth.resolve_auth_context(
                "token-value",
                verifier=failing_verifier,
                profile_reader=lambda uid: {},
            )
        assert exc_info.value.kind is ErrorKind.UNAUTHORIZED
        assert SENTINEL not in str(exc_info.value)


def test_claim_tenant_wins_over_profile_tenant():
    context = auth.resolve_auth_context(
        "token-value",
        verifier=_verifier(_claims(companyId="claim-tenant")),
        profile_reader=lambda uid: {"companyId": "profile-tenant"},
    )
    assert context.company_id == "claim-tenant"


def test_profile_tenant_used_when_claim_absent():
    context = auth.resolve_auth_context(
        "token-value",
        verifier=_verifier(_claims()),
        profile_reader=lambda uid: {"companyId": "profile-tenant"},
    )
    assert context.company_id == "profile-tenant"


def test_missing_tenant_on_both_sources_is_tenant_required():
    with pytest.raises(auth.AuthError) as exc_info:
        auth.resolve_auth_context(
            "token-value",
            verifier=_verifier(_claims()),
            profile_reader=lambda uid: {},
        )
    assert exc_info.value.kind is ErrorKind.TENANT_REQUIRED


def test_admin_flag_comes_from_claim_then_profile():
    from_claim = auth.resolve_auth_context(
        "token-value",
        verifier=_verifier(_claims(companyId="tenant-a", admin=True)),
        profile_reader=lambda uid: {},
    )
    assert from_claim.is_admin is True
    from_profile = auth.resolve_auth_context(
        "token-value",
        verifier=_verifier(_claims(companyId="tenant-a")),
        profile_reader=lambda uid: {"isAdmin": True},
    )
    assert from_profile.is_admin is True


def test_each_resolution_returns_fresh_context_with_independent_claims():
    verifier = _verifier(_claims(companyId="tenant-a"))
    first = auth.resolve_auth_context(
        "token-value", verifier=verifier, profile_reader=lambda uid: {}
    )
    second = auth.resolve_auth_context(
        "token-value", verifier=verifier, profile_reader=lambda uid: {}
    )
    assert first is not second
    first.claims["injected"] = "value"
    assert "injected" not in second.claims


def test_empty_claim_tenant_falls_back_to_profile():
    context = auth.resolve_auth_context(
        "token-value",
        verifier=_verifier(_claims(companyId="")),
        profile_reader=lambda uid: {"companyId": "profile-tenant"},
    )
    assert context.company_id == "profile-tenant"
