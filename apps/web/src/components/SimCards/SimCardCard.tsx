
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Box,
  Cpu,
  Hash,
  RadioTower,
  Signal,
  Unlink,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";

import type { InventoryItem } from "../../types/simcard";
import {
  displayValue,
  formatDateTime,
  sourceLabel,
  sourceOf,
  technologyGroupOf,
} from "../../utils/simcard";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SimCardCardProps {
  item: InventoryItem;
  busy: boolean;
  onAssign: () => void;
  onRelease: () => void | Promise<void>;
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
  if (status === "available") {
    return {
      label: "Disponível",
      className: "bg-green-500 text-white",
    };
  }

  if (status === "assigned") {
    return {
      label: "Atribuído",
      className: "bg-red-500 text-white",
    };
  }

  if (status === "inactive") {
    return {
      label: "Inativo",
      className: "bg-grey-500 text-white opacity-70",
    };
  }

  return {
    label: "Sem status",
    className:
      "text-amber-600 border-amber-500/25 bg-amber-500/10 dark:text-amber-400",
  };
}

export function SimCardCard({
  item,
  busy,
  onAssign,
  onRelease,
  onDetails,
}: SimCardCardProps) {
  // Estado do Alert Dialog
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);

  // Confirmação da liberação
  const handleConfirmRelease = async () => {
    try {
      await onRelease();
      setReleaseDialogOpen(false);
    } catch (error) {
      console.error("Erro ao liberar chip:", error);
    }
  };

  // Dados do chip
  const { simcard, assignment, classification } = item;

  const status = statusStyle(classification);
  const isAssigned = assignment?.assignmentStatus === "assigned";

  const source = sourceOf(simcard);
  const isManual = source === "manual";
  const group = technologyGroupOf(simcard);

  const project = displayValue(
    assignment?.opportunityName ||
      assignment?.projectName ||
      item.legacyMetadata?.projeto
  );

  const client = displayValue(
    assignment?.clientName || item.legacyMetadata?.cliente
  );

  const responsible = displayValue(
    assignment?.responsible?.name ||
      item.legacyMetadata?.responsavel
  );

  const equipment = displayValue(
    assignment?.equipment ||
      item.legacyMetadata?.equipamento
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative group"
    >
      <div className="absolute inset-0 rounded-[2rem] blur-xl opacity-0 transition-opacity duration-500" />

      <div className="relative z-10 h-full rounded-[2rem] border border-[var(--border-color)] bg-[var(--glass-bg)] backdrop-blur-2xl p-6 duration-300 flex flex-col gap-5 hover:-translate-y-0.5" >

        {/* Cabeçalho do card */}
        <div className="flex items-start justify-between gap-4">
          <div
            className={`w-14 h-22 rounded-sm bg-gradient-to-br ${carrierGradient(
              simcard.operatorName
            )} shadow-lg relative overflow-hidden shrink-0 flex items-center justify-center ring-1 ring-white/15`}
            style={{
              clipPath:
                "polygon(18px 0, 100% 0, 100% 100%, 0 100%, 0 18px)",
            }}
          >
            <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />

            <div className="w-8 h-10 rounded-sm bg-gradient-to-b from-[#e6c27a] to-[#c59b40] border border-[#8b6b23] shadow-inner" />

            <span className="absolute bottom-1.5 left-1.5 text-[7px] font-black uppercase tracking-wider text-white/80">
              {displayValue(simcard.operatorName, "SIM")}
            </span>
          </div>

          <div className="flex flex-col items-end gap-2 min-w-0">
            <Badge
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-black uppercase rounded-full border text-[9px] tracking-[0.14em] ${status.className}`}
            >
              <Signal size={10} />
              {status.label}
            </Badge>

            <Badge
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.14em] ${
                isManual
                  ? "bg-[var(--card-bg)] text-[var(--text-primary)]"
                  : "bg-blue-500 text-white"
              }`}
            >
              {isManual ? (
                <Wrench size={10} />
              ) : (
                <RadioTower size={10} />
              )}
              {sourceLabel(source)}
            </Badge>

            <Badge className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-app)] text-[9px] font-black uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              {group === "NB-IoT" ? (
                <Cpu size={10} />
              ) : (
                <RadioTower size={10} />
              )}
              {group}
            </Badge>
          </div>
        </div>

        {/* Identificação do chip */}
        <div>
          <p className="text-[10px] tracking-[0.15em] text-[var(--text-secondary)] opacity-60 mb-1">
            Linha / ICCID
          </p>

          <p className="text-xl tracking-wider text-[var(--text-primary)] truncate m-0">
            {displayValue(
              simcard.phoneNumber || simcard.iccid,
              "Sem identificador"
            )}
          </p>

          {simcard.phoneNumber &&
            simcard.iccid &&
            simcard.phoneNumber !== simcard.iccid && (
              <p className="text-[10px] text-[var(--text-secondary)] mt-1 mb-0 truncate">
                ICCID {simcard.iccid}
              </p>
            )}
        </div>

        <div className="h-[1px] w-full bg-[var(--border-color)] opacity-50" />

        {/* Informações da atribuição */}
        <div className="grid grid-cols-2 gap-4">
          <div className="min-w-0">
            <span className="text-[9px] uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-1">
              <Box size={10} /> Projeto
            </span>

            <span className="text-xs text-[var(--text-primary)] truncate block">
              {project}
            </span>
          </div>

          <div className="min-w-0">
            <span className="text-[9px] uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-1">
              <Users size={10} /> Cliente
            </span>

            <span className="text-xs text-[var(--text-primary)] truncate block">
              {client}
            </span>
          </div>

          <div className="min-w-0">
            <span className="text-[9px] uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-1">
              <UserCog size={10} /> Responsável
            </span>

            <span className="text-xs text-[var(--text-primary)] truncate block">
              {responsible}
            </span>
          </div>

          <div className="min-w-0">
            <span className="text-[9px] uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-1">
              <Wrench size={10} /> Equipamento
            </span>

            <span className="text-xs text-[var(--text-primary)] truncate block">
              {equipment}
            </span>
          </div>
        </div>

        {/* Data da atribuição */}
        {isAssigned && assignment?.assignedAt && (
          <p className="text-[10px] text-[var(--text-secondary)] opacity-70 mb-0 flex items-center gap-1.5">
            <Hash size={10} />
            Atribuído em {formatDateTime(assignment.assignedAt)}
          </p>
        )}

        {/* Ações */}
        <div className="flex items-end gap-2 mt-auto pt-1">
          <Button
            variant="secondary"
            onClick={onDetails}
          >
            Detalhes
          </Button>

          {isAssigned ? (
            <AlertDialog
              open={releaseDialogOpen}
              onOpenChange={setReleaseDialogOpen}
            >
              <AlertDialogTrigger
                render={
                  <Button
                    variant="destructive"
                    disabled={busy}
                  />
                }
              >
                <Unlink size={14} />
                Liberar
              </AlertDialogTrigger>

              <AlertDialogContent className="p-5">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Confirmar liberação do chip?
                  </AlertDialogTitle>

                  <AlertDialogDescription className="text-xs">
                    Essa ação irá desvincular o chip da associação
                    atual, disponibilizando-o novamente para
                    utilização. Deseja realmente continuar?
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="bg-transparent mt-3">
                  <AlertDialogCancel variant="secondary" disabled={busy}>
                    Cancelar
                  </AlertDialogCancel>

                  <AlertDialogAction
                    variant="destructive"
                    onClick={handleConfirmRelease}
                    disabled={busy}
                  >
                    <Unlink size={14} />
                    Confirmar liberação
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button
              variant="greenlight"
              onClick={onAssign}
              disabled={busy || classification === "inactive"}
              title={
                classification === "inactive"
                  ? "Chips inativos não podem ser atribuídos"
                  : undefined
              }
            >
              Atribuir <ArrowRight size={14} />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
