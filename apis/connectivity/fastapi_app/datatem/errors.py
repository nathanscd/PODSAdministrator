from __future__ import annotations

from enum import Enum


class DatatemErrorKind(str, Enum):
    INVALID_REQUEST = "datatem_invalid_request"
    AUTHENTICATION_FAILED = "datatem_authentication_failed"
    PERMISSION_DENIED = "datatem_permission_denied"
    NOT_FOUND = "datatem_not_found"
    METHOD_NOT_ALLOWED = "datatem_method_not_allowed"
    CONFLICT = "datatem_conflict"
    INVALID_DATA = "datatem_invalid_data"
    RATE_LIMITED = "datatem_rate_limited"
    INTERNAL_ERROR = "datatem_internal_error"
    UNAVAILABLE = "datatem_unavailable"
    INVALID_RESPONSE = "datatem_invalid_response"
    NOT_CONFIGURED = "datatem_not_configured"


MESSAGES: dict[DatatemErrorKind, str] = {
    DatatemErrorKind.INVALID_REQUEST: "A requisição enviada à DATATEM foi recusada.",
    DatatemErrorKind.AUTHENTICATION_FAILED: "Não foi possível autenticar a integração com a DATATEM.",
    DatatemErrorKind.PERMISSION_DENIED: "A integração DATATEM não possui permissão para esta operação.",
    DatatemErrorKind.NOT_FOUND: "Recurso não encontrado na DATATEM.",
    DatatemErrorKind.METHOD_NOT_ALLOWED: "Operação não suportada pela DATATEM.",
    DatatemErrorKind.CONFLICT: "Conflito ao processar a solicitação na DATATEM.",
    DatatemErrorKind.INVALID_DATA: "A DATATEM retornou dados inválidos.",
    DatatemErrorKind.RATE_LIMITED: "Limite de requisições da DATATEM atingido. Tente novamente em instantes.",
    DatatemErrorKind.INTERNAL_ERROR: "A DATATEM apresentou um erro interno.",
    DatatemErrorKind.UNAVAILABLE: "O serviço de conectividade está temporariamente indisponível.",
    DatatemErrorKind.INVALID_RESPONSE: "A DATATEM retornou uma resposta inesperada.",
    DatatemErrorKind.NOT_CONFIGURED: "A integração DATATEM não está configurada neste servidor.",
}

STATUS_MAP: dict[int, DatatemErrorKind] = {
    400: DatatemErrorKind.INVALID_REQUEST,
    401: DatatemErrorKind.AUTHENTICATION_FAILED,
    403: DatatemErrorKind.PERMISSION_DENIED,
    404: DatatemErrorKind.NOT_FOUND,
    405: DatatemErrorKind.METHOD_NOT_ALLOWED,
    409: DatatemErrorKind.CONFLICT,
    422: DatatemErrorKind.INVALID_DATA,
    429: DatatemErrorKind.RATE_LIMITED,
    500: DatatemErrorKind.INTERNAL_ERROR,
    502: DatatemErrorKind.UNAVAILABLE,
    503: DatatemErrorKind.UNAVAILABLE,
    504: DatatemErrorKind.UNAVAILABLE,
}


class DatatemError(Exception):
    """Erro sanitizado da integração DATATEM. Nunca contém credenciais."""

    def __init__(
        self,
        kind: DatatemErrorKind,
        *,
        status_code: int | None = None,
        detail: str | None = None,
    ) -> None:
        self.kind = kind
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail or MESSAGES[kind])

    @property
    def message(self) -> str:
        return MESSAGES[self.kind]

    @classmethod
    def from_status(cls, status_code: int) -> "DatatemError":
        kind = STATUS_MAP.get(status_code, DatatemErrorKind.UNAVAILABLE)
        return cls(kind, status_code=status_code)

    @classmethod
    def missing_firestore(cls) -> "DatatemError":
        return cls(
            DatatemErrorKind.UNAVAILABLE,
            detail="Firestore Admin não está configurado no servidor.",
        )

    @classmethod
    def not_found_assignment(cls) -> "DatatemError":
        return cls(DatatemErrorKind.NOT_FOUND, detail="Atribuição ativa não encontrada.")

    @classmethod
    def not_found_manual(cls) -> "DatatemError":
        return cls(DatatemErrorKind.NOT_FOUND, detail="SIM manual não encontrado.")


class DatatemConfigurationError(DatatemError):
    def __init__(self, variable: str) -> None:
        super().__init__(DatatemErrorKind.NOT_CONFIGURED, detail=f"Variável ausente: {variable}")
        self.variable = variable


class AssignmentConflictError(Exception):
    def __init__(self, message: str = "Concorrência detectada ao registrar a atribuição.") -> None:
        super().__init__(message)
