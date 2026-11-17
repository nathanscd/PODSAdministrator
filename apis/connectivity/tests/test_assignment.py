from __future__ import annotations

from typing import Any

from fastapi.testclient import TestClient
from google.api_core.exceptions import Aborted

from fastapi_app.datatem.models import (
    AssignmentDestination,
    AssignmentUpdate,
    ManualSimcardCreate,
    ManualSimcardUpdate,
    ResponsibleActor,
    SimcardRecord,
)
from fastapi_app.main import app
from fastapi_app.routes_datatem import get_datatem_client, get_optional_store, get_simcard_store
from fastapi_app.simcard_store import SimcardStore

ACTOR = ResponsibleActor(uid="uid-1", name="Ana", email="ana@example.com")
OTHER = ResponsibleActor(uid="uid-2", name="Bruno", email="bruno@example.com")
SIM = SimcardRecord(
    id="SIM-1",
    iccid="8955",
    phoneNumber="11999990000",
    operatorName="Vivo",
    operatorNetworkName="NB-IoT",
    apns=["vivo.com.br"],
)
MANUAL = ManualSimcardCreate(
    iccid=" 8955 0000 0001 ",
    technology="nb-iot",
    phoneNumber="11988887777",
    operatorName="Claro",
    notes="Instalado no medidor 42",
)


class FakeSnapshot:
    def __init__(self, data: dict[str, Any] | None) -> None:
        self._data = data

    @property
    def exists(self) -> bool:
        return self._data is not None

    def to_dict(self) -> dict[str, Any] | None:
        return None if self._data is None else dict(self._data)


class FakeDocument:
    def __init__(self, db: "FakeDB", path: str) -> None:
        self._db = db
        self.path = path

    @property
    def id(self) -> str:
        return self.path.split("/", 1)[1]

    def get(self) -> FakeSnapshot:
        return FakeSnapshot(self._db.data.get(self.path))

    def to_dict(self) -> dict[str, Any] | None:
        data = self._db.data.get(self.path)
        return None if data is None else dict(data)

    def set(self, data: dict[str, Any]) -> None:
        self._db.data[self.path] = dict(data)

    def update(self, data: dict[str, Any]) -> None:
        self._db.data.setdefault(self.path, {}).update(data)


class FakeCollection:
    def __init__(self, db: "FakeDB", name: str) -> None:
        self._db = db
        self._name = name

    def document(self, identifier: str | None = None) -> FakeDocument:
        if identifier is None:
            self._db.counter += 1
            identifier = f"auto-{self._db.counter}"
        return FakeDocument(self._db, f"{self._name}/{identifier}")

    def where(self, *args, **kwargs):
        return self

    def order_by(self, *args, **kwargs):
        return self

    def limit(self, _count: int):
        return self

    def stream(self):
        prefix = f"{self._name}/"
        for path in list(self._db.data):
            if path.startswith(prefix):
                yield FakeDocument(self._db, path)


class FakeTransaction:
    def __init__(self, db: "FakeDB", fail_first: bool = False) -> None:
        self._db = db
        self._fail_first = fail_first
        self._read_only = False
        self._max_attempts = 3
        self._id: bytes | None = None
        self.writes: list[tuple[str, str, dict[str, Any] | None]] = []

    def _clean_up(self) -> None:
        self.writes = []
        self._id = None

    def _begin(self, retry_id: bytes | None = None) -> None:
        self._id = retry_id or b"transaction"

    def _commit(self) -> None:
        self.commit()

    def _rollback(self) -> None:
        self._clean_up()

    def get(self, reference: FakeDocument) -> FakeSnapshot:
        return iter((reference.get(),))

    def set(self, reference: FakeDocument, data: dict[str, Any]) -> None:
        self.writes.append(("set", reference.path, dict(data)))

    def update(self, reference: FakeDocument, data: dict[str, Any]) -> None:
        self.writes.append(("update", reference.path, dict(data)))

    def delete(self, reference: FakeDocument) -> None:
        self.writes.append(("delete", reference.path, None))

    def commit(self) -> None:
        if self._fail_first:
            self._fail_first = False
            raise Aborted("concurrent update")
        for kind, path, data in self.writes:
            if kind == "delete":
                self._db.data.pop(path, None)
            elif kind == "set":
                self._db.data[path] = data or {}
            else:
                self._db.data.setdefault(path, {}).update(data or {})


class FakeBatch:
    def __init__(self, db: "FakeDB") -> None:
        self._db = db
        self.writes: list[tuple[str, str, dict[str, Any] | None]] = []

    def set(self, reference: FakeDocument, data: dict[str, Any]) -> None:
        self.writes.append(("set", reference.path, dict(data)))

    def delete(self, reference: FakeDocument) -> None:
        self.writes.append(("delete", reference.path, None))

    def commit(self) -> None:
        for kind, path, data in self.writes:
            if kind == "delete":
                self._db.data.pop(path, None)
            else:
                self._db.data[path] = data or {}


