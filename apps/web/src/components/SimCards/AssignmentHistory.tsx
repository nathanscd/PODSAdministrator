
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowRightLeft,
  Clock3,
  Cpu,
  Hash,
  Pencil,
  Plus,
  Trash2,
  Unlink,
  UserRound,
  SlidersHorizontal,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";
import type { AssignmentHistoryEvent } from "../../types/simcard";

import {
  displayValue,
  formatDateTime,
  sourceLabel,
} from "../../utils/simcard";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

interface AssignmentHistoryProps {
  history: AssignmentHistoryEvent[];
  error: string | null;
}

type EventConfig = {
  label: string;
  icon: LucideIcon;
  color: string;
  background: string;
  border: string;
};

const EVENT_CONFIG: Record<
  AssignmentHistoryEvent["type"],
  EventConfig
> = {
  created: {
    label: "SIM manual criado",
    icon: Plus,
    color: "text-emerald-600 dark:text-emerald-400",
    background: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },

  assigned: {
    label: "Atribuição",
    icon: Activity,
    color: "text-[var(--accent-color)]",
    background: "bg-[var(--accent-color)]/10",
    border: "border-[var(--accent-color)]/20",
  },

  transfer: {
    label: "Transferência",
    icon: ArrowRightLeft,
    color: "text-blue-600 dark:text-blue-400",
    background: "bg-blue-500/10",
    border: "border-blue-500/20",
  },

  released: {
    label: "Liberação",
    icon: Unlink,
    color: "text-amber-600 dark:text-amber-400",
    background: "bg-amber-500/10",
    border: "border-amber-500/20",
  },

  metadata_updated: {
    label: "Atualização de metadados",
    icon: SlidersHorizontal,
    color: "text-violet-600 dark:text-violet-400",
    background: "bg-violet-500/10",
    border: "border-violet-500/20",
  },

  manual_updated: {
    label: "SIM manual atualizado",
    icon: Pencil,
    color: "text-cyan-600 dark:text-cyan-400",
    background: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },

  deleted: {
    label: "SIM manual excluído",
    icon: Trash2,
    color: "text-rose-600 dark:text-rose-400",
    background: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
};

function SourceBadge({
  source,
}: {
  source: AssignmentHistoryEvent["source"];
}) {
  const isManual = source === "manual";

  return (
    <Badge
      variant="outline"
      className={`
        rounded-lg border px-2 py-0.5
        text-[9px] font-semibold tracking-wide
        ${
          isManual
            ? "border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400"
            : "border-cyan-500/20 bg-cyan-500/5 text-cyan-600 dark:text-cyan-400"
        }
      `}
    >
      {sourceLabel(source)}
    </Badge>
  );
}

function EventDestination({
  event,
}: {
  event: AssignmentHistoryEvent;
}) {
  const fromDestination =
    event.destinationFrom?.projectName ||
    event.destinationFrom?.opportunityName;

  const toDestination =
    event.destinationTo?.projectName ||
    event.destinationTo?.opportunityName;

  const isTransfer = Boolean(
    event.type === "transfer" &&
    fromDestination &&
    toDestination
  );

  if (isTransfer) {
    return (
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <div className="
          max-w-full truncate rounded-lg
          border border-[var(--border-color)]
          bg-[var(--bg-app)] px-2.5 py-1.5
          text-[10px] font-medium
          text-[var(--text-secondary)]
        ">
          {fromDestination}
        </div>

        <ArrowRight
          size={13}
          className="shrink-0 text-[var(--text-secondary)]"
        />

        <div className="
          max-w-full truncate rounded-lg
          border border-[var(--accent-color)]/20
          bg-[var(--accent-color)]/5 px-2.5 py-1.5
          text-[10px] font-semibold
          text-[var(--accent-color)]
        ">
          {toDestination}
        </div>
      </div>
    );
  }

  const destination = toDestination || fromDestination;

  return (
    <p className="
      mt-2 mb-0 truncate text-sm font-semibold
      text-[var(--text-primary)]
    ">
      {displayValue(destination, "Sem destino informado")}
    </p>
  );
}

export function AssignmentHistory({
  history,
  error,
}: AssignmentHistoryProps) {
  return (
    <Card className="
      overflow-hidden
      rounded-[1.75rem]
      border border-[var(--border-color)]
      bg-[var(--card-bg)]
      shadow-sm
      backdrop-blur-xl
      gap-0
    ">

      {/* Cabeçalho */}
      <CardHeader className="
        flex flex-row items-center justify-between
        gap-4 border-b border-[var(--border-color)]
        px-6 py-5 md:px-8
      ">
        <div className="flex min-w-0 items-center gap-3">

          <div className="
            flex size-10 shrink-0 items-center justify-center
            rounded-xl border border-[var(--accent-color)]/20
            bg-[var(--accent-color)]/10
            text-[var(--accent-color)]
          ">
            <Clock3 size={19} strokeWidth={1.8} />
          </div>

          <div className="min-w-0">
            <CardTitle className="
              text-sm font-bold tracking-tight
              text-[var(--text-primary)]
            ">
              Histórico de movimentações
            </CardTitle>

            <p className="
              mt-1 mb-0 text-[11px]
              text-[var(--text-secondary)]
            ">
              Registro de atividades e alterações dos chips.
            </p>
          </div>
        </div>

        <Badge
          variant="outline"
          className="
            shrink-0 rounded-lg border-[var(--border-color)]
            bg-[var(--bg-app)]
            px-2.5 py-1
            text-[10px] font-semibold
            tabular-nums text-[var(--text-secondary)]
          "
        >
          {history.length} {history.length === 1 ? "evento" : "eventos"}
        </Badge>
      </CardHeader>

      <CardContent className="p-6 md:p-8">

        {/* Erro */}
        {error ? (
          <Alert className="
            rounded-xl border-amber-500/20
            bg-amber-500/5 text-amber-600
            dark:text-amber-400
          ">
            <AlertCircle size={16} />
            <AlertDescription className="text-xs leading-relaxed">
              {error}
            </AlertDescription>
          </Alert>
        ) : history.length === 0 ? (

          /* Estado vazio */
          <div className="
            flex flex-col items-center justify-center
            rounded-2xl border border-dashed
            border-[var(--border-color)]
            bg-[var(--bg-app)]/40
            px-6 py-14 text-center
          ">
            <div className="
              flex size-12 items-center justify-center
              rounded-2xl border border-[var(--border-color)]
              bg-[var(--card-bg)]
              text-[var(--text-secondary)]
            ">
              <Clock3 size={21} strokeWidth={1.7} />
            </div>

            <h3 className="
              mt-4 mb-0 text-sm font-semibold
              text-[var(--text-primary)]
            ">
              Nenhuma movimentação registrada
            </h3>

            <p className="
              mt-1.5 mb-0 max-w-xs
              text-xs leading-relaxed
              text-[var(--text-secondary)]
            ">
              As atribuições, transferências e alterações
              realizadas nos chips aparecerão aqui.
            </p>
          </div>

        ) : (

          /* Timeline */
          <div className="space-y-0">
            {history.map((event, index) => {
              const config = EVENT_CONFIG[event.type];
              const EventIcon = config.icon;

              const identifier =
                event.phoneNumber ||
                event.iccid ||
                event.datatemSimcardId;

              const performedBy = event.performedBy?.name;

              const isLast = index === history.length - 1;

              return (
                <div
                  key={event.id}
                  className="relative flex gap-4 md:gap-5"
                >
                  {/* Linha e ícone da timeline */}
                  <div className="
                    relative flex shrink-0 flex-col items-center
                    w-9
                  ">
                    <div className={`
                      relative z-10 flex size-9 items-center
                      justify-center rounded-full border
                      ${config.background}
                      ${config.border}
                      ${config.color}
                    `}>
                      <EventIcon size={16} strokeWidth={1.8} />
                    </div>

                    {!isLast && (
                      <div className="
                        absolute top-9 bottom-0
                        w-px translate-y-1
                        bg-[var(--border-color)]
                      " />
                    )}
                  </div>

                  {/* Conteúdo do evento */}
                  <div className={`
                    min-w-0 flex-1
                    ${isLast ? "pb-0" : "pb-6"}
                  `}>
                    <Card className="
                      overflow-hidden rounded-2xl
                      border border-[var(--border-color)]
                      bg-[var(--bg-app)]/45
                      shadow-none gap-0
                      transition-colors duration-200
                      hover:border-[var(--accent-color)]/30
                      hover:bg-[var(--bg-app)]/75
                    ">
                      <CardContent className="p-4 md:p-5">

                        {/* Título e data */}
                        <div className="
                          flex flex-col gap-3
                          sm:flex-row sm:items-start
                          sm:justify-between
                        ">
                          <div className="flex flex-wrap items-center gap-2">

                            <span className={`
                              text-[10px] font-bold
                              uppercase tracking-[0.12em]
                              ${config.color}
                            `}>
                              {config.label}
                            </span>

                            <SourceBadge source={event.source} />
                          </div>

                          <div className="
                            flex shrink-0 items-center gap-1.5
                            text-[10px] font-medium
                            text-[var(--text-secondary)]
                          ">
                            <Clock3 size={12} />
                            {formatDateTime(event.performedAt)}
                          </div>
                        </div>

                        {/* Destino */}
                        <EventDestination event={event} />

                        {/* Metadados */}
                        {(identifier || performedBy) && (
                          <>
                            <div className="
                              my-3 h-px w-full
                              bg-[var(--border-color)] opacity-60
                            " />

                            <div className="
                              flex flex-wrap items-center gap-x-4 gap-y-2
                            ">
                              {identifier && (
                                <div className="
                                  flex min-w-0 items-center gap-1.5
                                  text-[10px]
                                  text-[var(--text-secondary)]
                                ">
                                  <Hash
                                    size={11}
                                    className="shrink-0 opacity-70"
                                  />

                                  <span className="truncate font-mono">
                                    {displayValue(identifier)}
                                  </span>
                                </div>
                              )}

                              {performedBy && (
                                <div className="
                                  flex min-w-0 items-center gap-1.5
                                  text-[10px]
                                  text-[var(--text-secondary)]
                                ">
                                  <UserRound
                                    size={12}
                                    className="shrink-0 opacity-70"
                                  />

                                  <span className="truncate">
                                    {performedBy}
                                  </span>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
