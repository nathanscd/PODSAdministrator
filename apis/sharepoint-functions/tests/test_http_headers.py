from __future__ import annotations

import json
import sys

import pytest

import responses

FORBIDDEN_SUBSTRINGS = ("traceback", 'file "', ".py", "secret", "token", "sharepoint_")
STATUS_SWEEP = (200, 400, 401, 403, 404, 413, 415, 429, 500)


@pytest.mark.parametrize("kind", list(responses.ErrorKind))
def test_error_body_has_exactly_code_and_message(kind):
    assert len(responses.ErrorKind) == 9
    assert len(responses.ERROR_MESSAGES) == 9
    assert set(responses.ERROR_MESSAGES) == set(responses.ErrorKind)
    status, body, _headers = responses.private_error(kind)
    assert set(body) == {"error"}
    assert set(body["error"]) == {"code", "message"}
    assert body["error"]["code"] == kind.value
    assert body["error"]["message"] == responses.ERROR_MESSAGES[kind]
    assert body["error"]["message"]
    assert 400 <= status < 600


@pytest.mark.parametrize("status", STATUS_SWEEP)
def test_no_store_headers_on_every_status(status):
    returned_status, body, headers = responses.private_json({"ok": True}, status=status)
    assert returned_status == status
    assert body == {"ok": True}
    cache_control = headers["cache-control"]
    assert "no-store" in cache_control
    assert "private" in cache_control
    assert "max-age=0" in cache_control
    assert headers["pragma"] == "no-cache"
    assert headers["expires"] == "0"
    assert headers["x-content-type-options"] == "nosniff"


@pytest.mark.parametrize("kind", list(responses.ErrorKind))
def test_fixed_messages_have_no_internal_detail(kind):
    message = responses.ERROR_MESSAGES[kind]
    lowered = message.lower()
    for needle in FORBIDDEN_SUBSTRINGS:
        assert needle not in lowered, (kind, needle)
    assert "/" not in message
    assert "\\" not in message


def test_chained_cause_text_never_reaches_the_body():
    sentinel = "CAUSE_SENTINEL_7c1f9a3e_NOT_A_CREDENTIAL"
    try:
        try:
            raise ValueError(sentinel)
        except ValueError as cause:
            raise responses.ApiError(responses.ErrorKind.INTERNAL) from cause
    except responses.ApiError as error:
        body = error.to_body()
        rendered = str(error)
    serialized = json.dumps(body)
    assert sentinel not in serialized
    assert sentinel not in rendered
    assert body == responses.private_error(responses.ErrorKind.INTERNAL)[1]


def test_header_constant_is_immutable_and_responses_are_copies():
    with pytest.raises(TypeError):
        responses.PRIVATE_NO_STORE_HEADERS["cache-control"] = "public"
    with pytest.raises(ValueError):
        responses.private_json({"ok": True}, extra_headers={"cache-control": "public"})
    with pytest.raises(ValueError):
        responses.private_json({"ok": True}, extra_headers={"Cache-Control": "public"})
    _status, _body, first = responses.private_json({"ok": True})
    first["cache-control"] = "public"
    _status, _body, second = responses.private_json({"ok": True})
    assert second == dict(responses.PRIVATE_NO_STORE_HEADERS)
    assert second["cache-control"] == responses.PRIVATE_NO_STORE_HEADERS["cache-control"]
    _status, _body, added = responses.private_json(
        {"ok": True}, extra_headers={"x-request-id": "abc"}
    )
    assert added["x-request-id"] == "abc"


def test_retry_after_is_present_only_when_supplied():
    _status, _body, without = responses.private_error(responses.ErrorKind.RATE_LIMITED)
    assert "retry-after" not in without
    status, body, with_retry = responses.private_error(
        responses.ErrorKind.RATE_LIMITED, retry_after_seconds=30
    )
    assert status == 429
    assert body["error"]["code"] == "rate_limited"
    assert with_retry["retry-after"] == "30"


def test_safety_headers_present_predicate():
    assert responses.safety_headers_present({}) is False
    assert responses.safety_headers_present({"cache-control": "no-store"}) is False
    assert responses.safety_headers_present(None) is False
    assert responses.safety_headers_present(dict(responses.PRIVATE_NO_STORE_HEADERS)) is True
    assert responses.safety_headers_present(responses.PRIVATE_NO_STORE_HEADERS) is True
    _status, _body, headers = responses.private_json({"ok": True})
    assert responses.safety_headers_present(headers) is True
    partial = dict(headers)
    del partial["pragma"]
    assert responses.safety_headers_present(partial) is False


def test_to_https_response_reports_missing_firebase_dependency(monkeypatch):
    monkeypatch.setitem(sys.modules, "firebase_functions", None)
    with pytest.raises(RuntimeError, match="firebase_functions"):
        responses.to_https_response(responses.private_json({"ok": True}))