class FakeDB:
    def __init__(self, fail_first: bool = False) -> None:
        self.data: dict[str, dict[str, Any]] = {}
        self.counter = 0
        self._fail_first = fail_first

    def collection(self, name: str) -> FakeCollection:
        return FakeCollection(self, name)

    def transaction(self) -> FakeTransaction:
        transaction = FakeTransaction(self, self._fail_first)
        self._fail_first = False
        return transaction

    def batch(self) -> FakeBatch:
        return FakeBatch(self)


def destination(project: str = "Projeto A") -> AssignmentDestination:
    return AssignmentDestination(
        destinationType="manual_project",
        projectName=project,
        clientName="Cliente",
        equipment="Medidor 1",
    )


def history_events(db: FakeDB) -> list[dict[str, Any]]:
    return [data for path, data in db.data.items() if path.startswith("chipAssignmentHistory/")]


def test_assign_creates_single_current_assignment_and_history():
    db = FakeDB()
    store = SimcardStore(db)
    result = store.assign(SIM, destination(), ACTOR)

    assert result == {"simcardId": "SIM-1", "previousActive": False}
    current = db.data["chipAssignments/SIM-1"]
    assert current["assignmentStatus"] == "assigned"
    assert current["projectName"] == "Projeto A"
    assert current["responsible"]["uid"] == "uid-1"
    assert current["original"]["iccid"] == "8955"
    assert len(history_events(db)) == 1


def test_transfer_preserves_history_and_closes_previous_destination():
    db = FakeDB()
    store = SimcardStore(db)
    store.assign(SIM, destination("Projeto A"), ACTOR)
    result = store.assign(SIM, destination("Projeto B"), OTHER)

    assert result["previousActive"] is True
    current = db.data["chipAssignments/SIM-1"]
    assert current["projectName"] == "Projeto B"
    assert current["responsible"]["uid"] == "uid-2"
    events = history_events(db)
    assert len(events) == 3
    assert {event["type"] for event in events} == {"assigned", "transfer"}
    transfer = next(event for event in events if event["type"] == "transfer")
    assert transfer["destinationFrom"]["projectName"] == "Projeto A"
    assert transfer["destinationTo"]["projectName"] == "Projeto B"


def test_release_keeps_history_and_marks_assignment_inactive():
    db = FakeDB()
    store = SimcardStore(db)
    store.assign(SIM, destination(), ACTOR)
    result = store.release("SIM-1", OTHER)

    assert result["changed"] is True
    current = db.data["chipAssignments/SIM-1"]
    assert current["assignmentStatus"] == "released"
    assert current["releasedBy"]["uid"] == "uid-2"
    assert len(history_events(db)) == 2
    assert store.release("SIM-1", OTHER)["changed"] is False


def test_metadata_update_does_not_change_original_identity_or_responsible():
    db = FakeDB()
    store = SimcardStore(db)
    store.assign(SIM, destination(), ACTOR)
    store.update_metadata(
        "SIM-1",
        AssignmentUpdate(clientName="Novo Cliente", notes="Ajuste"),
        OTHER,
    )

    current = db.data["chipAssignments/SIM-1"]
    assert current["clientName"] == "Novo Cliente"
    assert current["notes"] == "Ajuste"
    assert current["responsible"]["uid"] == "uid-1"
    assert current["iccid"] == "8955"
    assert any(event["type"] == "metadata_updated" for event in history_events(db))


def test_transaction_retry_after_conflict_does_not_duplicate_history():
    db = FakeDB(fail_first=True)
    store = SimcardStore(db)
    store.assign(SIM, destination(), ACTOR)
    assert len(history_events(db)) == 1


def test_manual_creation_and_assignment_are_atomic_with_source_audit():
    db = FakeDB()
    store = SimcardStore(db)
    result = store.create_manual_with_assignment("doc-1", MANUAL, destination(), ACTOR)

    assert result["simcardId"] == "manual:doc-1"
    manual = db.data["manualSimcards/doc-1"]
    assert manual["source"] == "manual"
    assert manual["iccid"] == "895500000001"
    assert manual["technology"] == "NB-IoT"
    assert manual["operatorNetworkName"] == "NB-IoT"
    assignment = db.data["chipAssignments/manual:doc-1"]
    assert assignment["source"] == "manual"
    assert assignment["assignmentStatus"] == "assigned"
    assert {event["type"] for event in history_events(db)} == {"created", "assigned"}
    assert all(event["source"] == "manual" for event in history_events(db))


