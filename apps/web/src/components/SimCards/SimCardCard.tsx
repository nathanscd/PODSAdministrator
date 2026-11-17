import { motion } from "framer-motion";
import { ArrowRight, Box, Cpu, Hash, RadioTower, Signal, Unlink, UserCog, Users, Wrench } from "lucide-react";
import type { InventoryItem } from "../../types/simcard";
import { displayValue, formatDateTime, sourceLabel, sourceOf, technologyGroupOf } from "../../utils/simcard";

interface SimCardCardProps {
  item: InventoryItem;
  busy: boolean;
  onAssign: () => void;
  onRelease: () => void;
  onDetails: () => void;
}

function carrierGradient(operator: string | null): string {
  const name = (operator || "").toLowerCase();
  if (name.includes("vivo")) return "from-[#660099] to-[#8a2be2]";
  if (name.includes("claro")) return "from-[#e32636] to-[#ff4d4d]";
  if (name.includes("tim")) return "from-[#1d4ed8] to-[#3b82f6]";
  if (name.includes("algar")) return "from-[#008638] to-[#00b34a]";
  return "from-slate-600 to-slate-400";
}

function statusStyle(status: InventoryItem["classification"]) {
  if (status === "available") return { label: "Disponível", className: "text-emerald-600 border-emerald-500/25 bg-emerald-500/10 dark:text-emerald-400" };
  if (status === "assigned") return { label: "Atribuído", className: "text-cyan-600 border-cyan-500/25 bg-cyan-500/10 dark:text-cyan-400" };
  if (status === "inactive") return { label: "Inativo", className: "text-rose-600 border-rose-500/25 bg-rose-500/10 dark:text-rose-400" };
  return { label: "Sem status", className: "text-amber-600 border-amber-500/25 bg-amber-500/10 dark:text-amber-400" };
}

export function SimCardCard({ item, busy, onAssign, onRelease, onDetails }: SimCardCardProps) {
  const { simcard, assignment, classification } = item;
  const status = statusStyle(classification);
  const isAssigned = assignment?.assignmentStatus === "assigned";
  const source = sourceOf(simcard);
  const isManual = source === "manual";
  const group = technologyGroupOf(simcard);
  const project = displayValue(
    assignment?.opportunityName || assignment?.projectName || item.legacyMetadata?.projeto,
  );
  const client = displayValue(assignment?.clientName || item.legacyMetadata?.cliente);
  const responsible = displayValue(assignment?.responsible?.name || item.legacyMetadata?.responsavel);
  const equipment = displayValue(assignment?.equipment || item.legacyMetadata?.equipamento);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative group"
    >
      <div
        className={`absolute inset-0 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
          isManual ? "bg-gradient-to-br from-amber-400/30 to-transparent" : "bg-gradient-to-br from-cyan-400/25 to-transparent"
        }`}
      />
      <div className="relative z-10 h-full rounded-[2rem] border border-[var(--border-color)] bg-[var(--glass-bg)] backdrop-blur-2xl p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevation)] transition-all duration-300 flex flex-col gap-5 hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-4">
          <div
            className={`w-14 h-20 rounded-2xl bg-gradient-to-br ${carrierGradient(simcard.operatorName)} shadow-lg relative overflow-hidden shrink-0 flex items-center justify-center ring-1 ring-white/15`}
            style={{ clipPath: "polygon(18px 0, 100% 0, 100% 100%, 0 100%, 0 18px)" }}
          >
            <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
            <div className="w-8 h-10 rounded-sm bg-gradient-to-b from-[#e6c27a] to-[#c59b40] border border-[#8b6b23] shadow-inner" />
            <span className="absolute bottom-1.5 left-1.5 text-[7px] font-black uppercase tracking-wider text-white/80">
              {displayValue(simcard.operatorName, "SIM")}
            </span>
          </div>

          <div className="flex flex-col items-end gap-2 min-w-0">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.14em] ${status.className}`}>
              <Signal size={10} />
              {status.label}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.14em] ${
                isManual
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
              }`}
            >
              {isManual ? <Wrench size={10} /> : <RadioTower size={10} />}
              {sourceLabel(source)}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-app)] text-[9px] font-black uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              {group === "NB-IoT" ? <Cpu size={10} /> : <RadioTower size={10} />}
              {group}
            </span>
          </div>
        </div>

        <div>
          <p className="text-[10px] tracking-[0.15em] text-[var(--text-secondary)] opacity-60 mb-1">Linha / ICCID</p>
          <p className="text-xl font-mono tracking-wider text-[var(--text-primary)] truncate m-0">
            {displayValue(simcard.phoneNumber || simcard.iccid, "Sem identificador")}
          </p>
          {simcard.phoneNumber && simcard.iccid && simcard.phoneNumber !== simcard.iccid && (
            <p className="text-[10px] font-mono text-[var(--text-secondary)] mt-1 mb-0 truncate">ICCID {simcard.iccid}</p>
          )}
        </div>

        <div className="h-[1px] w-full bg-[var(--border-color)] opacity-50" />

        <div className="grid grid-cols-2 gap-4">
          <div className="min-w-0">
            <span className="text-[9px] uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-1"><Box size={10} /> Projeto</span>
            <span className="text-xs text-[var(--text-primary)] truncate block">{project}</span>
          </div>
          <div className="min-w-0">
            <span className="text-[9px] uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-1"><Users size={10} /> Cliente</span>
            <span className="text-xs text-[var(--text-primary)] truncate block">{client}</span>
          </div>
          <div className="min-w-0">
            <span className="text-[9px] uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-1"><UserCog size={10} /> Responsável</span>
            <span className="text-xs text-[var(--text-primary)] truncate block">{responsible}</span>
          </div>
          <div className="min-w-0">
            <span className="text-[9px] uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-1"><Wrench size={10} /> Equipamento</span>
            <span className="text-xs text-[var(--text-primary)] truncate block">{equipment}</span>
          </div>
        </div>

        {isAssigned && assignment?.assignedAt && (
          <p className="text-[10px] text-[var(--text-secondary)] opacity-70 mb-0 flex items-center gap-1.5">
            <Hash size={10} /> Atribuído em {formatDateTime(assignment.assignedAt)}
          </p>
        )}

        <div className="flex items-center gap-2 mt-auto pt-1">
          <button
            type="button"
            onClick={onDetails}
            className="flex-1 h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-app)] text-[var(--text-primary)] text-xs font-bold hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] transition-all"
          >
            Detalhes
          </button>
          {isAssigned ? (
            <button
              type="button"
              onClick={onRelease}
              disabled={busy}
              className="flex-1 h-11 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs font-bold hover:bg-rose-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Unlink size={14} /> Liberar
            </button>
          ) : (
            <button
              type="button"
              onClick={onAssign}
              disabled={busy || classification === "inactive"}
              className="flex-1 h-11 rounded-xl bg-[var(--accent-color)] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_25px_rgba(0,0,0,0.18)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title={classification === "inactive" ? "Chips inativos não podem ser atribuídos" : undefined}
            >
              Atribuir <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
