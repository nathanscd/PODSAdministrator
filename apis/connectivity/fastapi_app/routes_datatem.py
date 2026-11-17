from __future__ import annotations

import asyncio
import uuid
from collections.abc import Mapping
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query

from .datatem.client import DatatemClient
from .datatem.config import DatatemSettings
from .datatem.errors import AssignmentConflictError, DatatemError, DatatemErrorKind
from .datatem.models import (
    AssignmentDestination,
    AssignmentUpdate,
    BootstrapPayload,
    ConnectionRecord,
    ConnectionsPayload,
    InventoryPayload,
    ManualSimcardRequest,
    ManualSimcardUpdate,
    ResponsibleActor,
    SimcardRecord,
)
from .firebase_client import get_db
from .legacy import match_legacy_metadata
from .simcard_store import SimcardStore

router = APIRouter(tags=["datatem"])
datatem_settings = DatatemSettings.from_env()
_client: DatatemClient | None = None
_legacy_migration_done = False
SYSTEM_ACTOR = ResponsibleActor(
    uid="datatem-integration",
    name="PODSAdministrator",
    email="datatem@podsadministrator.local",
)


def get_datatem_client() -> DatatemClient:
    global _client
    if _client is None:
        _client = DatatemClient(datatem_settings)
    return _client


def set_datatem_client(client: DatatemClient | None) -> None:
    global _client
    _client = client


def get_optional_store() -> SimcardStore | None:
    db = get_db()
    return SimcardStore(db) if db is not None else None


def get_simcard_store() -> SimcardStore:
    store = get_optional_store()
    if store is None:
        raise HTTPException(status_code=503, detail="Firestore não está disponível.")
    return store


def _http_error(error: DatatemError) -> HTTPException:
    status = 404 if error.kind == DatatemErrorKind.NOT_FOUND else 502
    if error.kind in {DatatemErrorKind.UNAVAILABLE, DatatemErrorKind.NOT_CONFIGURED}:
        status = 503
    return HTTPException(
        status_code=status,
        detail={"code": error.kind.value, "message": error.message},
    )


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _manual_id(simcard_id: str) -> str:
    if not simcard_id.startswith("manual:"):
        raise HTTPException(
            status_code=404,
            detail={"code": "datatem_not_found", "message": "SIM manual não encontrado."},
        )
    return simcard_id


async def _load_inventory(force: bool = False) -> tuple[list[SimcardRecord], str, bool, list[str]]:
    store = get_optional_store()
    if not force and store is not None:
        try:
            persisted, persisted_at = await asyncio.to_thread(store.list_inventory)
        except Exception:
            persisted, persisted_at = [], None
        if persisted:
            return persisted, persisted_at or _now(), False, []

    warnings: list[str] = []
    try:
        items, datatem_warnings = await get_datatem_client().list_simcards()
        warnings.extend(datatem_warnings)
    except DatatemError as exc:
        if store is not None:
            try:
                persisted, persisted_at = await asyncio.to_thread(store.list_inventory)
            except Exception:
                persisted, persisted_at = [], None
            if persisted:
                warnings.append(
                    "Não foi possível atualizar o inventário. Exibindo os dados salvos no Firebase."
                )
                return persisted, persisted_at or _now(), True, warnings
        raise _http_error(exc) from exc

    synced_at = _now()
    if store is not None:
        try:
            await asyncio.to_thread(store.replace_inventory, items)
            await asyncio.to_thread(store.set_inventory_synced_at, synced_at, len(items))
        except Exception:
            warnings.append("Inventário obtido, mas não foi possível salvar no Firebase.")
    return items, synced_at, False, warnings


async def _load_connections() -> tuple[list[ConnectionRecord], bool, str | None]:
    try:
        connections, _ = await get_datatem_client().get_connections()
        return connections, True, None
    except DatatemError:
        return [], False, "Informações de conectividade indisponíveis no momento."


def _simcard_from_assignment(assignment: Mapping[str, object], simcard_id: str) -> SimcardRecord | None:
    snapshot = assignment.get("original")
    if not isinstance(snapshot, Mapping):
        return None
    if str(snapshot.get("simcardId") or snapshot.get("datatemSimcardId") or "") != simcard_id:
        return None
    data = dict(snapshot)
    data["id"] = simcard_id
    apn = data.get("apn")
    if "apns" not in data and isinstance(apn, list):
        data["apns"] = apn
    return SimcardRecord.model_validate(data)


async def _resolve_simcard(
    simcard_id: str,
    store: SimcardStore | None = None,
    *,
    allow_unknown: bool = False,
) -> SimcardRecord:
    if simcard_id.startswith("manual:"):
        if store is None:
            raise DatatemError.not_found_manual()
        manual = await asyncio.to_thread(store.get_manual_simcard, simcard_id)
        if manual is None:
            raise DatatemError.not_found_manual()
        return manual

    if store is not None:
        persisted = await asyncio.to_thread(store.get_inventory_simcard, simcard_id)
        if persisted is not None:
            return persisted

        assignments = await asyncio.to_thread(store.get_assignments)
        assignment = assignments.get(simcard_id)
        if assignment is not None:
            record = _simcard_from_assignment(assignment, simcard_id)
            if record is not None:
                return record

    if allow_unknown:
        return SimcardRecord(id=simcard_id)
    raise DatatemError(
        DatatemErrorKind.NOT_FOUND,
        detail="SIM card não encontrado no inventário local.",
    )


