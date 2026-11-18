from __future__ import annotations

import base64
import json
import os
import re
import shutil
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[3]
RULES_PATH = ROOT / "firestore.rules"
INDEX_PATH = ROOT / "firestore.indexes.json"

CLIENT_WRITABLE = [
    "app_versions",
    "assets",
    "companies",
    "daily_goals",
    "departments",
    "monthly_reports",
    "notifications",
    "opportunities",
    "pageCustomizations",
    "pages",
    "personalEvents",
    "quickTasks",
    "reservations",
    "samples",
    "settings",
    "system_logs",
    "system_updates",
    "taskTrackers",
    "teams",
    "users",
    "workspaces",
    "chips",
    "testbooks",
]
DATATEM_READ_ONLY = [
    "chipAssignments",
    "chipAssignmentHistory",
    "manualSimcards",
    "datatemInventory",
    "datatemSyncState",
]
SHAREPOINT_DENY_ALL = [
    "datatemIntegration",
    "sharepointSettings",
    "sharepointTokens",
    "sharepointOAuthTransactions",
    "sharepointQueue",
    "sharepointRateLimits",
    "sharepointAuditLog",
]

MISSING_FIREBASE = shutil.which("firebase") is None
MISSING_JAVA = shutil.which("java") is None
MISSING_FIREBASE_JSON = not (ROOT / "firebase.json").exists()


def _missing_emulator_binaries() -> list[str]:
    missing: list[str] = []
    if MISSING_FIREBASE:
        missing.append("firebase")
    if MISSING_JAVA:
        missing.append("java")
    if MISSING_FIREBASE_JSON:
        missing.append("firebase.json")
    return missing


def _rules_text() -> str:
    return RULES_PATH.read_text(encoding="utf-8")


def _index_data() -> dict:
    return json.loads(INDEX_PATH.read_text(encoding="utf-8"))


def _blocks(text: str) -> dict[str, str]:
    blocks: dict[str, str] = {}
    pattern = re.compile(r"match\s+/([^/\s]+)/\{[^}]*\}\s*\{")
    for match in pattern.finditer(text):
        name = match.group(1)
        if name == "{document=**}":
            blocks[name] = ""
            continue
        start = match.end() - 1
        depth = 0
        end = None
        for index in range(start, len(text)):
            char = text[index]
            if char == "{":
                depth += 1
            elif char == "}":
                depth -= 1
                if depth == 0:
                    end = index + 1
                    break
        if end is None:
            raise AssertionError(f"unclosed block for {name}")
        blocks[name] = text[start:end]
    return blocks


def test_no_wildcard_catch_all_and_no_unconditional_allow():
    text = _rules_text()
    assert "match /{document=**}" not in text
    assert "allow if true" not in text
    assert "allow read, write: if true" not in text
    assert "allow write: if true" not in text


def test_client_writable_blocks_grant_read_and_write_to_signed_in():
    blocks = _blocks(_rules_text())
    for name in CLIENT_WRITABLE:
        assert name in blocks, name
        body = blocks[name]
        assert "allow read, write: if signedIn();" in body, name
    testbooks = blocks["testbooks"]
    assert "match /modules/{moduleId}" in testbooks
    modules = _blocks(testbooks)
    assert "modules" in modules
    assert "allow read, write: if signedIn();" in modules["modules"]


def test_datatem_read_only_blocks_grant_read_and_deny_writes():
    blocks = _blocks(_rules_text())
    for name in DATATEM_READ_ONLY:
        body = blocks[name]
        assert "allow read: if signedIn();" in body, name
        assert "allow write: if false;" in body, name
        assert "allow read, write: if signedIn();" not in body, name


def test_sharepoint_and_datatem_integration_blocks_deny_read_and_write():
    blocks = _blocks(_rules_text())
    for name in SHAREPOINT_DENY_ALL:
        body = blocks[name]
        assert "allow read, write: if false;" in body, name
        assert "allow read: if signedIn();" not in body, name


