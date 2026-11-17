import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Database, RadioTower, Search, Wrench, X } from "lucide-react";
import type { InventoryItem, SimcardSource } from "../../types/simcard";
import { displayValue, sourceLabel, sourceOf } from "../../utils/simcard";

interface SourceActionModalProps {
  items: InventoryItem[];
  onClose: () => void;
  onDatatem: (item: InventoryItem) => void;
  onManual: () => void;
}

const ACTION_CLASS =
  "group rounded-3xl border border-[var(--border-color)] bg-[var(--bg-app)]/70 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--accent-color)] hover:shadow-[var(--shadow-card)]";

function SourceBadge({ source }: { source: SimcardSource }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${
        source === "manual"
          ? "border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          : "border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
      }`}
    >
      {source === "manual" ? <Wrench size={10} /> : <RadioTower size={10} />}
      {sourceLabel(source)}
    </span>
  );
}

export function SourceActionModal({ items, onClose, onDatatem, onManual }: SourceActionModalProps) {
  const [query, setQuery] = useState("");
  const [showDatatemList, setShowDatatemList] = useState(false);

  const available = useMemo(
    () =>
      items.filter(
        (item) =>
          sourceOf(item.simcard) === "datatem" &&
          item.classification !== "assigned" &&
          item.classification !== "inactive",
      ),
    [items],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return available;
    return available.filter((item) =>
      [item.simcard.iccid, item.simcard.phoneNumber, item.simcard.operatorName, item.simcard.operatorNetworkName]
        .map((value) => displayValue(value, "").toLowerCase())
        .some((value) => value.includes(term)),
    );
  }, [available, query]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2rem] border border-[var(--border-color)] bg-[var(--card-bg)] p-6 shadow-[var(--shadow-elevation)] md:p-8"
      >
        <div className="flex items-start justify-between gap-4 mb-7">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-app)] px-3 py-1.5">
              <Database size={13} className="text-[var(--accent-color)]" />
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                Origem do SIM
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-primary)] m-0">Nova atribuição</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2 mb-0 max-w-xl">
              Escolha uma linha do inventário sincronizado ou cadastre um SIM manual, identificado fora da DATATEM.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-rose-500 transition-all flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button type="button" onClick={() => setShowDatatemList(true)} className={ACTION_CLASS}>
            <div className="flex items-start justify-between gap-3">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                <RadioTower size={20} />
              </div>
              <ArrowRight size={16} className="text-[var(--text-secondary)] group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-sm font-black text-[var(--text-primary)] mt-4 mb-1">Inventário DATATEM</p>
            <p className="text-xs text-[var(--text-secondary)] mb-3">
              Usa uma linha sincronizada, com conectividade e histórico oficial.
            </p>
            <SourceBadge source="datatem" />
          </button>

          <button type="button" onClick={onManual} className={ACTION_CLASS}>
            <div className="flex items-start justify-between gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Wrench size={20} />
              </div>
              <ArrowRight size={16} className="text-[var(--text-secondary)] group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-sm font-black text-[var(--text-primary)] mt-4 mb-1">SIM manual</p>
            <p className="text-xs text-[var(--text-secondary)] mb-3">
              Informe ICCID e tecnologia para um chip que não veio da DATATEM.
            </p>
            <SourceBadge source="manual" />
          </button>
        </div>

        {showDatatemList && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-app)]/60 p-4"
          >
            <div className="relative mb-3">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar ICCID, linha ou operadora..."
                className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
              />
            </div>
            <div className="max-h-64 overflow-y-auto flex flex-col gap-2">
              {filtered.length === 0 ? (
                <p className="text-xs text-[var(--text-secondary)] text-center py-6 mb-0">
                  Nenhum chip DATATEM disponível com esse termo.
                </p>
              ) : (
                filtered.map((item) => (
                  <button
                    key={item.simcard.id}
                    type="button"
                    onClick={() => onDatatem(item)}
                    className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] px-4 py-3 text-left hover:border-[var(--accent-color)] transition-all"
                  >
                    <p className="text-xs font-bold text-[var(--text-primary)] m-0">
                      {displayValue(item.simcard.phoneNumber || item.simcard.iccid, "Sem identificador")}
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-1 mb-0">
                      {displayValue(item.simcard.operatorName, "Operadora não informada")} ·{" "}
                      {displayValue(item.simcard.operatorNetworkName, "Tecnologia não informada")}
                    </p>
                  </button>
                ))
              )}
            </div>
          </motion.section>
        )}
      </motion.div>
    </motion.div>
  );
}
