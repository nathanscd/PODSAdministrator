from __future__ import annotations

import json
import os
from dataclasses import dataclass

from fastapi import HTTPException, Request
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials, firestore, get_app, initialize_app

from .config import settings

_initialized = False
_db: firestore.Client | None = None


@dataclass(frozen=True)
class AuthenticatedUser:
    uid: str
    name: str
    email: str
    is_admin: bool
    role: str


def initialize_firebase() -> bool:
    global _initialized
    if _initialized:
        return True
    try:
        get_app()
        _initialized = True
        return True
    except ValueError:
        pass

    raw_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "").strip()
    credential_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "").strip()
    try:
        if raw_json:
            credential = credentials.Certificate(json.loads(raw_json))
        elif credential_path:
            credential = credentials.Certificate(credential_path)
        else:
            credential = credentials.ApplicationDefault()
        initialize_app(credential, {"projectId": settings.firebase_project_id})
    except Exception:
        return False
    _initialized = True
    return True


def get_db() -> firestore.Client | None:
    global _db
    if not initialize_firebase():
        return None
    if _db is None:
        try:
            _db = firestore.client()
        except Exception:
            return None
    return _db


def is_firebase_configured() -> bool:
    return get_db() is not None


def _claims_to_user(claims: dict[str, object]) -> AuthenticatedUser:
    uid = str(claims.get("uid", ""))
    role = str(claims.get("role", ""))
    is_admin = claims.get("admin") is True or claims.get("isAdmin") is True or role.upper() == "ADMIN"
    return AuthenticatedUser(
        uid=uid,
        name=str(claims.get("name") or claims.get("displayName") or ""),
        email=str(claims.get("email") or ""),
        is_admin=is_admin,
        role=role,
    )


async def require_firebase_user(request: Request) -> AuthenticatedUser:
    header = request.headers.get("authorization", "")
    if not header.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="autenticação necessária")
    token = header[7:].strip()
    if not token:
        raise HTTPException(status_code=401, detail="autenticação necessária")
    try:
        claims = firebase_auth.verify_id_token(token)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="token inválido ou expirado") from exc

    user = _claims_to_user(dict(claims))
    db = get_db()
    if db is not None:
        try:
            profile = db.collection("users").document(user.uid).get().to_dict() or {}
        except Exception:
            profile = {}
        role = str(profile.get("role") or user.role)
        is_admin = bool(profile.get("isAdmin")) or role.upper() == "ADMIN"
        user = AuthenticatedUser(
            uid=user.uid,
            name=str(profile.get("displayName") or user.name),
            email=str(profile.get("email") or user.email),
            is_admin=is_admin,
            role=role,
        )
    return user


def require_write_permission(user: AuthenticatedUser) -> None:
    if user.role.strip().upper() in {"VIEWER", "READONLY", "READ_ONLY", "LEITOR"}:
        raise HTTPException(status_code=403, detail="sem permissão para atribuir chips")