def test_block_scoped_assertions_do_not_cross_collections():
    blocks = _blocks(_rules_text())
    for name in CLIENT_WRITABLE:
        body = blocks[name]
        for denied in SHAREPOINT_DENY_ALL:
            assert denied not in body, (name, denied)


def test_firestore_indexes_keep_original_and_add_three_sharepoint_composites():
    data = _index_data()
    indexes = data["indexes"]
    assert data["fieldOverrides"] == []

    original = [i for i in indexes if i.get("collectionGroup") == "chipAssignmentHistory"]
    assert len(original) == 1
    assert original[0]["queryScope"] == "COLLECTION"
    assert original[0]["fields"] == [
        {"fieldPath": "datatemSimcardId", "order": "ASCENDING"},
        {"fieldPath": "performedAt", "order": "DESCENDING"},
    ]

    sharepoint = [i for i in indexes if i.get("collectionGroup", "").startswith("sharepoint")]
    assert len(sharepoint) == 3

    expected = [
        (
            "sharepointQueue",
            [
                {"fieldPath": "status", "order": "ASCENDING"},
                {"fieldPath": "createdAt", "order": "ASCENDING"},
            ],
        ),
        (
            "sharepointQueue",
            [
                {"fieldPath": "companyId", "order": "ASCENDING"},
                {"fieldPath": "createdAt", "order": "DESCENDING"},
            ],
        ),
        (
            "sharepointAuditLog",
            [
                {"fieldPath": "companyId", "order": "ASCENDING"},
                {"fieldPath": "occurredAt", "order": "DESCENDING"},
            ],
        ),
    ]
    actual = [(i["collectionGroup"], i["fields"]) for i in sharepoint]
    assert actual == expected

    queue_indexes = [i for i in sharepoint if i["collectionGroup"] == "sharepointQueue"]
    assert all(i["fields"][-1]["fieldPath"] == "createdAt" for i in queue_indexes)


def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _unsigned_jwt(uid: str) -> str:
    header = _b64url(json.dumps({"alg": "none", "typ": "JWT"}).encode("utf-8"))
    payload = _b64url(
        json.dumps({"user_id": uid, "sub": uid, "email": f"{uid}@example.com"}).encode("utf-8")
    )
    return f"{header}.{payload}."


def _firestore_request(
    method: str,
    path: str,
    token: str | None = None,
    body: dict | None = None,
) -> tuple[int, dict]:
    host = os.environ["FIRESTORE_EMULATOR_HOST"]
    project = os.environ.get("GCLOUD_PROJECT") or os.environ.get("FIREBASE_PROJECT") or "demo-pods"
    url = f"http://{host}/v1/projects/{project}/databases/(default)/documents/{path}"
    data = None
    headers = {}
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"
    if token is not None:
        headers["Authorization"] = f"Bearer {token}"
    request = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request) as response:
            raw = response.read().decode("utf-8")
            return response.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as error:
        raw = error.read().decode("utf-8")
        payload = json.loads(raw) if raw else {}
        return error.code, payload


@pytest.mark.skipif(
    bool(_missing_emulator_binaries()),
    reason=f"missing emulator prerequisite: {', '.join(_missing_emulator_binaries())}",
)
def test_emulator_denies_unauthenticated_and_allows_signed_in_reads():
    if not os.environ.get("FIRESTORE_EMULATOR_HOST"):
        pytest.skip("FIRESTORE_EMULATOR_HOST not set")

    unauth_read_status, _ = _firestore_request("GET", "settings/x")
    assert unauth_read_status == 403

    unauth_write_status, _ = _firestore_request(
        "PATCH",
        "sharepointTokens/y",
        body={"fields": {"value": {"stringValue": "x"}}},
    )
    assert unauth_write_status == 403

    signed_in_status, _ = _firestore_request("GET", "settings/x", token=_unsigned_jwt("test-user"))
    assert signed_in_status in (200, 404)
    assert signed_in_status != 403
