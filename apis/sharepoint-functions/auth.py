from __future__ import annotations

import threading
from collections.abc import Callable, Mapping
from dataclasses import dataclass
from typing import Any

from responses import ERROR_MESSAGES, ErrorKind

__all__ = [
    "TENANT_CLAIM",
    "TENANT_PROFILE_COLLECTION",
    "AuthContext",
    "AuthError",
    "extract_bearer_token",
    "require_firebase_user",
    "resolve_auth_context",
    "initialize_firebase_app",
    "reset_firebase_for_tests",
]

TENANT_CLAIM = "companyId"
TENANT_PROFILE_COLLECTION = "users"

_initialized = False
_init_lock = threading.Lock()


class AuthError(Exception):
    def __init__(self, kind: ErrorKind) -> None:
        self.kind = ErrorKind(kind)
        super().__init__(ERROR_MESSAGES[self.kind])


@dataclass(frozen=True)
class AuthContext:
    uid: str
    email: str | None
    company_id: str
    is_admin: bool
    role: str | None
    claims: dict[str, Any]


def initialize_firebase_app() -> bool:
    global _initialized
    if _initialized:
        return True
    with _init_lock:
        if _initialized:
            return True
        try:
            import firebase_admin

            if not getattr(firebase_admin, "_apps", None):
                firebase_admin.initialize_app()
            _initialized = True
            return True
        except Exception:
            return False


def reset_firebase_for_tests() -> None:
    global _initialized
    with _init_lock:
        _initialized = False


def extract_bearer_token(authorization_header: str | None) -> str:
    if not isinstance(authorization_header, str):
        raise AuthError(ErrorKind.UNAUTHORIZED)
    parts = authorization_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer" or not parts[1]:
        raise AuthError(ErrorKind.UNAUTHORIZED)
    return parts[1]


def require_firebase_user(id_token: str) -> dict[str, Any]:
    try:
        initialize_firebase_app()
        from firebase_admin import auth as firebase_auth

        claims = firebase_auth.verify_id_token(id_token, check_revoked=True)
    except Exception:
        raise AuthError(ErrorKind.UNAUTHORIZED) from None
    if not isinstance(claims, Mapping):
        raise AuthError(ErrorKind.UNAUTHORIZED)
    return dict(claims)


def _default_profile_reader(uid: str) -> Mapping[str, Any]:
    try:
        from firebase_admin import firestore

        snapshot = firestore.client().collection(TENANT_PROFILE_COLLECTION).document(uid).get()
        data = snapshot.to_dict() if hasattr(snapshot, "to_dict") else None
        return dict(data) if isinstance(data, Mapping) else {}
    except Exception:
        return {}


def _nonempty_str(value: Any) -> str:
    return value.strip() if isinstance(value, str) and value.strip() else ""


def resolve_auth_context(
    id_token: str,
    verifier: Callable[[str], Mapping[str, Any]] | None = None,
    profile_reader: Callable[[str], Mapping[str, Any]] | None = None,
) -> AuthContext:
    verify = require_firebase_user if verifier is None else verifier
    try:
        claims = verify(id_token)
    except AuthError:
        raise
    except Exception:
        raise AuthError(ErrorKind.UNAUTHORIZED) from None
    if not isinstance(claims, Mapping):
        raise AuthError(ErrorKind.UNAUTHORIZED)

    uid = _nonempty_str(claims.get("uid"))
    if not uid:
        raise AuthError(ErrorKind.UNAUTHORIZED)

    claim_tenant = _nonempty_str(claims.get(TENANT_CLAIM))
    claim_role = _nonempty_str(claims.get("role"))
    needs_profile = not claim_tenant or "admin" not in claims or not claim_role
    profile: Mapping[str, Any] = {}
    if needs_profile:
        reader = _default_profile_reader if profile_reader is None else profile_reader
        loaded = reader(uid)
        profile = loaded if isinstance(loaded, Mapping) else {}

    company_id = claim_tenant or _nonempty_str(profile.get(TENANT_CLAIM))
    if not company_id:
        raise AuthError(ErrorKind.TENANT_REQUIRED)

    if "admin" in claims:
        is_admin = claims.get("admin") is True
    else:
        is_admin = profile.get("isAdmin") is True
    role = claim_role or _nonempty_str(profile.get("role")) or None
    email = _nonempty_str(claims.get("email")) or None

    return AuthContext(
        uid=uid,
        email=email,
        company_id=company_id,
        is_admin=is_admin,
        role=role,
        claims=dict(claims),
    )
