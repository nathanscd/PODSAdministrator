import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Building2, Clock3, Hash, LockKeyhole, RadioTower, Save, Trash2, Unlink, Wrench, X } from "lucide-react";
import type {
  AssignmentHistoryEvent,
  AssignmentUpdatePayload,
  InventoryItem,
  ManualSimcardUpdate,
  TechnologyGroup,
} from "../../types/simcard";
import { displayValue, formatDateTime, sourceLabel, sourceOf, technologyGroupOf } from "../../utils/simcard";
import { Button } from "@/components/ui/button";

interface SimcardDetailsModalProps {
  item: InventoryItem;
  history: AssignmentHistoryEvent[];
  connectionsAvailable: boolean;
  busy: boolean;
  onClose: () => void;
  onUpdate: (payload: AssignmentUpdatePayload) => Promise<boolean>;
  onUpdateManual: (payload: ManualSimcardUpdate) => Promise<boolean>;
  onRelease: () => Promise<void>;
  onDelete: () => Promise<void>;
}

const inputClass =
  "w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] transition-all";
const labelClass = "text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] block mb-1";

const EVENT_LABELS: Record<AssignmentHistoryEvent["type"], string> = {
  created: "SIM manual criado",
  assigned: "Atribuição",
  transfer: "Transferência",
  released: "Liberação",
  metadata_updated: "Atualização de metadados",
  manual_updated: "SIM manual atualizado",
  deleted: "SIM manual excluído",
};

function Field({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="min-w-0">
      <span className={labelClass}>{label}</span>
      <span className="text-xs text-[var(--text-primary)] block truncate">{displayValue(value)}</span>
    </div>
  );
}

