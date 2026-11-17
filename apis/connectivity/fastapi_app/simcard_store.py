from __future__ import annotations

from collections.abc import Callable, Mapping
from typing import TypeVar

from google.api_core.exceptions import Aborted
from google.cloud import firestore

from .datatem.errors import AssignmentConflictError, DatatemError
from .datatem.models import (
    AssignmentDestination,
    AssignmentUpdate,
    ManualSimcardCreate,
    ManualSimcardUpdate,
    ResponsibleActor,
    SimcardRecord,
)
from .legacy import (
    legacy_actor,
    legacy_destination,
    legacy_manual_create,
    legacy_manual_doc_id,
    match_legacy_chips,
)

ASSIGNMENTS_COLLECTION = "chipAssignments"
HISTORY_COLLECTION = "chipAssignmentHistory"
MANUAL_COLLECTION = "manualSimcards"
INVENTORY_COLLECTION = "datatemInventory"
SYNC_STATE_COLLECTION = "datatemSyncState"
LEGACY_COLLECTION = "chips"
ACTIVE_STATUS = "assigned"
RELEASED_STATUS = "released"
T = TypeVar("T")


def _transaction_get(transaction: firestore.Transaction, reference) -> firestore.DocumentSnapshot | None:
    result = transaction.get(reference)
    # Google Cloud Firestore >=2.34 returns a generator; earlier versions return DocumentSnapshot directly
    if hasattr(result, "exists"):
        # DocumentSnapshot from older SDK
        return result
    # Newer SDK – consume first element (if any)
    try:
        return next(iter(result))
    except StopIteration:
        return None


def _chunks(items: list[T], size: int = 450):
    for index in range(0, len(items), size):
        yield items[index:index + size]


