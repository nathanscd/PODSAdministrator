from __future__ import annotations

import copy
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from threading import Lock

import pytest

from stores import sharepoint_store as store_module
from stores.sharepoint_store import (
    COL_AUDIT,
    COL_QUEUE,
    COL_RATE_LIMITS,
    COL_SETTINGS,
    COL_TOKENS,
    NotFoundError,
    SharePointStore,
    TenantMismatchError,
)


class _MissingSnapshot:
    exists = False


class _Snapshot:
    def __init__(self, doc_id, data):
        self.id = doc_id
        self.exists = True
        self._data = copy.deepcopy(data)

    def to_dict(self):
        return copy.deepcopy(self._data)


class _Document:
    def __init__(self, client, collection, doc_id):
        self._client = client
        self._collection = collection
        self._doc_id = doc_id

    def get(self):
        with self._client.lock:
            data = self._client.documents.get((self._collection, self._doc_id))
        if data is None:
            return _MissingSnapshot()
        return _Snapshot(self._doc_id, data)

    def set(self, data):
        with self._client.lock:
            self._client.documents[(self._collection, self._doc_id)] = copy.deepcopy(dict(data))


class _Query:
    def __init__(self, client, collection, filters=()):
        self._client = client
        self._collection = collection
        self._filters = tuple(filters)

    def where(self, field, op, value):
        assert op == "=="
        return _Query(self._client, self._collection, self._filters + ((field, value),))

    def limit(self, count):
        return _LimitedQuery(self, count)

    def _matches(self):
        with self._client.lock:
            rows = [
                (key[1], copy.deepcopy(value))
                for key, value in self._client.documents.items()
                if key[0] == self._collection
            ]
        return [
            (doc_id, data)
            for doc_id, data in rows
            if all(data.get(field) == value for field, value in self._filters)
        ]

    def stream(self):
        return iter(_Snapshot(doc_id, data) for doc_id, data in self._matches())

    def get(self):
        return list(self.stream())


class _LimitedQuery:
    def __init__(self, query, count):
        self._query = query
        self._count = max(0, int(count))

    def stream(self):
        return iter(list(self._query.stream())[: self._count])

    def get(self):
        return list(self.stream())


class _Collection:
    def __init__(self, client, name):
        self._client = client
        self._name = name

    def document(self, doc_id):
        return _Document(self._client, self._name, doc_id)

    def where(self, field, op, value):
        return _Query(self._client, self._name).where(field, op, value)


class _FakeFirestoreClient:
    def __init__(self):
        self.documents = {}
        self.lock = Lock()

    def collection(self, name):
        return _Collection(self, name)


def _store():
    client = _FakeFirestoreClient()
    return SharePointStore(client=client), client


def test_settings_round_trip_within_one_tenant():
    store, _ = _store()
    store.save_settings("company-a", {"siteUrl": "https://a.example.test"})
    assert store.get_settings("company-a")["siteUrl"] == "https://a.example.test"


def test_cross_tenant_read_is_not_found_without_leaking_identifiers():
    store, _ = _store()
    store.save_settings("company-a", {"siteUrl": "https://secret.example.test"})
    with pytest.raises(NotFoundError) as exc_info:
        store.get_settings("company-b")
    assert type(exc_info.value) is NotFoundError
    message = str(exc_info.value)
    for leaked in ("company-a", "company-b", "company-a_default", "https://secret.example.test"):
        assert leaked not in message


def test_mis_keyed_document_cannot_be_overwritten():
    store, client = _store()
    key = (COL_SETTINGS, "company-b_default")
    client.documents[key] = {"companyId": "company-a", "siteUrl": "https://original.example.test"}
    with pytest.raises(TenantMismatchError):
        store.save_settings("company-b", {"siteUrl": "https://overwrite.example.test"})
    assert client.documents[key]["siteUrl"] == "https://original.example.test"


def test_document_ids_are_tenant_namespaced_without_raw_uid():
    store, client = _store()
    store.save_settings("company-a", {"k": "a"})
    store.save_settings("company-b", {"k": "b"})
    keys = [key for key in client.documents if key[0] == COL_SETTINGS]
    assert (COL_SETTINGS, "company-a_default") in keys
    assert (COL_SETTINGS, "company-b_default") in keys
    assert store._doc_id("company-a", "x") != store._doc_id("company-b", "x")
    assert all("uid-123" not in key[1] for key in keys)


def test_pending_upload_list_never_crosses_tenant():
    store, client = _store()
    created = "2026-01-01T00:00:00+00:00"
    store.enqueue_upload("company-a", {"id": "upload-a", "createdAt": created})
    store.enqueue_upload("company-b", {"id": "upload-b", "createdAt": created})
    client.documents[(COL_QUEUE, "company-a_stray")] = {
        "companyId": "company-a",
        "status": "pending",
        "createdAt": created,
        "id": "stray",
    }
    items = store.list_pending_uploads("company-b")
    assert [item["id"] for item in items] == ["upload-b"]
    assert all(item["companyId"] == "company-b" for item in items)


def test_missing_token_envelope_raises_not_found():
    store, _ = _store()
    with pytest.raises(NotFoundError):
        store.get_token_envelope("company-a", "graph-refresh-token")
    store.save_token_envelope(
        "company-a", "graph-refresh-token", {"algorithm": "AES-256-GCM", "keyVersion": 1}
    )
    assert store.get_token_envelope("company-a", "graph-refresh-token")["keyVersion"] == 1


def test_concurrent_settings_writes_for_two_tenants_both_persist():
    store, _ = _store()

    def write(tenant):
        store.save_settings(tenant, {"siteUrl": "https://" + tenant + ".example.test"})

    with ThreadPoolExecutor(max_workers=2) as pool:
        list(pool.map(write, ("company-a", "company-b")))
    assert store.get_settings("company-a")["siteUrl"] == "https://company-a.example.test"
    assert store.get_settings("company-b")["siteUrl"] == "https://company-b.example.test"


def test_collection_constants_match_rules_deny_all_block_names():
    rules = (Path(__file__).resolve().parents[3] / "firestore.rules").read_text(encoding="utf-8")
    expected = {
        "sharepointSettings": COL_SETTINGS,
        "sharepointTokens": COL_TOKENS,
        "sharepointQueue": COL_QUEUE,
        "sharepointRateLimits": COL_RATE_LIMITS,
        "sharepointAuditLog": COL_AUDIT,
        "sharepointOAuthTransactions": store_module.COL_OAUTH_TRANSACTIONS,
    }
    for literal, constant in expected.items():
        assert constant == literal
        assert "match /" + literal + "/{docId}" in rules
    assert store_module.TENANT_FIELD == "companyId"


def test_equal_created_at_ordering_is_stable_and_limit_is_after_ordering():
    store, _ = _store()
    created = "2026-01-01T00:00:00+00:00"
    for entry_id in ("upload-b", "upload-a"):
        store.enqueue_upload("company-a", {"id": entry_id, "createdAt": created})
    orders = [
        tuple(item["id"] for item in store.list_pending_uploads("company-a"))
        for _ in range(10)
    ]
    assert all(order == orders[0] for order in orders)
    assert orders[0] == ("upload-a", "upload-b")
    first_ids = [
        store.list_pending_uploads("company-a", limit=1)[0]["id"] for _ in range(10)
    ]
    assert all(first_id == orders[0][0] for first_id in first_ids)