def _actor() -> ResponsibleActor:
    return SYSTEM_ACTOR


@router.get("/datatem/health")
async def datatem_health() -> dict[str, object]:
    client = _client
    store = get_optional_store()
    last_sync_at = await asyncio.to_thread(store.get_inventory_synced_at) if store else None
    return {
        "status": "ok",
        "datatemConfigured": bool(
            datatem_settings.username
            and datatem_settings.password
            and datatem_settings.client_id
            and datatem_settings.client_secret
        ),
        "datatemAuthenticated": bool(client and client.is_authenticated),
        "firebaseConfigured": get_db() is not None,
        "lastSyncAt": last_sync_at,
        "timestamp": _now(),
    }


@router.get("/datatem/bootstrap", response_model=BootstrapPayload)
async def bootstrap(
    forceRefresh: bool = Query(default=False),
    store: SimcardStore | None = Depends(get_optional_store),
) -> BootstrapPayload:
    global _legacy_migration_done
    simcards, last_synced_at, stale, warnings = await _load_inventory(forceRefresh)
    connections, available, warning = await _load_connections()
    if warning:
        warnings.append(warning)
    try:
        assignments = await asyncio.to_thread(store.get_assignments) if store else {}
    except Exception:
        assignments = {}
    try:
        manual_simcards = await asyncio.to_thread(store.list_manual_simcards) if store else []
    except Exception:
        manual_simcards = []

    if store is not None and not _legacy_migration_done:
        try:
            legacy_chips = await asyncio.to_thread(store.get_legacy_chips)
            migration = await asyncio.to_thread(store.reconcile_legacy_chips, simcards, legacy_chips)
            _legacy_migration_done = True
            if migration["matched"] or migration["manual"]:
                warnings.append(
                    "Chips legados reconciliados: "
                    f"{migration['matched']} DATATEM, {migration['manual']} manuais."
                )
                if migration["matched"] or migration["manual"]:
                    assignments = await asyncio.to_thread(store.get_assignments)
                    manual_simcards = await asyncio.to_thread(store.list_manual_simcards)
        except Exception:
            warnings.append("Não foi possível reconciliar os chips legados automaticamente.")

    return BootstrapPayload(
        simcards=simcards,
        manualSimcards=manual_simcards,
        connections=connections,
        connectionsAvailable=available,
        lastSyncedAt=last_synced_at,
        stale=stale,
        assignments=assignments,
        warnings=warnings,
    )


@router.get("/datatem/simcards", response_model=InventoryPayload)
async def list_simcards(
    forceRefresh: bool = Query(default=False),
) -> InventoryPayload:
    simcards, last_synced_at, stale, warnings = await _load_inventory(forceRefresh)
    return InventoryPayload(
        simcards=simcards,
        lastSyncedAt=last_synced_at,
        stale=stale,
        warnings=warnings,
    )


@router.post("/datatem/simcards/sync", response_model=InventoryPayload)
async def sync_simcards(
) -> InventoryPayload:
    simcards, last_synced_at, stale, warnings = await _load_inventory(force=True)
    return InventoryPayload(
        simcards=simcards,
        lastSyncedAt=last_synced_at,
        stale=stale,
        warnings=warnings,
    )


@router.get("/datatem/connections", response_model=ConnectionsPayload)
async def list_connections(
) -> ConnectionsPayload:
    connections, available, warning = await _load_connections()
    return ConnectionsPayload(connections=connections, available=available, warning=warning)


@router.get("/datatem/assignments")
async def list_assignments(
    store: SimcardStore = Depends(get_simcard_store),
) -> dict[str, object]:
    return await asyncio.to_thread(store.get_assignments)


@router.get("/datatem/history")
async def list_history(
    limit: int = Query(default=100, ge=1, le=500),
    simcardId: str | None = Query(default=None),
    store: SimcardStore = Depends(get_simcard_store),
) -> list[dict[str, object]]:
    return await asyncio.to_thread(store.get_history, limit, simcardId)


@router.get("/datatem/manual-simcards")
async def list_manual_simcards(
    store: SimcardStore = Depends(get_simcard_store),
) -> list[dict[str, object]]:
    simcards = await asyncio.to_thread(store.list_manual_simcards)
    return [simcard.model_dump() for simcard in simcards]


