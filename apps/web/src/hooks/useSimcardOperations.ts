import { useCallback, useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { useToast } from "../contexts/ToastContext";
import { datatemApi, friendlyMessage } from "../services/DatatemService";
import type {
  AssignPayload,
  AssignmentHistoryEvent,
  AssignmentUpdatePayload,
  ManualSimcardRequest,
  ManualSimcardUpdate,
  SimcardAssignment,
} from "../types/simcard";
import { mapAssignmentDocument, mapHistoryDocument } from "../utils/simcard";

const HISTORY_LIMIT = 200;

export function useSimcardOperations(enabled: boolean) {
  const { addToast } = useToast();
  const [assignments, setAssignments] = useState<Record<string, SimcardAssignment>>({});
  const [history, setHistory] = useState<AssignmentHistoryEvent[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [busyIds, setBusyIds] = useState<string[]>([]);

  useEffect(() => {
    if (!enabled) return;
    const unassignments = onSnapshot(
      collection(db, "chipAssignments"),
      (snapshot) => {
        const next: Record<string, SimcardAssignment> = {};
        snapshot.docs.forEach((document) => {
          next[document.id] = mapAssignmentDocument(document.id, document.data());
        });
        setAssignments(next);
      },
      () => addToast("Não foi possível acompanhar as atribuições em tempo real.", "error"),
    );
    const unhistory = onSnapshot(
      query(collection(db, "chipAssignmentHistory"), orderBy("performedAt", "desc"), limit(HISTORY_LIMIT)),
      (snapshot) => {
        setHistory(snapshot.docs.map((document) => mapHistoryDocument(document.id, document.data())));
        setHistoryError(null);
      },
      () => setHistoryError("O histórico de movimentações não está disponível no momento."),
    );
    return () => {
      unassignments();
      unhistory();
    };
  }, [enabled, addToast]);

  const runOperation = useCallback(
    async (simcardId: string, successMessage: string, operation: () => Promise<unknown>): Promise<boolean> => {
      setBusyIds((previous) => [...new Set([...previous, simcardId])]);
      try {
        await operation();
        addToast(successMessage, "success");
        return true;
      } catch (error) {
        addToast(friendlyMessage(error), "error");
        return false;
      } finally {
        setBusyIds((previous) => previous.filter((id) => id !== simcardId));
      }
    },
    [addToast],
  );

  const assign = useCallback(
    async (simcardId: string, payload: AssignPayload) =>
      runOperation(simcardId, "Chip atribuído com sucesso.", () => datatemApi.assign(simcardId, payload)),
    [runOperation],
  );

  const release = useCallback(
    async (simcardId: string) =>
      runOperation(simcardId, "Chip liberado com sucesso.", () => datatemApi.release(simcardId)),
    [runOperation],
  );

  const updateMetadata = useCallback(
    async (simcardId: string, payload: AssignmentUpdatePayload) =>
      runOperation(simcardId, "Informações atualizadas.", () => datatemApi.updateAssignment(simcardId, payload)),
    [runOperation],
  );

  const createManual = useCallback(
    async (payload: ManualSimcardRequest) =>
      runOperation("manual-new", "SIM manual cadastrado e atribuído.", () => datatemApi.createManual(payload)),
    [runOperation],
  );

  const updateManual = useCallback(
    async (simcardId: string, payload: ManualSimcardUpdate) =>
      runOperation(simcardId, "SIM manual atualizado.", () => datatemApi.updateManual(simcardId, payload)),
    [runOperation],
  );

  const deleteManual = useCallback(
    async (simcardId: string) =>
      runOperation(simcardId, "SIM manual excluído.", () => datatemApi.deleteManual(simcardId)),
    [runOperation],
  );

  return {
    assignments,
    history,
    historyError,
    busyIds,
    assign,
    release,
    updateMetadata,
    createManual,
    updateManual,
    deleteManual,
  };
}
