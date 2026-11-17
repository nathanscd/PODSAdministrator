import { Clock3, Hash } from "lucide-react";
import type { AssignmentHistoryEvent } from "../../types/simcard";
import { displayValue, formatDateTime, sourceLabel } from "../../utils/simcard";

interface AssignmentHistoryProps {
  history: AssignmentHistoryEvent[];
  error: string | null;
}

const EVENT_LABELS: Record<AssignmentHistoryEvent["type"], string> = {
  created: "SIM manual criado",
  assigned: "Atribuição",
  transfer: "Transferência",
  released: "Liberação",
  metadata_updated: "Atualização de metadados",
  manual_updated: "SIM manual atualizado",
  deleted: "SIM manual excluído",
};

export function AssignmentHistory({ history, error }: AssignmentHistoryProps) {
  return (
    <section className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-xl p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Clock3 size={16} className="text-[var(--accent-color)]" />
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[var(--text-primary)] m-0">
          Histórico de movimentações
        </h2>
      </div>
      {error ? (
        <p className="text-xs text-amber-500 mb-0">{error}</p>
      ) : history.length === 0 ? (
        <p className="text-xs text-[var(--text-secondary)] mb-0">Nenhuma movimentação registrada até o momento.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {history.map((event) => (
            <div key={event.id} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-app)]/60 p-4 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-color)]">
                    {EVENT_LABELS[event.type]}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] ${
                      event.source === "manual"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                    }`}
                  >
                    {sourceLabel(event.source)}
                  </span>
                </div>
                <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1.5 shrink-0">
                  <Hash size={10} /> {formatDateTime(event.performedAt)}
                </span>
              </div>
              <p className="text-xs font-bold text-[var(--text-primary)] m-0 truncate">
                {displayValue(event.destinationTo?.projectName || event.destinationTo?.opportunityName || event.destinationFrom?.projectName || event.destinationFrom?.opportunityName, "Sem destino informado")}
              </p>
              <p className="text-[10px] text-[var(--text-secondary)] mt-1 mb-0 truncate">
                {displayValue(event.phoneNumber || event.iccid || event.datatemSimcardId)}
                {event.performedBy?.name ? ` · ${event.performedBy.name}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
