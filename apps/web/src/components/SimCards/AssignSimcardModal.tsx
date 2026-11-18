import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Box, Building2, Save, X } from "lucide-react";
import type { Opportunity } from "../../types";
import type { AssignPayload, InventoryItem } from "../../types/simcard";
import { Button } from "../ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

interface AssignSimcardModalProps {
  item: InventoryItem;
  opportunities: Opportunity[];
  busy: boolean;
  onClose: () => void;
  onAssign: (payload: AssignPayload) => Promise<boolean>;
}

const inputClass =
  "w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] transition-all";
const labelClass = "text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] block mb-1.5";

export function AssignSimcardModal({ item, opportunities, busy, onClose, onAssign }: AssignSimcardModalProps) {
  const current = item.assignment;
  const [destinationType, setDestinationType] = useState<"opportunity" | "manual_project">(
    current?.destinationType === "opportunity" ? "opportunity" : "manual_project",
  );
  const [opportunityId, setOpportunityId] = useState(current?.opportunityId || "");
  const [projectName, setProjectName] = useState(current?.projectName || "");
  const [clientName, setClientName] = useState(current?.clientName || "");
  const [equipment, setEquipment] = useState(current?.equipment || "");
  const [technology, setTechnology] = useState(current?.technology || item.simcard.operatorNetworkName || "");
  const [notes, setNotes] = useState(current?.notes || "");
  const [error, setError] = useState<string | null>(null);

  const selectedOpportunity = useMemo(
    () => opportunities.find((opportunity) => opportunity.id === opportunityId) || null,
    [opportunities, opportunityId],
  );

  const canSubmit = destinationType === "opportunity" ? Boolean(opportunityId) : Boolean(projectName.trim());

  const submit = async () => {
    if (!canSubmit || busy) return;
    const payload: AssignPayload = {
      destinationType,
      opportunityId: destinationType === "opportunity" ? opportunityId : null,
      opportunityName: destinationType === "opportunity" ? selectedOpportunity?.description || null : null,
      projectName: destinationType === "manual_project" ? projectName.trim() : null,
      clientName: clientName.trim() || null,
      equipment: equipment.trim() || null,
      technology: technology.trim() || null,
      notes: notes.trim() || null,
    };
    setError(null);
    const success = await onAssign(payload);
    if (success) onClose();
    else setError("Não foi possível atribuir o chip. Confira os dados e tente novamente.");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <motion.div
        initial={{ y: 24, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 16, scale: 0.97 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] border border-[var(--border-color)] bg-[var(--card-bg)] shadow-2xl p-6 md:p-8"
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-primary)] m-0">Atribuir chip</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1 mb-0 font-mono">
              {item.simcard.phoneNumber || item.simcard.iccid || item.simcard.id}
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

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setDestinationType("manual_project")}
            className={`rounded-xl border px-4 py-3 text-left transition-all ${destinationType === "manual_project" ? "border-[var(--accent-color)] bg-[var(--accent-color)]/10" : "border-[var(--border-color)] bg-[var(--bg-app)]"}`}
          >
            <Box size={16} className="text-[var(--accent-color)] mb-1.5" />
            <span className="block text-xs font-black text-[var(--text-primary)]">Projeto manual</span>
            <span className="block text-[10px] text-[var(--text-secondary)] mt-0.5">Uso interno ou avulso</span>
          </button>
          <button
            type="button"
            onClick={() => setDestinationType("opportunity")}
            className={`rounded-xl border px-4 py-3 text-left transition-all ${destinationType === "opportunity" ? "border-[var(--accent-color)] bg-[var(--accent-color)]/10" : "border-[var(--border-color)] bg-[var(--bg-app)]"}`}
          >
            <Building2 size={16} className="text-[var(--accent-color)] mb-1.5" />
            <span className="block text-xs font-black text-[var(--text-primary)]">Oportunidade</span>
            <span className="block text-[10px] text-[var(--text-secondary)] mt-0.5">Vincular à carteira real</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       {destinationType === "opportunity" ? (
        <div className="md:col-span-2">
          <label className={labelClass}>Oportunidade</label>

              <Combobox
                  items={opportunities}
                  value={selectedOpportunity}
                  onValueChange={(opportunity) => {
                    setOpportunityId(opportunity?.id ?? "");
                    setError(null);
                  }}
                  itemToStringLabel={(opportunity) =>
                    opportunity.description || "Sem descrição"
                  }
                >
                  <ComboboxInput
                    className=""
                    placeholder="Buscar oportunidade..."
                  />

                  <ComboboxContent>
                    <ComboboxEmpty>
                      Nenhuma oportunidade encontrada.
                    </ComboboxEmpty>

                    <ComboboxList data-lenis-prevent>
                      {(opportunity) => (
                        <ComboboxItem key={opportunity.id} value={opportunity}>
                          <span className="truncate">
                            {opportunity.description || "Sem descrição"}
                          </span>

                          {opportunity.utility && (
                            <span className="ml-auto shrink-0 text-xs text-[var(--text-secondary)]">
                              {opportunity.utility}
                            </span>
                          )}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            ) : (
        <div className="md:col-span-2">
          <label className={labelClass}>Projeto *</label>
          <input
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            className={inputClass}
            placeholder="Ex.: Medidores inteligentes"
          />
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
          <div>
            <label className={labelClass}>Tecnologia</label>
            <input value={technology} onChange={(event) => setTechnology(event.target.value)} className={inputClass} placeholder="NB-IoT, 4G..." />
          </div>
          <div>
            <label className={labelClass}>Observações</label>
            <input value={notes} onChange={(event) => setNotes(event.target.value)} className={inputClass} placeholder="Informações adicionais" />
          </div>
        </div>

        {error && <p className="text-xs text-rose-500 mt-4 mb-0">{error}</p>}

        <div className="flex items-center justify-end gap-3 mt-7">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={busy}
            className=""
          >
            Cancelar
          </Button>
          <Button
            variant="greenlight"
            onClick={() => void submit()}
            disabled={!canSubmit || busy}
            className=""
          >
            {busy ? <Save size={14} className="animate-pulse" /> : <ArrowRight size={14} />}
            Confirmar atribuição
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
