from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class TokenPair(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    refresh_token: str
    expires_in: int = 3600
    scope: str = ""


class StoredSession(BaseModel):
    access_token: str
    refresh_token: str
    expires_at: float
    token_type: str = "Bearer"
    scope: str = ""


class SimcardRecord(BaseModel):
    id: str
    source: Literal["datatem", "manual"] = "datatem"
    serviceProviderId: str | None = None
    clientId: str | None = None
    clientName: str | None = None
    operatorId: str | None = None
    operatorName: str | None = None
    operatorNetworkId: str | None = None
    operatorNetworkName: str | None = None
    apnIds: list[str] = Field(default_factory=list)
    apns: list[str] = Field(default_factory=list)
    phoneNumber: str | None = None
    iccid: str | None = None
    ban: str | None = None
    operatorStatusId: str | None = None
    operatorStatusName: str | None = None
    statusId: str | None = None
    statusName: str | None = None
    statusI18n: dict[str, object] = Field(default_factory=dict)
    poolAggregateId: str | None = None
    poolAggregateName: str | None = None
    operationalStatusId: str | None = None
    operationalStatusName: str | None = None
    operationalStatusI18n: dict[str, object] = Field(default_factory=dict)
    technology: str | None = None
    lifecycleState: Literal["active", "inactive", "unknown"] = "unknown"
    notes: str | None = None
    additionalFields: dict[str, object] = Field(default_factory=dict)


class ConnectionRecord(BaseModel):
    id: str
    simcardId: str | None = None
    iccid: str | None = None
    phoneNumber: str | None = None
    fields: dict[str, object] = Field(default_factory=dict)


class InventoryPayload(BaseModel):
    simcards: list[SimcardRecord]
    lastSyncedAt: str
    stale: bool = False
    warnings: list[str] = Field(default_factory=list)


class ConnectionsPayload(BaseModel):
    connections: list[ConnectionRecord]
    available: bool
    warning: str | None = None


class BootstrapPayload(BaseModel):
    simcards: list[SimcardRecord]
    manualSimcards: list[SimcardRecord] = Field(default_factory=list)
    connections: list[ConnectionRecord]
    connectionsAvailable: bool
    lastSyncedAt: str
    stale: bool = False
    assignments: dict[str, object] = Field(default_factory=dict)
    warnings: list[str] = Field(default_factory=list)


class ResponsibleActor(BaseModel):
    uid: str
    name: str
    email: str


class AssignmentDestination(BaseModel):
    destinationType: Literal["opportunity", "manual_project"]
    opportunityId: str | None = None
    opportunityName: str | None = None
    projectName: str | None = None
    clientName: str | None = None
    equipment: str | None = None
    technology: str | None = None
    notes: str | None = None

    model_config = ConfigDict(extra="forbid")

    @model_validator(mode="after")
    def validate_destination(self) -> "AssignmentDestination":
        if self.destinationType == "opportunity" and not self.opportunityId:
            raise ValueError("opportunityId é obrigatório para vincular a uma oportunidade.")
        if self.destinationType == "manual_project" and not self.projectName:
            raise ValueError("projectName é obrigatório para vincular a um projeto manual.")
        return self


class AssignmentUpdate(BaseModel):
    opportunityName: str | None = None
    projectName: str | None = None
    clientName: str | None = None
    equipment: str | None = None
    technology: str | None = None
    notes: str | None = None

    model_config = ConfigDict(extra="forbid")


def normalize_manual_technology(value: object) -> str:
    if not isinstance(value, str):
        raise ValueError("tecnologia deve ser 4G ou NB-IoT")
    normalized = value.strip().lower().replace("-", " ").replace("_", " ")
    if normalized in {"4g", "lte", "4g lte", "lte 4g", "4g lte advanced"}:
        return "4G"
    if normalized in {"nb iot", "nb", "nbiot", "nb iot lte m", "lte m"}:
        return "NB-IoT"
    raise ValueError("tecnologia deve ser 4G ou NB-IoT")


class ManualSimcardCreate(BaseModel):
    iccid: str
    technology: str
    phoneNumber: str | None = None
    operatorName: str | None = None
    notes: str | None = None

    model_config = ConfigDict(extra="forbid")

    @field_validator("iccid", mode="before")
    @classmethod
    def clean_iccid(cls, value: object) -> str:
        cleaned = str(value or "").strip().replace(" ", "")
        if not cleaned:
            raise ValueError("ICCID é obrigatório")
        return cleaned

    @field_validator("technology", mode="before")
    @classmethod
    def clean_technology(cls, value: object) -> str:
        return normalize_manual_technology(value)


class ManualSimcardUpdate(BaseModel):
    iccid: str | None = None
    technology: str | None = None
    phoneNumber: str | None = None
    operatorName: str | None = None
    notes: str | None = None

    model_config = ConfigDict(extra="forbid")

    @field_validator("iccid", mode="before")
    @classmethod
    def clean_iccid(cls, value: object) -> str | None:
        if value is None:
            return None
        cleaned = str(value).strip().replace(" ", "")
        if not cleaned:
            raise ValueError("ICCID não pode ficar vazio")
        return cleaned

    @field_validator("technology", mode="before")
    @classmethod
    def clean_technology(cls, value: object) -> str | None:
        if value is None:
            return None
        return normalize_manual_technology(value)


class ManualSimcardRequest(BaseModel):
    simcard: ManualSimcardCreate
    destination: AssignmentDestination