def test_manual_update_changes_technology_and_keeps_audit():
    db = FakeDB()
    store = SimcardStore(db)
    store.create_manual_with_assignment("doc-1", MANUAL, destination(), ACTOR)
    result = store.update_manual(
        "manual:doc-1",
        ManualSimcardUpdate(technology="LTE", notes="Ajuste de tecnologia"),
        OTHER,
    )

    assert result["changed"] is True
    manual = db.data["manualSimcards/doc-1"]
    assert manual["technology"] == "4G"
    assert manual["operatorNetworkName"] == "4G"
    assert manual["notes"] == "Ajuste de tecnologia"
    assert any(event["type"] == "manual_updated" for event in history_events(db))


def test_manual_delete_releases_active_assignment_and_records_deletion():
    db = FakeDB()
    store = SimcardStore(db)
    store.create_manual_with_assignment("doc-1", MANUAL, destination(), ACTOR)
    result = store.delete_manual("manual:doc-1", OTHER)

    assert result["changed"] is True
    assert "manualSimcards/doc-1" not in db.data
    assert "chipAssignments/manual:doc-1" not in db.data
    assert {"created", "assigned", "released", "deleted"}.issubset(
        {event["type"] for event in history_events(db)}
    )


def test_manual_list_returns_normalized_records():
    db = FakeDB()
    store = SimcardStore(db)
    store.create_manual_with_assignment("doc-1", MANUAL, destination(), ACTOR)

    records = store.list_manual_simcards()

    assert len(records) == 1
    assert records[0].id == "manual:doc-1"
    assert records[0].source == "manual"
    assert records[0].technology == "NB-IoT"


class ExplodingDatatemClient:
    async def get_simcard(self, simcard_id: str) -> SimcardRecord:
        raise AssertionError("assign não deve consultar a DATATEM")


class StubDatatemClient:
    async def list_simcards(self):
        return [], []

    async def get_connections(self):
        return [], {}


def test_inventory_is_persisted_in_firebase_and_replaced():
    db = FakeDB()
    store = SimcardStore(db)
    old = SimcardRecord(id="OLD-1", iccid="0000")
    current = SimcardRecord(id="8379297", iccid="895500000001", operatorName="Vivo")

    store.replace_inventory([old])
    store.replace_inventory([current])

    assert "datatemInventory/OLD-1" not in db.data
    assert db.data["datatemInventory/8379297"]["iccid"] == "895500000001"
    assert store.get_inventory_simcard("8379297") == current


def test_legacy_chips_are_reconciled_to_datatem_or_manual():
    db = FakeDB()
    store = SimcardStore(db)
    legacy_chips = [
        {
            "id": "chip-1",
            "iccid": "8955 0000 0001",
            "phoneNumber": "11 99999-0000",
            "tecnologia": "4G",
            "projeto": "Projeto A",
            "cliente": "Cliente A",
            "equipamento": "Medidor 1",
            "responsavel": "Ana",
        },
        {
            "id": "chip-2",
            "iccid": "895500000002",
            "tecnologia": "NB-IoT",
            "projeto": "Projeto B",
            "responsavel": "Bruno",
        },
    ]
    inventory = [SimcardRecord(id="8379297", iccid="895500000001", phoneNumber="11999990000")]

    result = store.reconcile_legacy_chips(inventory, legacy_chips)

    assert result == {"matched": 1, "manual": 1, "skipped": 0}
    assert db.data["chipAssignments/8379297"]["projectName"] == "Projeto A"
    assert db.data["manualSimcards/legacy-chip-2"]["technology"] == "NB-IoT"
    assert db.data["manualSimcards/legacy-chip-2"]["source"] == "manual"
    assert db.data["chipAssignments/manual:legacy-chip-2"]["projectName"] == "Projeto B"


def test_cors_allows_manual_delete_preflight():
    response = TestClient(app).options(
        "/api/datatem/manual-simcards/manual:doc-1",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "DELETE",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_bootstrap_does_not_require_firebase_token(monkeypatch):
    monkeypatch.setattr("fastapi_app.routes_datatem.get_optional_store", lambda: None)
    monkeypatch.setattr("fastapi_app.routes_datatem.get_datatem_client", lambda: StubDatatemClient())
    app.dependency_overrides[get_optional_store] = lambda: None

    try:
        response = TestClient(app).get("/api/datatem/bootstrap")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["manualSimcards"] == []


def test_assign_endpoint_never_calls_datatem_client():
    db = FakeDB()
    store = SimcardStore(db)
    store.replace_inventory([SimcardRecord(id="8379297", iccid="895500000001", operatorName="Vivo")])
    app.dependency_overrides[get_simcard_store] = lambda: store
    app.dependency_overrides[get_datatem_client] = lambda: ExplodingDatatemClient()

    try:
        response = TestClient(app).post(
            "/api/datatem/simcards/8379297/assign",
            json={
                "destinationType": "manual_project",
                "projectName": "Projeto A",
                "clientName": "Cliente",
                "equipment": "Medidor 1",
                "technology": "4G",
            },
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assignment = db.data["chipAssignments/8379297"]
    assert assignment["assignmentStatus"] == "assigned"
    assert assignment["iccid"] == "895500000001"
