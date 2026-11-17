from __future__ import annotations

from collections.abc import Mapping, Sequence

from .models import ConnectionRecord, SimcardRecord

KNOWN_KEYS = {
    "id",
    "simcardId",
    "simCardId",
    "serviceProviderId",
    "clientId",
    "clientName",
    "operatorId",
    "operatorName",
    "operatorNetworkId",
    "operatorNetworkName",
    "apnId",
    "apn",
    "phoneNumber",
    "iccid",
    "ban",
    "operatorStatusId",
    "operatorStatusName",
    "statusId",
    "statusName",
    "statusI18n",
    "poolAggregateId",
    "poolAggregateName",
    "operationalStatusId",
    "operationalStatusName",
    "operationalStatusI18n",
    "technology",
    "networkTechnology",
    "radioTechnology",
    "accessTechnology",
}

INACTIVE_TOKENS = {
    "inactive",
    "inativo",
    "inactivo",
    "suspended",
    "suspenso",
    "suspension",
    "deactivated",
    "desativado",
    "cancelled",
    "canceled",
    "cancelado",
    "expired",
    "expirado",
    "closed",
    "encerrado",
    "terminated",
}
ACTIVE_TOKENS = {
    "active",
    "ativo",
    "activated",
    "ativado",
    "available",
    "disponivel",
    "disponível",
    "enabled",
    "habilitado",
    "operational",
    "operacional",
    "in service",
    "em serviço",
    "live",
}


def _text(value: object) -> str | None:
    if isinstance(value, str):
        stripped = value.strip()
        return stripped or None
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return str(value)
    return None


def _text_list(value: object) -> list[str]:
    if isinstance(value, str):
        item = _text(value)
        return [item] if item else []
    if isinstance(value, Sequence) and not isinstance(value, (str, bytes, bytearray)):
        result: list[str] = []
        for entry in value:
            item = _text(entry)
            if item and item not in result:
                result.append(item)
        return result
    return []


def _dict(value: object) -> dict[str, object]:
    if isinstance(value, Mapping):
        return {str(key): item for key, item in value.items()}
    return {}


def classify_lifecycle(
    operational_status: str | None,
    sim_status: str | None,
    operator_status: str | None,
) -> str:
    """Classificação derivada apenas de status fornecidos pela DATATEM."""
    for value in (operational_status, sim_status, operator_status):
        token = _text(value)
        if not token:
            continue
        normalized = token.lower().strip()
        if normalized in INACTIVE_TOKENS:
            return "inactive"
        if normalized in ACTIVE_TOKENS:
            return "active"
    return "unknown"


def _additional_fields(raw: Mapping[str, object]) -> dict[str, object]:
    extras: dict[str, object] = {}
    for key, value in raw.items():
        if key in KNOWN_KEYS:
            continue
        if isinstance(value, (str, int, float, bool)) or value is None:
            extras[str(key)] = value
        if len(extras) >= 30:
            break
    return extras


def normalize_simcard(raw: object) -> SimcardRecord | None:
    if not isinstance(raw, Mapping):
        return None

    identifier = (
        _text(raw.get("id"))
        or _text(raw.get("simcardId"))
        or _text(raw.get("simCardId"))
        or _text(raw.get("iccid"))
    )
    if not identifier:
        return None

    iccid = _text(raw.get("iccid"))
    operational_status = _text(raw.get("operationalStatusName"))
    sim_status = _text(raw.get("statusName"))
    operator_status = _text(raw.get("operatorStatusName"))
    technology = None
    for key in ("technology", "networkTechnology", "radioTechnology", "accessTechnology"):
        technology = _text(raw.get(key))
        if technology:
            break

    return SimcardRecord(
        id=identifier,
        serviceProviderId=_text(raw.get("serviceProviderId")),
        clientId=_text(raw.get("clientId")),
        clientName=_text(raw.get("clientName")),
        operatorId=_text(raw.get("operatorId")),
        operatorName=_text(raw.get("operatorName")),
        operatorNetworkId=_text(raw.get("operatorNetworkId")),
        operatorNetworkName=_text(raw.get("operatorNetworkName")),
        apnIds=_text_list(raw.get("apnId")),
        apns=_text_list(raw.get("apn")),
        phoneNumber=_text(raw.get("phoneNumber")),
        iccid=iccid,
        ban=_text(raw.get("ban")),
        operatorStatusId=_text(raw.get("operatorStatusId")),
        operatorStatusName=operator_status,
        statusId=_text(raw.get("statusId")),
        statusName=sim_status,
        statusI18n=_dict(raw.get("statusI18n")),
        poolAggregateId=_text(raw.get("poolAggregateId")),
        poolAggregateName=_text(raw.get("poolAggregateName")),
        operationalStatusId=_text(raw.get("operationalStatusId")),
        operationalStatusName=operational_status,
        operationalStatusI18n=_dict(raw.get("operationalStatusI18n")),
        technology=technology,
        lifecycleState=classify_lifecycle(operational_status, sim_status, operator_status),
        additionalFields=_additional_fields(raw),
    )


