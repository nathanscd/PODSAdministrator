from __future__ import annotations

from typing import Protocol

from ..firebase_client import get_db
from .config import DatatemSettings
from .errors import DatatemError
from .models import StoredSession


class TokenStore(Protocol):
    def load(self) -> StoredSession | None: ...

    def save(self, session: StoredSession) -> None: ...

    def clear(self) -> None: ...


class MemoryTokenStore:
    def __init__(self) -> None:
        self._session: StoredSession | None = None

    def load(self) -> StoredSession | None:
        return self._session

    def save(self, session: StoredSession) -> None:
        self._session = session

    def clear(self) -> None:
        self._session = None


class FirestoreTokenStore:
    def __init__(self, settings: DatatemSettings) -> None:
        self._settings = settings

    def _reference(self):
        db = get_db()
        if db is None:
            raise DatatemError.missing_firestore()
        return db.collection(self._settings.token_store_collection).document(
            self._settings.token_store_document
        )

    def load(self) -> StoredSession | None:
        snapshot = self._reference().get()
        if not snapshot.exists:
            return None
        data = snapshot.to_dict() or {}
        try:
            return StoredSession(
                access_token=str(data["access_token"]),
                refresh_token=str(data["refresh_token"]),
                expires_at=float(data["expires_at"]),
                token_type=str(data.get("token_type", "Bearer")),
                scope=str(data.get("scope", "")),
            )
        except (KeyError, TypeError, ValueError):
            return None

    def save(self, session: StoredSession) -> None:
        self._reference().set(session.model_dump())

    def clear(self) -> None:
        self._reference().delete()
