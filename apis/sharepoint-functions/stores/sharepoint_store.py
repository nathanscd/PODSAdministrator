from __future__ import annotations

import uuid
from collections.abc import Mapping
from datetime import datetime, timezone
from typing import Any

COL_SETTINGS = "sharepointSettings"
COL_TOKENS = "sharepointTokens"
COL_OAUTH_TRANSACTIONS = "sharepointOAuthTransactions"
COL_QUEUE = "sharepointQueue"
COL_RATE_LIMITS = "sharepointRateLimits"
COL_AUDIT = "sharepointAuditLog"
TENANT_FIELD = "companyId"
PENDING_STATUS = "pending"
DEFAULT_SETTINGS_ID = "default"

__all__ = [
    "COL_SETTINGS",
    "COL_TOKENS",
    "COL_OAUTH_TRANSACTIONS",
    "COL_QUEUE",
    "COL_RATE_LIMITS",
    "COL_AUDIT",
    "TENANT_FIELD",
    "SharePointStoreError",
    "NotFoundError",
    "TenantMismatchError",
    "SharePointStore",
]


class SharePointStoreError(Exception):
    pass


class NotFoundError(SharePointStoreError):
    def __init__(self) -> None:
        super().__init__("resource_not_found")


class TenantMismatchError(SharePointStoreError):
    def __init__(self) -> None:
        super().__init__("tenant_mismatch")


def _timestamp() -> Any:
    try:
        from google.cloud import firestore

        return firestore.SERVER_TIMESTAMP
    except ImportError:
        return datetime.now(timezone.utc).isoformat()


def _order_key(value: Any) -> tuple[int, Any]:
    if value is None:
        return (0, "")
    if isinstance(value, str):
        return (1, value)
    if isinstance(value, bool):
        return (3, str(value))
    if isinstance(value, (int, float)):
        return (2, value)
    if hasattr(value, "timestamp"):
        return (2, value.timestamp())
    return (3, str(value))


class SharePointStore:
    def __init__(self, client: Any | None = None) -> None:
        self._client = client

    @property
    def _db(self) -> Any:
        if self._client is None:
            from firebase_admin import firestore

            self._client = firestore.client()
        return self._client

    @staticmethod
    def _doc_id(company_id: str, logical_id: str) -> str:
        return f"{company_id}_{logical_id}"

    def _peek(self, collection: str, doc_id: str) -> dict[str, Any] | None:
        snapshot = self._db.collection(collection).document(doc_id).get()
        if not getattr(snapshot, "exists", False):
            return None
        data = snapshot.to_dict()
        return dict(data) if isinstance(data, Mapping) else {}

    def _read(self, collection: str, company_id: str, logical_id: str) -> dict[str, Any]:
        doc_id = self._doc_id(company_id, logical_id)
        data = self._peek(collection, doc_id)
        if data is None or data.get(TENANT_FIELD) != company_id:
            raise NotFoundError()
        return data

    def _write(
        self,
        collection: str,
        company_id: str,
        logical_id: str,
        payload: Mapping[str, Any],
    ) -> dict[str, Any]:
        doc_id = self._doc_id(company_id, logical_id)
        existing = self._peek(collection, doc_id)
        if existing is not None and existing.get(TENANT_FIELD) != company_id:
            raise TenantMismatchError()
        document = dict(payload)
        document[TENANT_FIELD] = company_id
        self._db.collection(collection).document(doc_id).set(document)
        return document

    def get_settings(self, company_id: str) -> dict[str, Any]:
        return self._read(COL_SETTINGS, company_id, DEFAULT_SETTINGS_ID)

    def save_settings(self, company_id: str, payload: Mapping[str, Any]) -> dict[str, Any]:
        existing = self._peek(COL_SETTINGS, self._doc_id(company_id, DEFAULT_SETTINGS_ID))
        if existing is None:
            existing = {}
        if existing.get(TENANT_FIELD, company_id) != company_id:
            raise TenantMismatchError()
        merged: dict[str, Any] = {**existing, **dict(payload)}
        merged[TENANT_FIELD] = company_id
        merged["updatedAt"] = _timestamp()
        return self._write(COL_SETTINGS, company_id, DEFAULT_SETTINGS_ID, merged)

    def get_token_envelope(self, company_id: str, purpose: str) -> dict[str, Any]:
        return self._read(COL_TOKENS, company_id, purpose)

    def save_token_envelope(
        self, company_id: str, purpose: str, envelope: Mapping[str, Any]
    ) -> dict[str, Any]:
        document = dict(envelope)
        document["updatedAt"] = _timestamp()
        return self._write(COL_TOKENS, company_id, purpose, document)

    def enqueue_upload(self, company_id: str, entry: Mapping[str, Any]) -> dict[str, Any]:
        source = dict(entry)
        logical_id = (
            _nonempty_str(source.get("id"))
            or _nonempty_str(source.get("uploadId"))
            or _nonempty_str(source.get("jobId"))
            or uuid.uuid4().hex
        )
        document: dict[str, Any] = {**source}
        document["status"] = PENDING_STATUS
        if not document.get("createdAt"):
            document["createdAt"] = _timestamp()
        return self._write(COL_QUEUE, company_id, logical_id, document)

    def list_pending_uploads(self, company_id: str, limit: int = 20) -> list[dict[str, Any]]:
        query = (
            self._db.collection(COL_QUEUE)
            .where(TENANT_FIELD, "==", company_id)
            .where("status", "==", PENDING_STATUS)
        )
        matches: list[tuple[str, dict[str, Any]]] = []
        for snapshot in query.stream():
            data = snapshot.to_dict()
            if not isinstance(data, Mapping):
                continue
            document = dict(data)
            if document.get(TENANT_FIELD) != company_id:
                continue
            if document.get("status") != PENDING_STATUS:
                continue
            doc_id = str(getattr(snapshot, "id", ""))
            matches.append((doc_id, document))
        matches.sort(key=lambda item: (_order_key(item[1].get("createdAt")), item[0]))
        effective_limit = max(0, int(limit))
        return [document for _, document in matches[:effective_limit]]

    def record_audit_event(self, company_id: str, event: Mapping[str, Any]) -> dict[str, Any]:
        document = dict(event)
        if not document.get("occurredAt"):
            document["occurredAt"] = _timestamp()
        logical_id = uuid.uuid4().hex
        return self._write(COL_AUDIT, company_id, logical_id, document)


def _nonempty_str(value: Any) -> str:
    return str(value).strip() if isinstance(value, str) and value.strip() else ""
