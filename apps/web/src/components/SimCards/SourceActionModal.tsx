import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Database, RadioTower, Search, Wrench, X } from "lucide-react";
import type { InventoryItem, SimcardSource } from "../../types/simcard";
import { displayValue, sourceLabel, sourceOf } from "../../utils/simcard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2rem] border border-[var(--border-color)] bg-[var(--card-bg)] p-6 shadow-[var(--shadow-elevation)] md:p-8" data-lenis-prevent
      >
        <div className="flex items-start justify-between gap-4 mb-7">
          <div>
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
          </button>
        </div>

        {showDatatemList && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mt-5 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-app)]/60 p-4"
          >
            {/* Pesquisa */}
            <div className="relative mb-3">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none z-10"
              />

              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar ICCID, linha ou operadora..."
                className="
                  h-11 w-full rounded-xl
                  border-[var(--border-color)]
                  bg-[var(--card-bg)]
                  pl-10 pr-3
                  text-xs text-[var(--text-primary)]
                  placeholder:text-[var(--text-secondary)]/60
                  focus-visible:border-[var(--accent-color)]
                  focus-visible:ring-[var(--accent-color)]/20
                "
              />
            </div>

            {/* Lista de chips */}
            <div
              className="max-h-64 overflow-y-auto overscroll-contain flex flex-col gap-2 pr-1"
              data-lenis-prevent
            >
              {filtered.length === 0 ? (
                <div className="
                  flex flex-col items-center justify-center
                  rounded-2xl border border-dashed
                  border-[var(--border-color)]
                  bg-[var(--card-bg)]/50
                  py-8 px-4 text-center
                ">
                  <Search
                    size={20}
                    className="text-[var(--text-secondary)] opacity-50 mb-2"
                  />

                  <p className="text-xs font-semibold text-[var(--text-primary)] mb-1">
                    Nenhum chip encontrado
                  </p>

                  <p className="text-[10px] text-[var(--text-secondary)] mb-0">
                    Tente buscar por outro ICCID, linha ou operadora.
                  </p>
                </div>
              ) : (
                filtered.map((item) => (
                  <Button
                    key={item.simcard.id}
                    type="button"
                    variant="ghost"
                    onClick={() => onDatatem(item)}
                    className="
                      group h-auto w-full
                      flex-col items-start justify-center
                      whitespace-normal
                      rounded-2xl border
                      border-[var(--border-color)]
                      bg-[var(--card-bg)]
                      px-4 py-3
                      text-left
                      transition-all duration-200
                      hover:border-[var(--accent-color)]/50
                      hover:bg-[var(--accent-color)]/5
                      active:translate-y-0
                    "
                  >
                    <div className="flex w-full items-center justify-between gap-3">
                      <p className="
                        min-w-0 truncate
                        text-xs font-bold
                        text-[var(--text-primary)]
                        m-0
                      ">
                        {displayValue(
                          item.simcard.phoneNumber || item.simcard.iccid,
                          "Sem identificador"
                        )}
                      </p>

                      <ArrowRight
                        size={14}
                        className="
                          shrink-0
                          text-[var(--text-secondary)]
                          opacity-0
                          -translate-x-1
                          transition-all duration-200
                          group-hover:translate-x-0
                          group-hover:opacity-100
                          group-hover:text-[var(--accent-color)]
                        "
                      />
                    </div>

                    <p className="
                      w-full truncate
                      text-[10px]
                      text-[var(--text-secondary)]
                      mt-1 mb-0
                      font-normal
                    ">
                      {displayValue(
                        item.simcard.operatorName,
                        "Operadora não informada"
                      )}
                      {" · "}
                      {displayValue(
                        item.simcard.operatorNetworkName,
                        "Tecnologia não informada"
                      )}
                    </p>
                  </Button>
                ))
              )}
            </div>

            {/* Contador */}
            {filtered.length > 0 && (
              <div className="
                flex items-center justify-between
                border-t border-[var(--border-color)]
                mt-3 pt-3
              ">
                <span className="text-[10px] text-[var(--text-secondary)]">
                  Chips disponíveis
                </span>

                <span className="
                  text-[10px] font-bold tabular-nums
                  text-[var(--accent-color)]
                ">
                  {filtered.length}
                </span>
              </div>
            )}
          </motion.section>
        )}
      </motion.div>
    </motion.div>
  );
}
