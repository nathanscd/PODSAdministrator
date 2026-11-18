from __future__ import annotations

import threading
from concurrent.futures import ThreadPoolExecutor

import pytest
from config import SharePointSettings
from responses import ErrorKind

import validation as v


@pytest.mark.parametrize(
    "raw,expected",
    [
        ("..", None),
        (".", None),
        ("C:\\Users\\a\\..\\b\\Report FINAL.pdf", "Report_FINAL.pdf"),
        ("/etc/passwd", "passwd"),
        ("bad\x00name\x1f.pdf", "badname.pdf"),
        ("a" * 300 + ".pdf", "a" * 200 + ".pdf"),
        ("report.tar.gz", "report.tar.gz"),
        ("Résumé 最终.pdf", "Résumé_最终.pdf"),
    ],
)
def test_normalization_table(raw, expected):
    if expected is None:
        with pytest.raises(v.UploadValidationError) as exc:
            v.normalize_filename(raw)
        assert exc.value.kind is ErrorKind.INVALID_REQUEST
        return
    assert v.normalize_filename(raw) == expected


def test_mime_parameters_are_stripped():
    metadata = v.validate_upload_metadata(
        "a.pdf", "application/pdf; charset=binary", 10
    )
    assert metadata.mime == "application/pdf"
    assert metadata.extension == "pdf"
    assert metadata.normalized_filename == "a.pdf"


@pytest.mark.parametrize(
    "mime",
    [
        "image/" + "svg+xml",
        "text/" + "html",
        "application/zip",
        "application/javascript",
        "application/x-msdownload",
    ],
)
def test_disallowed_mime_rejected_without_echo(mime):
    with pytest.raises(v.UploadValidationError) as exc:
        v.validate_upload_metadata("a.pdf", mime, 10)
    assert exc.value.kind is ErrorKind.UNSUPPORTED_MEDIA_TYPE
    assert mime not in str(exc.value)


@pytest.mark.parametrize(
    "filename,mime",
    [
        ("a.exe", "application/pdf"),
        ("a.docx", "image/png"),
        ("a.pdf", "text/plain"),
    ],
)
def test_extension_mime_disagreement_rejected(filename, mime):
    with pytest.raises(v.UploadValidationError) as exc:
        v.validate_upload_metadata(filename, mime, 10)
    assert exc.value.kind is ErrorKind.INVALID_REQUEST


def test_in_memory_limiter_exact_under_32_threads():
    limiter = v.InMemoryRateLimiter(limit=10, window_seconds=60)
    decisions: list[v.RateLimitDecision] = []
    lock = threading.Lock()

    def attempt(_index: int) -> v.RateLimitDecision:
        decision = limiter.check("company", "uid", "/upload")
        with lock:
            decisions.append(decision)
        return decision

    with ThreadPoolExecutor(max_workers=32) as pool:
        results = list(pool.map(attempt, range(32)))

    granted = [decision for decision in results if decision.allowed]
    denied = [decision for decision in results if not decision.allowed]
    assert len(decisions) == 32
    assert len(granted) == 10
    assert len(denied) == 22
    assert all(decision.remaining == 0 for decision in denied)
    assert all(decision.remaining >= 0 for decision in results)


def test_budgets_are_isolated_by_endpoint_and_tenant():
    limiter = v.InMemoryRateLimiter(limit=1, window_seconds=60)
    assert limiter.check("company", "uid", "/a").allowed
    assert not limiter.check("company", "uid", "/a").allowed
    assert limiter.check("company", "uid", "/b").allowed
    assert limiter.check("other-company", "uid", "/a").allowed


class _RaisingClient:
    def transaction(self):
        raise RuntimeError("backend unavailable")


def test_firestore_limiter_fails_closed_on_backend_error():
    settings = SharePointSettings(
        project_id="test-project",
        ms_client_id="test-client",
        ms_tenant_id="test-tenant",
    )
    limiter = v.FirestoreRateLimiter(_RaisingClient(), settings=settings)
    with pytest.raises(v.RateLimitUnavailable):
        limiter.check("company", "uid", "/upload")


def test_numeric_contract_and_window_index(monkeypatch):
    maximum = v.MAX_UPLOAD_BYTES
    assert (
        v.validate_upload_metadata("a.pdf", "application/pdf", maximum).size_bytes
        == maximum
    )
    with pytest.raises(v.UploadValidationError) as exc:
        v.validate_upload_metadata("a.pdf", "application/pdf", maximum + 1)
    assert exc.value.kind is ErrorKind.PAYLOAD_TOO_LARGE
    for invalid_size in (10.5, True):
        with pytest.raises(v.UploadValidationError):
            v.validate_upload_metadata("a.pdf", "application/pdf", invalid_size)

    class FakeSnapshot:
        exists = True

        def __init__(self, data):
            self._data = data

        def to_dict(self):
            return dict(self._data)

    class FakeTransaction:
        _read_only = False
        _max_attempts = 1
        _id = None

        def __init__(self, data):
            self.data = data
            self.writes: list[dict] = []

        def _clean_up(self):
            pass

        def _begin(self, retry_id=None):
            pass

        def _commit(self):
            pass

        def get(self, reference):
            return FakeSnapshot(self.data)

        def set(self, reference, data):
            self.writes.append(dict(data))

    class FakeCollection:
        def __init__(self, transaction):
            self.transaction = transaction

        def document(self, document_id):
            return document_id

    class FakeClient:
        def __init__(self, transaction):
            self.transaction_object = transaction

        def collection(self, name):
            assert name == v.RATE_LIMIT_COLLECTION
            return FakeCollection(self.transaction_object)

        def transaction(self):
            return self.transaction_object

    settings = SharePointSettings(
        project_id="test-project",
        ms_client_id="test-client",
        ms_tenant_id="test-tenant",
    )
    monkeypatch.setattr(v.time, "time", lambda: 1_000_000)
    over_count = FakeTransaction({"count": 99, "windowStart": 999960})
    over_decision = v.FirestoreRateLimiter(
        FakeClient(over_count), settings=settings
    ).check("company", "uid", "/upload")
    assert over_decision.allowed is False
    assert over_decision.remaining == 0
    assert over_count.writes[-1]["count"] == 99
    assert over_decision.to_public_dict() == {
        "remaining": 0,
        "resetAt": over_decision.reset_at,
    }

    same_window = FakeTransaction({"count": 1, "windowStart": 999960})
    limiter = v.FirestoreRateLimiter(FakeClient(same_window), settings=settings)
    limiter.check("company", "uid", "/upload")
    limiter.check("company", "uid", "/upload")
    assert [write["windowStart"] for write in same_window.writes] == [999960, 999960]
    monkeypatch.setattr(v.time, "time", lambda: 1_000_060)
    limiter.check("company", "uid", "/upload")
    assert same_window.writes[-1]["windowStart"] == 1000020
    assert len(v.rate_limit_key("u", "/x", 0)) == 64