@router.post("/datatem/manual-simcards")
async def create_manual_simcard(
    payload: ManualSimcardRequest,
    store: SimcardStore = Depends(get_simcard_store),
) -> dict[str, object]:
    try:
        return await asyncio.to_thread(
            store.create_manual_with_assignment,
            uuid.uuid4().hex,
            payload.simcard,
            payload.destination,
            _actor(),
        )
    except AssignmentConflictError as exc:
        raise HTTPException(
            status_code=409,
            detail={
                "code": "assignment_conflict",
                "message": "O chip foi alterado por outra operação. Tente novamente.",
            },
        ) from exc


@router.patch("/datatem/manual-simcards/{simcard_id}")
async def update_manual_simcard(
    simcard_id: str,
    update: ManualSimcardUpdate,
    store: SimcardStore = Depends(get_simcard_store),
) -> dict[str, object]:
    try:
        return await asyncio.to_thread(store.update_manual, _manual_id(simcard_id), update, _actor())
    except DatatemError as exc:
        raise _http_error(exc) from exc
    except AssignmentConflictError as exc:
        raise HTTPException(
            status_code=409,
            detail={
                "code": "assignment_conflict",
                "message": "O chip foi alterado por outra operação. Tente novamente.",
            },
        ) from exc


@router.delete("/datatem/manual-simcards/{simcard_id}")
async def delete_manual_simcard(
    simcard_id: str,
    store: SimcardStore = Depends(get_simcard_store),
) -> dict[str, object]:
    try:
        return await asyncio.to_thread(store.delete_manual, _manual_id(simcard_id), _actor())
    except DatatemError as exc:
        raise _http_error(exc) from exc
    except AssignmentConflictError as exc:
        raise HTTPException(
            status_code=409,
            detail={
                "code": "assignment_conflict",
                "message": "O chip foi alterado por outra operação. Tente novamente.",
            },
        ) from exc


@router.get("/datatem/simcards/{simcard_id}")
async def get_simcard(
    simcard_id: str,
    store: SimcardStore | None = Depends(get_optional_store),
) -> dict[str, object]:
    try:
        simcard = await _resolve_simcard(simcard_id, store)
    except DatatemError as exc:
        raise _http_error(exc) from exc
    assignment = None
    if store is not None:
        try:
            assignment = (await asyncio.to_thread(store.get_assignments)).get(simcard_id)
        except Exception:
            assignment = None
    return {
        "simcard": simcard.model_dump(),
        "assignment": assignment,
    }


@router.post("/datatem/simcards/{simcard_id}/assign")
async def assign_simcard(
    simcard_id: str,
    destination: AssignmentDestination,
    store: SimcardStore = Depends(get_simcard_store),
) -> dict[str, object]:
    try:
        simcard = await _resolve_simcard(simcard_id, store, allow_unknown=True)
    except DatatemError as exc:
        raise _http_error(exc) from exc
    try:
        return await asyncio.to_thread(store.assign, simcard, destination, _actor())
    except AssignmentConflictError as exc:
        raise HTTPException(
            status_code=409,
            detail={
                "code": "assignment_conflict",
                "message": "O chip foi alterado por outra operação. Tente novamente.",
            },
        ) from exc
    except DatatemError as exc:
        raise _http_error(exc) from exc


@router.post("/datatem/simcards/{simcard_id}/release")
async def release_simcard(
    simcard_id: str,
    store: SimcardStore = Depends(get_simcard_store),
) -> dict[str, object]:
    try:
        return await asyncio.to_thread(store.release, simcard_id, _actor())
    except AssignmentConflictError as exc:
        raise HTTPException(
            status_code=409,
            detail={
                "code": "assignment_conflict",
                "message": "O chip foi alterado por outra operação. Tente novamente.",
            },
        ) from exc


@router.patch("/datatem/simcards/{simcard_id}/assignment")
async def update_assignment(
    simcard_id: str,
    update: AssignmentUpdate,
    store: SimcardStore = Depends(get_simcard_store),
) -> dict[str, object]:
    try:
        return await asyncio.to_thread(store.update_metadata, simcard_id, update, _actor())
    except DatatemError as exc:
        raise _http_error(exc) from exc
    except AssignmentConflictError as exc:
        raise HTTPException(
            status_code=409,
            detail={
                "code": "assignment_conflict",
                "message": "O chip foi alterado por outra operação. Tente novamente.",
            },
        ) from exc


@router.post("/datatem/legacy-migrate")
async def migrate_legacy_chips(
    store: SimcardStore = Depends(get_simcard_store),
) -> dict[str, int]:
    global _legacy_migration_done
    simcards, _, _, _ = await _load_inventory()
    legacy_chips = await asyncio.to_thread(store.get_legacy_chips)
    result = await asyncio.to_thread(store.reconcile_legacy_chips, simcards, legacy_chips)
    _legacy_migration_done = True
    return result


@router.get("/datatem/legacy-metadata")
async def legacy_metadata(
    store: SimcardStore = Depends(get_simcard_store),
) -> dict[str, object]:
    simcards, _, _, _ = await _load_inventory()
    legacy_chips = await asyncio.to_thread(store.get_legacy_chips)
    return match_legacy_metadata(legacy_chips, simcards)
