from __future__ import annotations

from collections import defaultdict
from collections.abc import Mapping, Sequence

from .datatem.models import (
    AssignmentDestination,
    ManualSimcardCreate,
    ResponsibleActor,
    SimcardRecord,
    normalize_manual_technology,
)


def _text(value: object) -> str:
    return value.strip() if isinstance(value, str) else ""


def _digits(value: object) -> str:
    return "".join(character for character in _text(value) if character.isdigit())


def _legacy_technology(value: object) -> str | None:
    text = _text(value)
    if not text:
        return None
    try:
        return normalize_manual_technology(text)
    except ValueError:
        return text


def _legacy_keys(chip: Mapping[str, object]) -> list[str]:
    keys = [_digits(chip.get(key)) for key in ("iccid", "numero", "phoneNumber")]
    return [key for key in keys if len(key) >= 6]


def _simcard_keys(simcard: SimcardRecord) -> list[str]:
    keys = [_digits(simcard.iccid), _digits(simcard.phoneNumber)]
    return [key for key in keys if len(key) >= 6]


def match_legacy_chips(
    legacy_chips: Sequence[Mapping[str, object]],
    simcards: Sequence[SimcardRecord],
) -> tuple[list[tuple[Mapping[str, object], SimcardRecord]], list[Mapping[str, object]]]:
    datatem_index: dict[str, list[SimcardRecord]] = defaultdict(list)
    for simcard in simcards:
        for key in _simcard_keys(simcard):
            if simcard not in datatem_index[key]:
                datatem_index[key].append(simcard)

    matched: list[tuple[Mapping[str, object], SimcardRecord]] = []
    unmatched: list[Mapping[str, object]] = []
    used: set[str] = set()
    for chip in legacy_chips:
        candidates: dict[str, SimcardRecord] = {}
        for key in _legacy_keys(chip):
            matches = datatem_index.get(key, [])
            if len(matches) == 1:
                candidates[matches[0].id] = matches[0]
        if len(candidates) == 1:
            simcard = next(iter(candidates.values()))
            if simcard.id not in used:
                used.add(simcard.id)
                matched.append((chip, simcard))
                continue
        unmatched.append(chip)
    return matched, unmatched


def legacy_destination(chip: Mapping[str, object]) -> AssignmentDestination:
    notes = ["Migrado automaticamente da coleção chips."]
    responsible = _text(chip.get("responsavel"))
    if responsible:
        notes.append(f"Responsável legado: {responsible}")
    return AssignmentDestination(
        destinationType="manual_project",
        projectName=_text(chip.get("projeto")) or "Migração de chips",
        clientName=_text(chip.get("cliente")) or None,
        equipment=_text(chip.get("equipamento")) or None,
        technology=_legacy_technology(chip.get("tecnologia")),
        notes=" | ".join(notes),
    )


def legacy_actor(chip: Mapping[str, object]) -> ResponsibleActor:
    chip_id = _text(chip.get("id")) or "sem-id"
    return ResponsibleActor(
        uid=f"legacy:{chip_id}",
        name=_text(chip.get("responsavel")) or "Migração PODSAdministrator",
        email=_text(chip.get("email")) or "migracao@podsadministrator.local",
    )


def legacy_manual_doc_id(chip: Mapping[str, object]) -> str:
    chip_id = _text(chip.get("id")) or "sem-id"
    safe_id = "".join(character if character.isalnum() or character in "-_" else "-" for character in chip_id)
    return f"legacy-{safe_id}"


def legacy_manual_create(chip: Mapping[str, object]) -> ManualSimcardCreate:
    chip_id = _text(chip.get("id")) or "sem-id"
    iccid = _text(chip.get("iccid")) or _text(chip.get("numero")) or _text(chip.get("phoneNumber")) or chip_id
    notes = ["Migrado automaticamente da coleção chips por não haver match na DATATEM."]
    responsible = _text(chip.get("responsavel"))
    if responsible:
        notes.append(f"Responsável legado: {responsible}")
    return ManualSimcardCreate(
        iccid=iccid,
        technology=_legacy_technology(chip.get("tecnologia")) or "4G",
        phoneNumber=_text(chip.get("phoneNumber")) or _text(chip.get("numero")) or None,
        operatorName=_text(chip.get("operadora")) or None,
        notes=" | ".join(notes),
    )


def match_legacy_metadata(
    legacy_chips: Sequence[Mapping[str, object]],
    simcards: Sequence[SimcardRecord],
) -> dict[str, dict[str, object]]:
    index: dict[str, set[str]] = defaultdict(set)
    for chip in legacy_chips:
        chip_id = _text(chip.get("id"))
        if not chip_id:
            continue
        for key in ("numero", "iccid", "phoneNumber"):
            identifier = _text(chip.get(key))
            if identifier:
                index[identifier].add(chip_id)

    by_id = {_text(chip.get("id")): chip for chip in legacy_chips if _text(chip.get("id"))}
    result: dict[str, dict[str, object]] = {}
    for simcard in simcards:
        candidates: set[str] = set()
        for identifier in (simcard.phoneNumber, simcard.iccid):
            if identifier:
                candidates.update(index.get(identifier, set()))
        if len(candidates) != 1:
            continue
        chip = by_id.get(next(iter(candidates)))
        if chip is None:
            continue
        metadata: dict[str, object] = {}
        for key in ("tecnologia", "responsavel", "equipamento", "projeto", "cliente", "createdAt"):
            value = chip.get(key)
            if value is not None and value != "":
                metadata[key] = value
        if metadata:
            result[simcard.id] = metadata
    return result