def normalize_inventory(payload: object) -> tuple[list[SimcardRecord], list[str]]:
    warnings: list[str] = []
    records, _, shape_warnings = extract_page(payload)
    warnings.extend(shape_warnings)

    result: list[SimcardRecord] = []
    seen_ids: set[str] = set()
    seen_iccids: set[str] = set()
    for entry in records:
        normalized = normalize_simcard(entry)
        if normalized is None:
            warnings.append("Registro de SIM card sem identificador foi ignorado.")
            continue
        key = normalized.id
        iccid = normalized.iccid or ""
        if key in seen_ids or (iccid and iccid in seen_iccids):
            continue
        seen_ids.add(key)
        if iccid:
            seen_iccids.add(iccid)
        result.append(normalized)
    return result, warnings


def extract_page(payload: object) -> tuple[list[Mapping[str, object]], dict[str, object], list[str]]:
    """Extrai itens e metadados de paginação de formatos tolerados pela DATATEM."""
    warnings: list[str] = []
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, Mapping)], {}, warnings
    if not isinstance(payload, Mapping):
        return [], {}, ["A DATATEM retornou um formato de inventário não reconhecido."]

    items_key = None
    for key in ("content", "items", "data", "simcards", "simCards"):
        value = payload.get(key)
        if isinstance(value, Sequence) and not isinstance(value, (str, bytes, bytearray)):
            items_key = key
            break
    if items_key is None:
        warnings.append("A resposta da DATATEM não continha uma lista de SIM cards.")
        return [], dict(payload), warnings

    raw_items = payload[items_key]
    meta: dict[str, object] = {}
    for key in ("totalPages", "totalElements", "last", "first", "number", "pageNumber", "size"):
        if key in payload:
            meta[key] = payload[key]

    if not isinstance(raw_items, list):
        warnings.append("A lista de SIM cards da DATATEM estava em formato inesperado.")
        return [], meta, warnings
    if any(not isinstance(item, Mapping) for item in raw_items):
        warnings.append("Registros inconsistentes foram ignorados na resposta da DATATEM.")
    return [item for item in raw_items if isinstance(item, Mapping)], meta, warnings


def normalize_connections(payload: object) -> tuple[list[ConnectionRecord], list[str]]:
    warnings: list[str] = []
    records, _, shape_warnings = extract_page(payload)
    warnings.extend(shape_warnings)

    result: list[ConnectionRecord] = []
    seen: set[str] = set()
    for entry in records:
        identifier = (
            _text(entry.get("id"))
            or _text(entry.get("simcardId"))
            or _text(entry.get("simCardId"))
            or _text(entry.get("iccid"))
        )
        if not identifier or identifier in seen:
            continue
        seen.add(identifier)
        fields: dict[str, object] = {}
        for key, value in entry.items():
            if key in {"id", "simcardId", "simCardId", "iccid", "phoneNumber"}:
                continue
            if isinstance(value, (str, int, float, bool)) or value is None:
                fields[str(key)] = value
        result.append(
            ConnectionRecord(
                id=identifier,
                simcardId=_text(entry.get("simcardId")) or _text(entry.get("simCardId")),
                iccid=_text(entry.get("iccid")),
                phoneNumber=_text(entry.get("phoneNumber")),
                fields=fields,
            )
        )
    return result, warnings