def serialize_value(value: object) -> object:
    if hasattr(value, "isoformat"):
        return value.isoformat()
    if isinstance(value, Mapping):
        return {str(key): serialize_value(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [serialize_value(item) for item in value]
    return value


def destination_snapshot(destination: AssignmentDestination) -> dict[str, object]:
    return {
        "destinationType": destination.destinationType,
        "opportunityId": destination.opportunityId,
        "opportunityName": destination.opportunityName,
        "projectName": destination.projectName,
        "clientName": destination.clientName,
        "equipment": destination.equipment,
        "technology": destination.technology,
        "notes": destination.notes,
    }


def simcard_snapshot(simcard: SimcardRecord) -> dict[str, object]:
    return {
        "simcardId": simcard.id,
        "datatemSimcardId": simcard.id,
        "source": simcard.source,
        "notes": simcard.notes,
        "iccid": simcard.iccid,
        "phoneNumber": simcard.phoneNumber,
        "operatorName": simcard.operatorName,
        "operatorId": simcard.operatorId,
        "operatorNetworkName": simcard.operatorNetworkName,
        "apn": simcard.apns,
    }


def build_assignment_document(
    simcard: SimcardRecord,
    destination: AssignmentDestination,
    actor: ResponsibleActor,
) -> dict[str, object]:
    snapshot = simcard_snapshot(simcard)
    return {
        **snapshot,
        "original": dict(snapshot),
        "assignmentStatus": ACTIVE_STATUS,
        **destination_snapshot(destination),
        "responsible": actor.model_dump(),
        "assignedBy": actor.model_dump(),
        "assignedAt": firestore.SERVER_TIMESTAMP,
        "updatedAt": firestore.SERVER_TIMESTAMP,
        "updatedBy": actor.model_dump(),
        "releasedAt": None,
        "releasedBy": None,
        "source": simcard.source,
        "schemaVersion": 2,
    }


def build_history_event(
    event_type: str,
    simcard: SimcardRecord | Mapping[str, object],
    actor: ResponsibleActor,
    *,
    destination_from: Mapping[str, object] | None = None,
    destination_to: Mapping[str, object] | None = None,
    details: Mapping[str, object] | None = None,
) -> dict[str, object]:
    if isinstance(simcard, SimcardRecord):
        identity: dict[str, object] = {
            "simcardId": simcard.id,
            "datatemSimcardId": simcard.id,
            "source": simcard.source,
            "iccid": simcard.iccid,
            "phoneNumber": simcard.phoneNumber,
            "operatorName": simcard.operatorName,
        }
    else:
        identity = {
            "simcardId": simcard.get("simcardId") or simcard.get("datatemSimcardId"),
            "datatemSimcardId": simcard.get("datatemSimcardId"),
            "source": simcard.get("source", "datatem"),
            "iccid": simcard.get("iccid"),
            "phoneNumber": simcard.get("phoneNumber"),
            "operatorName": simcard.get("operatorName"),
        }
    return {
        "type": event_type,
        **identity,
        "destinationFrom": dict(destination_from) if destination_from else None,
        "destinationTo": dict(destination_to) if destination_to else None,
        "details": dict(details) if details else {},
        "performedBy": actor.model_dump(),
        "performedAt": firestore.SERVER_TIMESTAMP,
        "schemaVersion": 1,
    }


def build_manual_simcard(doc_id: str, payload: ManualSimcardCreate) -> SimcardRecord:
    return SimcardRecord(
        id=f"manual:{doc_id}",
        source="manual",
        iccid=payload.iccid,
        phoneNumber=payload.phoneNumber,
        operatorName=payload.operatorName,
        operatorNetworkName=payload.technology,
        technology=payload.technology,
        lifecycleState="active",
        statusName="Cadastro manual",
        notes=payload.notes,
    )


def manual_doc_id(simcard_id: str) -> str:
    return simcard_id.split(":", 1)[1] if simcard_id.startswith("manual:") else simcard_id


def serialize_assignment(doc_id: str, data: Mapping[str, object]) -> dict[str, object]:
    result = {"simcardId": doc_id, **dict(data)}
    return {key: serialize_value(value) for key, value in result.items()}


class SimcardStore:
    def __init__(self, db: firestore.Client) -> None:
        self._db = db

    def _run_transaction(self, operation: Callable[[firestore.Transaction], T]) -> T:
        try:
            return firestore.transactional(operation)(self._db.transaction())
        except ValueError as exc:
            if isinstance(exc.__cause__, Aborted):
                raise AssignmentConflictError() from None
            raise

    def get_assignments(self) -> dict[str, dict[str, object]]:
        docs = self._db.collection(ASSIGNMENTS_COLLECTION).stream()
        return {
            doc.id: serialize_assignment(doc.id, doc.to_dict() or {})
            for doc in docs
        }

    def get_history(self, limit: int = 100, simcard_id: str | None = None) -> list[dict[str, object]]:
        query = self._db.collection(HISTORY_COLLECTION)
        if simcard_id:
            query = query.where("datatemSimcardId", "==", simcard_id)
        query = query.order_by("performedAt", direction=firestore.Query.DESCENDING).limit(limit)
        return [
            {key: serialize_value(value) for key, value in (doc.to_dict() or {}).items()}
            | {"id": doc.id}
            for doc in query.stream()
        ]

    def get_legacy_chips(self, limit: int = 500) -> list[dict[str, object]]:
        docs = self._db.collection(LEGACY_COLLECTION).limit(limit).stream()
        return [{"id": doc.id, **(doc.to_dict() or {})} for doc in docs]

    def reconcile_legacy_chips(
        self,
        simcards: list[SimcardRecord],
        legacy_chips: list[dict[str, object]],
    ) -> dict[str, int]:
        matched, unmatched = match_legacy_chips(legacy_chips, simcards)
        assignments = self.get_assignments()
        manual_records = self.list_manual_simcards()
        manual_iccids = {
            "".join(character for character in str(record.iccid or "") if character.isdigit())
            for record in manual_records
        }
        result = {"matched": 0, "manual": 0, "skipped": 0}

        for chip, simcard in matched:
            if simcard.id in assignments:
                result["skipped"] += 1
                continue
            self.assign(simcard, legacy_destination(chip), legacy_actor(chip))
            result["matched"] += 1

        for chip in unmatched:
            payload = legacy_manual_create(chip)
            doc_id = legacy_manual_doc_id(chip)
            simcard_id = f"manual:{doc_id}"
            iccid_key = "".join(character for character in payload.iccid if character.isdigit())
            if simcard_id in assignments or self.get_manual_simcard(simcard_id) is not None or iccid_key in manual_iccids:
                result["skipped"] += 1
                continue
            self.create_manual_with_assignment(doc_id, payload, legacy_destination(chip), legacy_actor(chip))
            result["manual"] += 1
            manual_iccids.add(iccid_key)

        return result

    def list_manual_simcards(self) -> list[SimcardRecord]:
        records: list[SimcardRecord] = []
        for doc in self._db.collection(MANUAL_COLLECTION).stream():
            data = doc.to_dict() or {}
            records.append(SimcardRecord.model_validate({**data, "id": data.get("id") or f"manual:{doc.id}"}))
        return records

    def get_manual_simcard(self, simcard_id: str) -> SimcardRecord | None:
        if not simcard_id.startswith("manual:"):
            return None
        snapshot = self._db.collection(MANUAL_COLLECTION).document(manual_doc_id(simcard_id)).get()
        data = snapshot.to_dict()
        if not snapshot.exists or not data:
            return None
        return SimcardRecord.model_validate({**data, "id": simcard_id})

    def list_inventory(self) -> list[SimcardRecord]:
        records: list[SimcardRecord] = []
        for doc in self._db.collection(INVENTORY_COLLECTION).stream():
            data = doc.to_dict() or {}
            records.append(SimcardRecord.model_validate({**data, "id": data.get("id") or doc.id}))
        return records

    def get_inventory_simcard(self, simcard_id: str) -> SimcardRecord | None:
        snapshot = self._db.collection(INVENTORY_COLLECTION).document(simcard_id).get()
        data = snapshot.to_dict()
        if not snapshot.exists or not data:
            return None
        return SimcardRecord.model_validate({**data, "id": simcard_id})

    def replace_inventory(self, items: list[SimcardRecord]) -> None:
        collection = self._db.collection(INVENTORY_COLLECTION)
        by_id = {item.id: item for item in items}
        existing_ids = {doc.id for doc in collection.stream()}
        operations: list[tuple[str, str, dict[str, object] | None]] = [
            ("delete", doc_id, None) for doc_id in existing_ids - set(by_id)
        ]
        operations.extend(
            ("set", simcard_id, item.model_dump())
            for simcard_id, item in by_id.items()
        )
        for chunk in _chunks(operations):
            batch = self._db.batch()
            for kind, doc_id, data in chunk:
                reference = collection.document(doc_id)
                if kind == "delete":
                    batch.delete(reference)
                else:
                    batch.set(reference, data or {})
            batch.commit()

    def get_inventory_synced_at(self) -> str | None:
        snapshot = self._db.collection(SYNC_STATE_COLLECTION).document("status").get()
        data = snapshot.to_dict() or {}
        value = data.get("lastSyncedAt")
        if value is None:
            return None
        if hasattr(value, "isoformat"):
            return str(value.isoformat())
        return str(value)

    def set_inventory_synced_at(self, synced_at: str, count: int) -> None:
        self._db.collection(SYNC_STATE_COLLECTION).document("status").set(
            {"lastSyncedAt": synced_at, "count": count}
        )

    def create_manual_with_assignment(
        self,
        doc_id: str,
        payload: ManualSimcardCreate,
        destination: AssignmentDestination,
        actor: ResponsibleActor,
    ) -> dict[str, object]:
        manual_ref = self._db.collection(MANUAL_COLLECTION).document(doc_id)
        assignment_ref = self._db.collection(ASSIGNMENTS_COLLECTION).document(f"manual:{doc_id}")

        def operation(transaction: firestore.Transaction) -> dict[str, object]:
            if _transaction_get(transaction, manual_ref).exists:
                raise AssignmentConflictError()
            simcard = build_manual_simcard(doc_id, payload)
            transaction.set(
                manual_ref,
                {
                    **simcard.model_dump(),
                    "createdAt": firestore.SERVER_TIMESTAMP,
                    "createdBy": actor.model_dump(),
                    "updatedAt": firestore.SERVER_TIMESTAMP,
                    "updatedBy": actor.model_dump(),
                },
            )
            transaction.set(
                assignment_ref,
                build_assignment_document(simcard, destination, actor),
            )
            transaction.set(
                self._db.collection(HISTORY_COLLECTION).document(),
                build_history_event(
                    "created",
                    simcard,
                    actor,
                    details={"reason": "manual_simcard_created", "source": "manual"},
                ),
            )
            transaction.set(
                self._db.collection(HISTORY_COLLECTION).document(),
                build_history_event(
                    "assigned",
                    simcard,
                    actor,
                    destination_to=destination_snapshot(destination),
                    details={"replacedActiveAssignment": False},
                ),
            )
            return {"simcardId": simcard.id, "simcard": simcard.model_dump()}

        return self._run_transaction(operation)

    def update_manual(
        self,
        simcard_id: str,
        update: ManualSimcardUpdate,
        actor: ResponsibleActor,
    ) -> dict[str, object]:
        changes = update.model_dump(exclude_unset=True)
        if "technology" in changes:
            changes["operatorNetworkName"] = changes["technology"]
        if not changes:
            return {"simcardId": simcard_id, "changed": False}
        manual_ref = self._db.collection(MANUAL_COLLECTION).document(manual_doc_id(simcard_id))

        def operation(transaction: firestore.Transaction) -> dict[str, object]:
            snapshot = _transaction_get(transaction, manual_ref)
            if not snapshot.exists:
                raise DatatemError.not_found_manual()
            current = snapshot.to_dict() or {}
            before = {key: current.get(key) for key in changes}
            transaction.update(
                manual_ref,
                {
                    **changes,
                    "updatedAt": firestore.SERVER_TIMESTAMP,
                    "updatedBy": actor.model_dump(),
                },
            )
            updated = SimcardRecord.model_validate({**current, **changes, "id": simcard_id})
            transaction.set(
                self._db.collection(HISTORY_COLLECTION).document(),
                build_history_event(
                    "manual_updated",
                    updated,
                    actor,
                    details={"before": before, "after": changes},
                ),
            )
            return {"simcardId": simcard_id, "changed": True, "simcard": updated.model_dump()}

        return self._run_transaction(operation)

    def delete_manual(self, simcard_id: str, actor: ResponsibleActor) -> dict[str, object]:
        manual_ref = self._db.collection(MANUAL_COLLECTION).document(manual_doc_id(simcard_id))
        assignment_ref = self._db.collection(ASSIGNMENTS_COLLECTION).document(simcard_id)

        def operation(transaction: firestore.Transaction) -> dict[str, object]:
            snapshot = _transaction_get(transaction, manual_ref)
            if not snapshot.exists:
                raise DatatemError.not_found_manual()
            current = snapshot.to_dict() or {}
            simcard = SimcardRecord.model_validate({**current, "id": simcard_id})
            assignment_snapshot = _transaction_get(transaction, assignment_ref)
            if assignment_snapshot.exists:
                assignment = assignment_snapshot.to_dict() or {}
                if assignment.get("assignmentStatus") == ACTIVE_STATUS:
                    destination_from = {
                        key: assignment.get(key)
                        for key in (
                            "destinationType",
                            "opportunityId",
                            "opportunityName",
                            "projectName",
                            "clientName",
                            "equipment",
                        )
                    }
                    transaction.set(
                        self._db.collection(HISTORY_COLLECTION).document(),
                        build_history_event(
                            "released",
                            assignment,
                            actor,
                            destination_from=destination_from,
                            details={"reason": "manual_simcard_deleted"},
                        ),
                    )
                transaction.delete(assignment_ref)
            transaction.set(
                self._db.collection(HISTORY_COLLECTION).document(),
                build_history_event(
                    "deleted",
                    simcard,
                    actor,
                    details={"reason": "manual_simcard_deleted", "source": "manual"},
                ),
            )
            transaction.delete(manual_ref)
            return {"simcardId": simcard_id, "changed": True}

        return self._run_transaction(operation)

    def assign(
        self,
        simcard: SimcardRecord,
        destination: AssignmentDestination,
        actor: ResponsibleActor,
    ) -> dict[str, object]:
        assignment_ref = self._db.collection(ASSIGNMENTS_COLLECTION).document(simcard.id)

        def operation(transaction: firestore.Transaction) -> dict[str, object]:
            snapshot = _transaction_get(transaction, assignment_ref)
            previous = snapshot.to_dict() if snapshot.exists else None
            previous_is_active = bool(previous and previous.get("assignmentStatus") == ACTIVE_STATUS)

            if previous_is_active:
                previous_destination = {
                    key: previous.get(key)
                    for key in (
                        "destinationType",
                        "opportunityId",
                        "opportunityName",
                        "projectName",
                        "clientName",
                        "equipment",
                    )
                }
                history_ref = self._db.collection(HISTORY_COLLECTION).document()
                transaction.set(
                    history_ref,
                    build_history_event(
                        "transfer",
                        simcard,
                        actor,
                        destination_from=previous_destination,
                        destination_to=destination_snapshot(destination),
                        details={"reason": "transfer_to_new_destination"},
                    ),
                )

            transaction.set(
                assignment_ref,
                build_assignment_document(simcard, destination, actor),
            )

            history_ref = self._db.collection(HISTORY_COLLECTION).document()
            transaction.set(
                history_ref,
                build_history_event(
                    "assigned",
                    simcard,
                    actor,
                    destination_to=destination_snapshot(destination),
                    details={"replacedActiveAssignment": previous_is_active},
                ),
            )
            return {"simcardId": simcard.id, "previousActive": previous_is_active}

        return self._run_transaction(operation)

    def release(self, simcard_id: str, actor: ResponsibleActor) -> dict[str, object]:
        assignment_ref = self._db.collection(ASSIGNMENTS_COLLECTION).document(simcard_id)

        def operation(transaction: firestore.Transaction) -> dict[str, object]:
            snapshot = _transaction_get(transaction, assignment_ref)
            if not snapshot.exists:
                return {"simcardId": simcard_id, "changed": False}
            current = snapshot.to_dict() or {}
            if current.get("assignmentStatus") != ACTIVE_STATUS:
                return {"simcardId": simcard_id, "changed": False}
            destination_from = {
                key: current.get(key)
                for key in (
                    "destinationType",
                    "opportunityId",
                    "opportunityName",
                    "projectName",
                    "clientName",
                    "equipment",
                )
            }
            transaction.update(
                assignment_ref,
                {
                    "assignmentStatus": RELEASED_STATUS,
                    "releasedAt": firestore.SERVER_TIMESTAMP,
                    "releasedBy": actor.model_dump(),
                    "updatedAt": firestore.SERVER_TIMESTAMP,
                    "updatedBy": actor.model_dump(),
                },
            )
            transaction.set(
                self._db.collection(HISTORY_COLLECTION).document(),
                build_history_event(
                    "released",
                    current,
                    actor,
                    destination_from=destination_from,
                    details={"reason": "manual_release"},
                ),
            )
            return {"simcardId": simcard_id, "changed": True}

        return self._run_transaction(operation)

    def update_metadata(
        self,
        simcard_id: str,
        update: AssignmentUpdate,
        actor: ResponsibleActor,
    ) -> dict[str, object]:
        assignment_ref = self._db.collection(ASSIGNMENTS_COLLECTION).document(simcard_id)
        changes = update.model_dump(exclude_none=True)
        if not changes:
            return {"simcardId": simcard_id, "changed": False}

        def operation(transaction: firestore.Transaction) -> dict[str, object]:
            snapshot = _transaction_get(transaction, assignment_ref)
            if not snapshot.exists or (snapshot.to_dict() or {}).get("assignmentStatus") != ACTIVE_STATUS:
                raise DatatemError.not_found_assignment()
            current = snapshot.to_dict() or {}
            before = {key: current.get(key) for key in changes}
            transaction.update(
                assignment_ref,
                {
                    **changes,
                    "updatedAt": firestore.SERVER_TIMESTAMP,
                    "updatedBy": actor.model_dump(),
                },
            )
            transaction.set(
                self._db.collection(HISTORY_COLLECTION).document(),
                build_history_event(
                    "metadata_updated",
                    current,
                    actor,
                    details={"before": before, "after": changes},
                ),
            )
            return {"simcardId": simcard_id, "changed": True}

        return self._run_transaction(operation)