export function SimcardDetailsModal({
  item,
  history,
  connectionsAvailable,
  busy,
  onClose,
  onUpdate,
  onUpdateManual,
  onRelease,
  onDelete,
}: SimcardDetailsModalProps) {
  const assignment = item.assignment;
  const isAssigned = assignment?.assignmentStatus === "assigned";
  const source = sourceOf(item.simcard);
  const isManual = source === "manual";
  const group = technologyGroupOf(item.simcard);
  const [iccid, setIccid] = useState(item.simcard.iccid || "");
  const [manualTechnology, setManualTechnology] = useState<Exclude<TechnologyGroup, "Outros">>(
    group === "NB-IoT" ? "NB-IoT" : "4G",
  );
  const [phoneNumber, setPhoneNumber] = useState(item.simcard.phoneNumber || "");
  const [operatorName, setOperatorName] = useState(item.simcard.operatorName || "");
  const [manualNotes, setManualNotes] = useState(item.simcard.notes || "");
  const [projectName, setProjectName] = useState(assignment?.projectName || assignment?.opportunityName || "");
  const [clientName, setClientName] = useState(assignment?.clientName || "");
  const [equipment, setEquipment] = useState(assignment?.equipment || "");
  const [technology, setTechnology] = useState(assignment?.technology || "");
  const [notes, setNotes] = useState(assignment?.notes || "");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simcardHistory = history.filter(
    (event) =>
      (!event.simcardId || event.simcardId === item.simcard.id) &&
      (!event.datatemSimcardId || event.datatemSimcardId === item.simcard.id) &&
      (!event.iccid || !item.simcard.iccid || event.iccid === item.simcard.iccid),
  );
  const connectionEntries = Object.entries(item.connection?.fields || {}).filter(([, value]) => value != null);

  const save = async () => {
    setError(null);
    if (isManual) {
      const manualPayload: ManualSimcardUpdate = {
        iccid: iccid.replace(/\s/g, ""),
        technology: manualTechnology,
        phoneNumber: phoneNumber.trim() || null,
        operatorName: operatorName.trim() || null,
        notes: manualNotes.trim() || null,
      };
      const manualSuccess = await onUpdateManual(manualPayload);
      if (!manualSuccess) {
        setError("Não foi possível salvar os dados do SIM manual.");
        return;
      }
    }
    if (isAssigned) {
      const assignmentPayload: AssignmentUpdatePayload = {
        projectName: projectName.trim() || null,
        clientName: clientName.trim() || null,
        equipment: equipment.trim() || null,
        technology: technology.trim() || null,
        notes: notes.trim() || null,
      };
      const assignmentSuccess = await onUpdate(assignmentPayload);
      if (!assignmentSuccess) {
        setError("Não foi possível salvar a atribuição.");
        return;
      }
    }
    setEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4" data-lenis-prevent
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <motion.div
        initial={{ y: 24, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 16, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2rem] border border-[var(--border-color)] bg-[var(--card-bg)] shadow-[var(--shadow-elevation)] p-6 md:p-8"
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-app)] px-3 py-1.5" >
              {isManual ? <Wrench size={13} className="text-amber-500" /> : <RadioTower size={13} className="text-cyan-500" />}
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                {sourceLabel(source)}
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-primary)] m-0">Detalhes do chip</h2>
            <p className="text-xs font-mono text-[var(--text-secondary)] mt-2 mb-0">
              {item.simcard.phoneNumber || item.simcard.iccid || item.simcard.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="w-10 h-10 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-rose-500 transition-all flex items-center justify-center disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-app)]/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            {isManual ? <Wrench size={14} className="text-amber-500" /> : <LockKeyhole size={14} className="text-[var(--accent-color)]" />}
            <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)] m-0">
              {isManual ? "Dados do SIM manual" : "Dados originais DATATEM"}
            </h3>
          </div>
          {isManual && editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div><label className={labelClass}>ICCID</label><input value={iccid} onChange={(event) => setIccid(event.target.value)} className={inputClass} /></div>
              <div>
                <label className={labelClass}>Tecnologia</label>
                <select
                  value={manualTechnology}
                  onChange={(event) => setManualTechnology(event.target.value as Exclude<TechnologyGroup, "Outros">)}
                  className={inputClass}
                >
                  <option value="4G">4G</option>
                  <option value="NB-IoT">NB-IoT</option>
                </select>
              </div>
              <div><label className={labelClass}>Linha</label><input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Operadora</label><input value={operatorName} onChange={(event) => setOperatorName(event.target.value)} className={inputClass} /></div>
              <div className="md:col-span-2"><label className={labelClass}>Observações</label><input value={manualNotes} onChange={(event) => setManualNotes(event.target.value)} className={inputClass} /></div>
            </div>
          ) : isManual ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="ICCID" value={item.simcard.iccid} />
              <Field label="Linha" value={item.simcard.phoneNumber} />
              <Field label="Operadora" value={item.simcard.operatorName} />
              <Field label="Tecnologia" value={group} />
              <Field label="Observações" value={item.simcard.notes} />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="ICCID" value={item.simcard.iccid} />
              <Field label="Linha" value={item.simcard.phoneNumber} />
              <Field label="Operadora" value={item.simcard.operatorName} />
              <Field label="Rede" value={item.simcard.operatorNetworkName || item.simcard.technology} />
              <Field label="Status operadora" value={item.simcard.operatorStatusName} />
              <Field label="Status DATATEM" value={item.simcard.statusName} />
              <Field label="Status operacional" value={item.simcard.operationalStatusName} />
              <Field label="APNs" value={item.simcard.apns.join(", ")} />
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-app)]/60 p-5 mt-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-[var(--accent-color)]" />
              <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)] m-0">Atribuição atual</h3>
            </div>
            {isAssigned && !editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-color)] hover:underline"
              >
                Editar
              </button>
            )}
          </div>

          {!assignment || assignment.assignmentStatus === "released" ? (
            <p className="text-xs text-[var(--text-secondary)] mb-0">Este chip não está atribuído no momento.</p>
          ) : editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div><label className={labelClass}>Projeto</label><input value={projectName} onChange={(e) => setProjectName(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Cliente</label><input value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Equipamento</label><input value={equipment} onChange={(e) => setEquipment(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Tecnologia</label><input value={technology} onChange={(e) => setTechnology(e.target.value)} className={inputClass} /></div>
              <div className="md:col-span-2"><label className={labelClass}>Observações</label><input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} /></div>
              <div className="md:col-span-2 flex items-center justify-end gap-2 mt-1">
                <button type="button" onClick={() => setEditing(false)} className="h-9 px-4 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] text-xs font-bold">Cancelar</button>
                <button type="button" onClick={() => void save()} disabled={busy} className="h-9 px-4 rounded-lg bg-[var(--accent-color)] text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"><Save size={13} /> Salvar</button>
              </div>
              {error && <p className="text-xs text-rose-500 md:col-span-2 mb-0">{error}</p>}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Projeto / Oportunidade" value={assignment.opportunityName || assignment.projectName} />
              <Field label="Cliente" value={assignment.clientName} />
              <Field label="Responsável" value={assignment.responsible?.name} />
              <Field label="Equipamento" value={assignment.equipment} />
              <Field label="Tecnologia" value={assignment.technology} />
              <Field label="Atribuído em" value={formatDateTime(assignment.assignedAt)} />
              <Field label="Observações" value={assignment.notes} />
            </div>
          )}
        </section>

        {!isManual && (
          <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-app)]/60 p-5 mt-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={14} className="text-[var(--accent-color)]" />
              <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)] m-0">
                Conectividade informada pela DATATEM
              </h3>
            </div>
            {!connectionsAvailable ? (
              <p className="text-xs text-[var(--text-secondary)] mb-0">Informações de conectividade indisponíveis no momento.</p>
            ) : connectionEntries.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)] mb-0">Nenhum dado de conectividade retornado para este chip.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {connectionEntries.map(([key, value]) => (
                  <Field key={key} label={key} value={typeof value === "object" ? JSON.stringify(value) : value} />
                ))}
              </div>
            )}
          </section>
        )}

        <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-app)]/60 p-5 mt-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock3 size={14} className="text-[var(--accent-color)]" />
            <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)] m-0">Histórico</h3>
          </div>
          {simcardHistory.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)] mb-0">Nenhuma movimentação registrada.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {simcardHistory.map((event) => (
                <div key={event.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--text-primary)] m-0">{EVENT_LABELS[event.type]}</p>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 mb-0 truncate">
                      {displayValue(event.destinationTo?.projectName || event.destinationTo?.opportunityName || event.destinationFrom?.projectName || event.destinationFrom?.opportunityName, "Sem destino informado")}
                      {event.performedBy?.name ? ` · ${event.performedBy.name}` : ""}
                    </p>
                  </div>
                  <span className="text-[10px] text-[var(--text-secondary)] shrink-0 flex items-center gap-1.5">
                    <Hash size={10} /> {formatDateTime(event.performedAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex flex-wrap items-center justify-end gap-3 mt-6">
          {isManual && (
            <button
              type="button"
              onClick={() => void onDelete()}
              disabled={busy}
              className="h-11 px-5 rounded-xl border border-rose-500/30 bg-rose-500/5 text-rose-500 text-xs font-bold flex items-center gap-2 hover:bg-rose-500/15 disabled:opacity-50 transition-all"
            >
              <Trash2 size={14} /> Excluir SIM manual
            </button>
          )}
          {isAssigned && (
            <Button
              variant="destructive"
              onClick={() => void onRelease()}
              disabled={busy}
              className=""
            >
              <Unlink size={14} /> Liberar chip
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
