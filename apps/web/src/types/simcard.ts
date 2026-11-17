export type SimcardSource = "datatem" | "manual";

export type TechnologyGroup = "4G" | "NB-IoT" | "Outros";

export interface DatatemSimcard {
  id: string;
  source: SimcardSource;
  serviceProviderId: string | null;
  clientId: string | null;
  clientName: string | null;
  operatorId: string | null;
  operatorName: string | null;
  operatorNetworkId: string | null;
  operatorNetworkName: string | null;
  apnIds: string[];
  apns: string[];
  phoneNumber: string | null;
  iccid: string | null;
  ban: string | null;
  operatorStatusId: string | null;
  operatorStatusName: string | null;
  statusId: string | null;
  statusName: string | null;
  statusI18n: Record<string, unknown>;
  poolAggregateId: string | null;
  poolAggregateName: string | null;
  operationalStatusId: string | null;
  operationalStatusName: string | null;
  operationalStatusI18n: Record<string, unknown>;
  technology: string | null;
  lifecycleState: "active" | "inactive" | "unknown";
  notes: string | null;
  additionalFields: Record<string, unknown>;
}

export interface SimcardConnection {
  id: string;
  simcardId: string | null;
  iccid: string | null;
  phoneNumber: string | null;
  fields: Record<string, unknown>;
}

export interface DatatemResponsible {
  uid: string;
  name: string;
  email: string;
}

export type AssignmentStatus = "assigned" | "released";
export type DestinationType = "opportunity" | "manual_project";

export interface AssignmentDestination {
  destinationType: DestinationType;
  opportunityId: string | null;
  opportunityName: string | null;
  projectName: string | null;
  clientName: string | null;
  equipment: string | null;
  technology: string | null;
  notes: string | null;
}

export interface SimcardAssignment extends AssignmentDestination {
  simcardId: string;
  source: SimcardSource;
  assignmentStatus: AssignmentStatus;
  iccid: string | null;
  phoneNumber: string | null;
  operatorName: string | null;
  original: Partial<DatatemSimcard> | null;
  responsible: DatatemResponsible | null;
  assignedBy: DatatemResponsible | null;
  assignedAt: string | null;
  updatedAt: string | null;
  updatedBy: DatatemResponsible | null;
  releasedAt: string | null;
  releasedBy: DatatemResponsible | null;
  legacyMetadata?: Record<string, unknown>;
}

export type HistoryEventType =
  | "created"
  | "assigned"
  | "transfer"
  | "released"
  | "metadata_updated"
  | "manual_updated"
  | "deleted";

export interface AssignmentHistoryEvent {
  id: string;
  type: HistoryEventType;
  simcardId: string | null;
  source: SimcardSource;
  datatemSimcardId: string | null;
  iccid: string | null;
  phoneNumber: string | null;
  operatorName: string | null;
  destinationFrom: Partial<AssignmentDestination> | null;
  destinationTo: Partial<AssignmentDestination> | null;
  details: Record<string, unknown>;
  performedBy: DatatemResponsible | null;
  performedAt: string | null;
}

export interface BootstrapResponse {
  simcards: DatatemSimcard[];
  manualSimcards: DatatemSimcard[];
  connections: SimcardConnection[];
  connectionsAvailable: boolean;
  lastSyncedAt: string;
  stale: boolean;
  assignments: Record<string, SimcardAssignment>;
  warnings: string[];
}

export interface InventoryResponse {
  simcards: DatatemSimcard[];
  lastSyncedAt: string;
  stale: boolean;
  warnings: string[];
}

export interface SimcardDetailResponse {
  simcard: DatatemSimcard;
  assignment: SimcardAssignment | null;
}

export interface AssignPayload extends AssignmentDestination {}

export interface ManualSimcardCreate {
  iccid: string;
  technology: "4G" | "NB-IoT";
  phoneNumber?: string | null;
  operatorName?: string | null;
  notes?: string | null;
}

export interface ManualSimcardUpdate {
  iccid?: string | null;
  technology?: "4G" | "NB-IoT" | null;
  phoneNumber?: string | null;
  operatorName?: string | null;
  notes?: string | null;
}

export interface ManualSimcardRequest {
  simcard: ManualSimcardCreate;
  destination: AssignPayload;
}

export interface AssignmentUpdatePayload {
  opportunityName?: string | null;
  projectName?: string | null;
  clientName?: string | null;
  equipment?: string | null;
  technology?: string | null;
  notes?: string | null;
}

export type SimcardClassification = "available" | "assigned" | "inactive" | "unknown";

export interface InventoryItem {
  simcard: DatatemSimcard;
  assignment: SimcardAssignment | null;
  connection: SimcardConnection | null;
  classification: SimcardClassification;
  legacyMetadata: Record<string, unknown> | null;
}
