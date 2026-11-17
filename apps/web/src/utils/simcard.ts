import type {
  AssignmentHistoryEvent,
  DatatemResponsible,
  SimcardAssignment,
  SimcardClassification,
  DatatemSimcard,
  SimcardSource,
  TechnologyGroup,
} from "../types/simcard";

type UnknownRecord = Record<string, unknown>;

export function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

export function toIso(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (typeof value === "number") return new Date(value).toISOString();
  if (typeof value === "object" && "toDate" in value) {
    const toDate = (value as { toDate?: unknown }).toDate;
    if (typeof toDate === "function") {
      const date = (toDate as () => Date).call(value);
      return date instanceof Date ? date.toISOString() : null;
    }
  }
  return null;
}

function pickString(record: UnknownRecord, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function mapActor(value: unknown): DatatemResponsible | null {
  const record = asRecord(value);
  const uid = pickString(record, "uid");
  const name = pickString(record, "name");
  const email = pickString(record, "email");
  if (!uid && !name && !email) return null;
  return { uid: uid || "", name: name || email || "", email: email || "" };
}

export function mapAssignmentDocument(id: string, data: unknown): SimcardAssignment {
  const record = asRecord(data);
  return {
    simcardId: pickString(record, "simcardId") || id,
    source: record.source === "manual" ? "manual" : "datatem",
    assignmentStatus: record.assignmentStatus === "released" ? "released" : "assigned",
    destinationType: record.destinationType === "opportunity" ? "opportunity" : "manual_project",
    opportunityId: pickString(record, "opportunityId"),
    opportunityName: pickString(record, "opportunityName"),
    projectName: pickString(record, "projectName"),
    clientName: pickString(record, "clientName"),
    equipment: pickString(record, "equipment"),
    technology: pickString(record, "technology"),
    notes: pickString(record, "notes"),
    iccid: pickString(record, "iccid"),
    phoneNumber: pickString(record, "phoneNumber"),
    operatorName: pickString(record, "operatorName"),
    original: asRecord(record.original) as Partial<DatatemSimcard>,
    responsible: mapActor(record.responsible),
    assignedBy: mapActor(record.assignedBy),
    assignedAt: toIso(record.assignedAt),
    updatedAt: toIso(record.updatedAt),
    updatedBy: mapActor(record.updatedBy),
    releasedAt: toIso(record.releasedAt),
    releasedBy: mapActor(record.releasedBy),
    legacyMetadata: record.legacyMetadata ? asRecord(record.legacyMetadata) : undefined,
  };
}

export function mapHistoryDocument(id: string, data: unknown): AssignmentHistoryEvent {
  const record = asRecord(data);
  const rawType = pickString(record, "type");
  const allowedTypes: AssignmentHistoryEvent["type"][] = [
    "created",
    "assigned",
    "transfer",
    "released",
    "metadata_updated",
    "manual_updated",
    "deleted",
  ];
  const type = allowedTypes.includes(rawType as AssignmentHistoryEvent["type"])
    ? (rawType as AssignmentHistoryEvent["type"])
    : "metadata_updated";
  return {
    id,
    type,
    simcardId: pickString(record, "simcardId") || pickString(record, "datatemSimcardId"),
    source: record.source === "manual" ? "manual" : "datatem",
    datatemSimcardId: pickString(record, "datatemSimcardId"),
    iccid: pickString(record, "iccid"),
    phoneNumber: pickString(record, "phoneNumber"),
    operatorName: pickString(record, "operatorName"),
    destinationFrom: asRecord(record.destinationFrom) as AssignmentHistoryEvent["destinationFrom"],
    destinationTo: asRecord(record.destinationTo) as AssignmentHistoryEvent["destinationTo"],
    details: asRecord(record.details),
    performedBy: mapActor(record.performedBy),
    performedAt: toIso(record.performedAt),
  };
}

export function classifySimcard(
  simcard: DatatemSimcard,
  assignment: SimcardAssignment | null,
): SimcardClassification {
  if (assignment?.assignmentStatus === "assigned") return "assigned";
  if (simcard.lifecycleState === "inactive") return "inactive";
  if (simcard.lifecycleState === "active") return "available";
  return "unknown";
}

export function sourceOf(simcard: DatatemSimcard): SimcardSource {
  return simcard.source === "manual" ? "manual" : "datatem";
}

export function sourceLabel(source: SimcardSource): string {
  return source === "manual" ? "MANUAL · NÃO DATATEM" : "DATATEM";
}

export function technologyGroupOf(simcard: DatatemSimcard): TechnologyGroup {
  const raw = displayValue(
    simcard.operatorNetworkName || simcard.technology || simcard.apns[0] || simcard.additionalFields?.tecnologia,
    "",
  ).toLowerCase();
  if (raw.includes("nb") || raw.includes("iot") || raw.includes("lte-m")) return "NB-IoT";
  if (raw.includes("4g") || raw.includes("lte")) return "4G";
  return "Outros";
}

export function displayValue(value: unknown, fallback = "—"): string {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

export function formatDateTime(value: string | null): string {
  const iso = toIso(value);
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
