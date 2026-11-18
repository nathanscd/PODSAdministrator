from __future__ import annotations

import json

import logging_utils as L


def test_allow_list_keys_contain_no_sensitive_fragments_except_documented_entries():
    """key_version is a version number, not key material; uid_hash and filename_hash are truncated SHA-256 digests."""
    documented = {"key_version", "uid_hash", "filename_hash"}
    assert documented <= set(L.LOG_ALLOWED_KEYS)
    violations = {
        key
        for key in L.LOG_ALLOWED_KEYS
        if key not in documented
        and any(fragment in key for fragment in L.SENSITIVE_KEY_FRAGMENTS)
    }
    assert violations == set()
    assert isinstance(L.LOG_ALLOWED_KEYS, frozenset)
    assert len(L.LOG_ALLOWED_KEYS) == 15


def test_sensitive_sentinel_values_absent_from_serialized_event():
    sentinels = [
        "SENTINEL_ACCESS_TOKEN",
        "SENTINEL_CLIENT_SECRET",
        "SENTINEL_CIPHERTEXT",
        "SENTINEL_NONCE",
        "SENTINEL_AAD",
    ]
    event = L.build_log_event(
        "upload",
        access_token=sentinels[0],
        client_secret=sentinels[1],
        ciphertext_b64=sentinels[2],
        nonce=sentinels[3],
        aad=sentinels[4],
        endpoint="/me",
    )
    serialized = json.dumps(event)
    for sentinel in sentinels:
        assert sentinel not in serialized
    assert event["fields"] == {"endpoint": "/me"}


def test_nested_dicts_and_lists_are_dropped_not_serialized():
    nested_sentinel = "NESTED_SENTINEL"
    event = L.build_log_event(
        "upload",
        endpoint={"token": nested_sentinel},
        outcome=[nested_sentinel],
    )
    assert event["fields"] == {}
    assert nested_sentinel not in json.dumps(event)
    assert L.redact_value({"a": 1}) == "[redacted]"
    assert L.redact_value([1, 2]) == "[redacted]"


def test_chained_exception_is_redacted_without_message_text():
    message = "EXCEPTION_SENTINEL_DO_NOT_LOG"
    try:
        try:
            raise ValueError(message)
        except ValueError as inner:
            raise RuntimeError("outer failure") from inner
    except RuntimeError as exc:
        chained = exc
    assert L.redact_value(chained) == "[redacted]"
    event = L.build_log_event("failure", error_kind=chained)
    assert message not in json.dumps(event)
    assert event["fields"] == {}


def test_event_is_json_serializable_without_bytes():
    event = L.build_log_event(
        "upload",
        outcome=b"BYTES_SENTINEL",
        size_bytes=12,
        duration_ms=3,
    )
    serialized = json.dumps(event)
    assert "BYTES_SENTINEL" not in serialized
    assert event["fields"] == {"size_bytes": 12, "duration_ms": 3}
    assert set(event) == {"event", "severity", "timestamp", "fields", "schema"}
