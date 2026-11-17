import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Save, Wrench, X } from "lucide-react";
import type { Opportunity } from "../../types";
import type { AssignPayload, ManualSimcardRequest } from "../../types/simcard";

interface ManualSimcardModalProps {
  opportunities: Opportunity[];
  busy: boolean;
  onClose: () => void;
  onCreate: (payload: ManualSimcardRequest) => Promise<boolean>;
}

const inputClass =
  "w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] transition-all";
const labelClass = "text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] block mb-1.5";

export function ManualSimcardModal({ opportunities, busy, onClose, onCreate }: ManualSimcardModalProps) {
  const [iccid, setIccid] = useState("");
  const [technology, setTechnology] = useState<"4G" | "NB-IoT">("4G");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [notes, setNotes] = useState("");
  const [destinationType, setDestinationType] = useState<"opportunity" | "manual_project">("manual_project");
  const [opportunityId, setOpportunityId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [equipment, setEquipment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedOpportunity = useMemo(
    () => opportunities.find((opportunity) => opportunity.id === opportunityId) || null,
    [opportunities, opportunityId],
  );

  const canSubmit =
    iccid.replace(/\s/g, "").length > 0 &&
    (destinationType === "opportunity" ? Boolean(opportunityId) : Boolean(projectName.trim()));

  const submit = async () => {
    if (!canSubmit || busy) return;
    const destination: AssignPayload = {
      destinationType,
      opportunityId: destinationType === "opportunity" ? opportunityId : null,
      opportunityName: destinationType === "opportunity" ? selectedOpportunity?.description || null : null,
      projectName: destinationType === "manual_project" ? projectName.trim() : null,
      clientName: clientName.trim() || null,
      equipment: equipment.trim() || null,
      technology,
      notes: notes.trim() || null,
    };
    const payload: ManualSimcardRequest = {
      simcard: {
        iccid: iccid.replace(/\s/g, ""),
        technology,
        phoneNumber: phoneNumber.trim() || null,
        operatorName: operatorName.trim() || null,
        notes: notes.trim() || null,
      },
      destination,
    };
    setError(null);
    const success = await onCreate(payload);
    if (success) onClose();
    else setError("Não foi possível cadastrar e atribuir o SIM manual. Confira os dados e tente novamente.");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
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
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-amber-600 dark:text-amber-400">
              <Wrench size={13} />
              <span className="text-[9px] font-black uppercase tracking-[0.18em]">Manual · não DATATEM</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-primary)] m-0">Cadastrar SIM manual</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-2 mb-0">
              O chip será criado fora do inventário DATATEM e entrará no mesmo fluxo de atribuição e auditoria.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="w-10 h-10 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-rose-500 transition-all disabled:opacity-50 flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 flex items-start gap-2.5 mb-6">
          <AlertTriangle size={15} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300 m-0">
            Este SIM não será consultado na DATATEM e não terá dados de conectividade oficiais. A origem ficará visível no
            card, nos detalhes e no histórico.
          </p>
        </div>

        <section className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-app)]/60 p-5">
          <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-secondary)] m-0 mb-4">
            Identificação do SIM
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>ICCID *</label>
              <input value={iccid} onChange={(event) => setIccid(event.target.value)} className={inputClass} placeholder="8955..." />
            </div>
            <div>
              <label className={labelClass}>Tecnologia *</label>
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-1">
                {(["4G", "NB-IoT"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setTechnology(option)}
                    className={`h-9 rounded-lg text-xs font-black transition-all ${
                      technology === option
                        ? "bg-[var(--accent-color)] text-white shadow-sm"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Linha</label>
              <input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} className={inputClass} placeholder="Opcional" />
            </div>
            <div>
              <label className={labelClass}>Operadora</label>
              <input value={operatorName} onChange={(event) => setOperatorName(event.target.value)} className={inputClass} placeholder="Opcional" />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Observações</label>
              <input value={notes} onChange={(event) => setNotes(event.target.value)} className={inputClass} placeholder="Local, finalidade ou observação interna" />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-app)]/60 p-5 mt-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-secondary)] m-0 mb-4">
            Atribuição imediata
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={() => setDestinationType("manual_project")}
              className={`rounded-xl border px-4 py-3 text-left transition-all ${
                destinationType === "manual_project"
                  ? "border-[var(--accent-color)] bg-[var(--accent-color)]/10"
                  : "border-[var(--border-color)] bg-[var(--card-bg)]"
              }`}
            >
              <span className="block text-xs font-black text-[var(--text-primary)]">Projeto manual</span>
              <span className="block text-[10px] text-[var(--text-secondary)] mt-0.5">Uso interno ou avulso</span>
            </button>
            <button
              type="button"
              onClick={() => setDestinationType("opportunity")}
              className={`rounded-xl border px-4 py-3 text-left transition-all ${
                destinationType === "opportunity"
                  ? "border-[var(--accent-color)] bg-[var(--accent-color)]/10"
                  : "border-[var(--border-color)] bg-[var(--card-bg)]"
              }`}
            >
              <span className="block text-xs font-black text-[var(--text-primary)]">Oportunidade</span>
              <span className="block text-[10px] text-[var(--text-secondary)] mt-0.5">Vincular à carteira real</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {destinationType === "opportunity" ? (
              <div className="md:col-span-2">
                <label className={labelClass}>Oportunidade *</label>
                <select value={opportunityId} onChange={(event) => setOpportunityId(event.target.value)} className={inputClass}>
                  <option value="">Selecione uma oportunidade</option>
                  {opportunities.map((opportunity) => (
                    <option key={opportunity.id} value={opportunity.id}>
                      {opportunity.description || "Sem descrição"}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="md:col-span-2">
                <label className={labelClass}>Projeto *</label>
                <input value={projectName} onChange={(event) => setProjectName(event.target.value)} className={inputClass} placeholder="Ex.: Medidores inteligentes" />
              </div>
            )}
            <div>
              <label className={labelClass}>Cliente</label>
              <input value={clientName} onChange={(event) => setClientName(event.target.value)} className={inputClass} placeholder="Nome do cliente" />
            </div>
            <div>
              <label className={labelClass}>Equipamento</label>
              <input value={equipment} onChange={(event) => setEquipment(event.target.value)} className={inputClass} placeholder="Onde o chip será instalado" />
            </div>
          </div>
        </section>

        {error && <p className="text-xs text-rose-500 mt-4 mb-0">{error}</p>}

        <div className="flex items-center justify-end gap-3 mt-7">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="h-11 px-5 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] text-xs font-bold hover:text-[var(--text-primary)] transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={!canSubmit || busy}
            className="h-11 px-5 rounded-xl bg-[var(--accent-color)] text-white text-xs font-bold flex items-center gap-2 disabled:opacity-50 transition-all"
          >
            {busy ? <Save size={14} className="animate-pulse" /> : <ArrowRight size={14} />}
            Cadastrar e atribuir
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
