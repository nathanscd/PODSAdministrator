import type {
  AssignPayload,
  AssignmentUpdatePayload,
  BootstrapResponse,
  DatatemSimcard,
  InventoryResponse,
  ManualSimcardRequest,
  ManualSimcardUpdate,
  SimcardDetailResponse,
} from "../types/simcard";

const API_URL = (import.meta.env.VITE_DATATEM_API_URL || "https://datatemapi-podsadministrator.onrender.com").replace(/\/+$/, "");

const FRIENDLY_MESSAGES: Record<string, string> = {
  datatem_invalid_request: "Não foi possível atualizar o inventário de chips.",
  datatem_authentication_failed: "Não foi possível autenticar a integração com a DATATEM.",
  datatem_permission_denied: "Você não tem permissão para acessar estas informações.",
  datatem_not_found: "Nenhum SIM card foi encontrado.",
  datatem_method_not_allowed: "Não foi possível atualizar o inventário de chips.",
  datatem_conflict: "O chip foi alterado por outra operação. Tente novamente.",
  datatem_invalid_data: "A DATATEM retornou dados inválidos.",
  datatem_rate_limited: "Muitas requisições em pouco tempo. Tente novamente em instantes.",
  datatem_internal_error: "O serviço de conectividade apresentou um erro interno.",
  datatem_unavailable: "O serviço de conectividade está temporariamente indisponível.",
  datatem_invalid_response: "Não foi possível atualizar o inventário de chips.",
  datatem_not_configured: "A integração DATATEM não está configurada no servidor.",
  assignment_conflict: "O chip foi alterado por outra operação. Tente novamente.",
};

export class DatatemApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "DatatemApiError";
    this.code = code;
    this.status = status;
  }

  static fromStatus(status: number, code?: string, message?: string): DatatemApiError {
    const fallback =
      status === 401
        ? "A integração DATATEM não autorizou a operação."
        : status === 403
          ? "Você não tem permissão para acessar estas informações."
          : status === 404
            ? "Nenhum SIM card foi encontrado."
            : status >= 503
              ? "O serviço de conectividade está temporariamente indisponível."
              : "Não foi possível atualizar o inventário de chips.";
    return new DatatemApiError(code || `http_${status}`, message || fallback, status);
  }
}

function extractError(payload: unknown, status: number): DatatemApiError {
  if (payload && typeof payload === "object") {
    const detail = (payload as { detail?: unknown }).detail;
    if (detail && typeof detail === "object") {
      const code = String((detail as { code?: unknown }).code || `http_${status}`);
      const message = (detail as { message?: unknown }).message;
      return new DatatemApiError(
        code,
        FRIENDLY_MESSAGES[code] || (typeof message === "string" ? message : FRIENDLY_MESSAGES[code] || "Não foi possível concluir a operação."),
        status,
      );
    }
    if (typeof detail === "string" && detail.includes("token")) {
      return DatatemApiError.fromStatus(401);
    }
  }
  return DatatemApiError.fromStatus(status);
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/datatem${path}`, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new DatatemApiError(
      "network_unavailable",
      "O serviço de conectividade está temporariamente indisponível.",
      503,
    );
  }

  if (!response.ok) {
    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
    throw extractError(payload, response.status);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new DatatemApiError("datatem_invalid_response", "A DATATEM retornou uma resposta inesperada.", 502);
  }
}

export const datatemApi = {
  bootstrap: (signal?: AbortSignal, forceRefresh = false) =>
    request<BootstrapResponse>(`/bootstrap${forceRefresh ? "?forceRefresh=true" : ""}`, { signal }),

  detail: (simcardId: string, signal?: AbortSignal) =>
    request<SimcardDetailResponse>(`/simcards/${encodeURIComponent(simcardId)}`, { signal }),

  connections: (signal?: AbortSignal) =>
    request<{ connections: BootstrapResponse["connections"]; available: boolean; warning: string | null }>(
      "/connections",
      { signal },
    ),

  sync: (signal?: AbortSignal) =>
    request<InventoryResponse>("/simcards/sync", { method: "POST", signal }),

  assign: (simcardId: string, payload: AssignPayload, signal?: AbortSignal) =>
    request<{ simcardId: string; previousActive: boolean }>(`/simcards/${encodeURIComponent(simcardId)}/assign`, {
      method: "POST",
      body: payload,
      signal,
    }),

  release: (simcardId: string, signal?: AbortSignal) =>
    request<{ simcardId: string; changed: boolean }>(`/simcards/${encodeURIComponent(simcardId)}/release`, {
      method: "POST",
      signal,
    }),

  updateAssignment: (simcardId: string, payload: AssignmentUpdatePayload, signal?: AbortSignal) =>
    request<{ simcardId: string; changed: boolean }>(`/simcards/${encodeURIComponent(simcardId)}/assignment`, {
      method: "PATCH",
      body: payload,
      signal,
    }),

  createManual: (payload: ManualSimcardRequest, signal?: AbortSignal) =>
    request<{ simcardId: string; simcard: DatatemSimcard }>("/manual-simcards", {
      method: "POST",
      body: payload,
      signal,
    }),

  updateManual: (simcardId: string, payload: ManualSimcardUpdate, signal?: AbortSignal) =>
    request<{ simcardId: string; changed: boolean; simcard: DatatemSimcard }>(
      `/manual-simcards/${encodeURIComponent(simcardId)}`,
      { method: "PATCH", body: payload, signal },
    ),

  deleteManual: (simcardId: string, signal?: AbortSignal) =>
    request<{ simcardId: string; changed: boolean }>(`/manual-simcards/${encodeURIComponent(simcardId)}`, {
      method: "DELETE",
      signal,
    }),

  legacyMetadata: (signal?: AbortSignal) =>
    request<Record<string, Record<string, unknown>>>("/legacy-metadata", { signal }),
};

export function friendlyMessage(error: unknown): string {
  if (error instanceof DatatemApiError) return error.message;
  if (error instanceof DOMException && error.name === "AbortError") return "Operação cancelada.";
  return "Não foi possível concluir a operação.";
}

export function isSingleSimcard(value: SimcardDetailResponse | DatatemSimcard | null): value is SimcardDetailResponse {
  return Boolean(value && "simcard" in value);
}
