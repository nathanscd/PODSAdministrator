from __future__ import annotations

from fastapi_app.datatem.normalize import (
    classify_lifecycle,
    normalize_connections,
    normalize_inventory,
)


def test_normalization_preserves_separate_status_fields():
    raw = {
        "id": "SIM-1",
        "iccid": "8955",
        "phoneNumber": "11999990000",
        "operatorName": "Vivo",
        "operatorNetworkName": "4G",
        "apnId": ["apn-1"],
        "apn": ["vivo.com.br"],
        "operatorStatusName": "ACTIVE",
        "statusName": "SUSPENDED",
        "operationalStatusName": "INACTIVE",
        "statusI18n": {"pt": "Suspenso"},
    }
    cards, warnings = normalize_inventory([raw])
    assert warnings == []
    card = cards[0]
    assert card.id == "SIM-1"
    assert card.apns == ["vivo.com.br"]
    assert card.apnIds == ["apn-1"]
    assert card.statusName == "SUSPENDED"
    assert card.operatorStatusName == "ACTIVE"
    assert card.operationalStatusName == "INACTIVE"
    assert card.lifecycleState == "inactive"
    assert card.technology is None


def test_unknown_status_is_not_marked_inactive():
    assert classify_lifecycle("Novo", None, None) == "unknown"
    assert classify_lifecycle(None, "Ativo", None) == "active"
    assert classify_lifecycle(None, "Cancelado", None) == "inactive"


def test_normalization_deduplicates_by_id_and_iccid():
    payload = {
        "content": [
            {"id": "1", "iccid": "8955"},
            {"id": "1", "iccid": "8955"},
            {"id": "2", "iccid": "8955"},
            {"id": "3"},
            {"phoneNumber": "11999990000"},
            "invalid",
        ]
    }
    cards, warnings = normalize_inventory(payload)
    assert [card.id for card in cards] == ["1", "3"]
    assert len(warnings) == 2


def test_connections_are_isolated_and_never_invented():
    connections, warnings = normalize_connections({"content": [{"id": "c1", "ipAddress": "10.0.0.1"}]})
    assert warnings == []
    assert connections[0].fields == {"ipAddress": "10.0.0.1"}
    assert connections[0].simcardId is None


def test_empty_and_inconsistent_responses_do_not_raise():
    assert normalize_inventory({})[0] == []
    assert normalize_inventory(None)[0] == []
    assert normalize_connections({"content": "bad"})[0] == []
