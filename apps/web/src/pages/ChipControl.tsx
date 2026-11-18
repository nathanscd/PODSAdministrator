import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Boxes,
  CircleCheck,
  Cpu,
  Plus,
  RadioTower,
  RefreshCw,
  Signal,
  Wrench,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useOpportunities } from "../hooks/useOpportunities";
import { useSimcardInventory } from "../hooks/useSimcardInventory";
import { useSimcardOperations } from "../hooks/useSimcardOperations";
import { AssignmentHistory } from "../components/SimCards/AssignmentHistory";
import { AssignSimcardModal } from "../components/SimCards/AssignSimcardModal";
import { ManualSimcardModal } from "../components/SimCards/ManualSimcardModal";
import { SimCardCard } from "../components/SimCards/SimCardCard";
import { SimCardFilters } from "../components/SimCards/SimCardFilters";
import { SimcardDetailsModal } from "../components/SimCards/SimcardDetailsModal";
import { SimCardLoading } from "../components/SimCards/SimCardLoading";
import { SourceActionModal } from "../components/SimCards/SourceActionModal";
import type {
  AssignPayload,
  AssignmentUpdatePayload,
  InventoryItem,
  ManualSimcardRequest,
  ManualSimcardUpdate,
  SimcardClassification,
  SimcardSource,
  TechnologyGroup,
} from "../types/simcard";
import { classifySimcard, displayValue, sourceOf, technologyGroupOf } from "../utils/simcard";

const GROUP_ORDER: TechnologyGroup[] = ["4G", "NB-IoT", "Outros"];

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--glass-bg)] backdrop-blur-xl p-3 px-4 flex items-center gap-4 min-w-[140px] shadow-[var(--shadow-subtle)]">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>{icon}</div>
      <div>
        <p className="text-2xl text-[var(--text-primary)] m-0 leading-none">{value}</p>
        <p className="text-[9px] uppercase tracking-widest text-[var(--text-secondary)] mt-1 mb-0">{label}</p>
      </div>
    </div>
  );
}

function GroupSection({
  group,
  items,
  children,
}: {
  group: TechnologyGroup;
  items: InventoryItem[];
  children: React.ReactNode;
}) {
  const Icon = group === "4G" ? RadioTower : group === "NB-IoT" ? Cpu : Boxes;
  const available = items.filter((item) => item.classification === "available").length;
  const assigned = items.filter((item) => item.classification === "assigned").length;
  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-[2.25rem] border border-[var(--border-color)] bg-[var(--card-bg)]/50 p-5 md:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[var(--accent-color)]/10 text-[var(--accent-color)] flex items-center justify-center">
            <Icon size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-[var(--text-primary)] m-0">{group}</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mt-1 mb-0">
              {items.length} {items.length === 1 ? "chip" : "chips"} · {available} disponíveis · {assigned} atribuídos
            </p>
          </div>
        </div>
        <span className="rounded-full border border-[var(--border-color)] bg-[var(--bg-app)] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
          {group === "NB-IoT" ? "Baixa potência" : group === "4G" ? "Banda larga móvel" : "Sem classificação"}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{children}</div>
    </motion.section>
  );
}

export default function SimCardControl() {
  const { user, loading: authLoading } = useAuth();
  const { opportunities } = useOpportunities();
  const enabled = !authLoading && Boolean(user);

  const inventory = useSimcardInventory(enabled);
  const operations = useSimcardOperations(enabled);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SimcardClassification | "all">("all");
  const [operator, setOperator] = useState("all");
  const [source, setSource] = useState<SimcardSource | "all">("all");
  const [technologyGroup, setTechnologyGroup] = useState<TechnologyGroup | "all">("all");
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [assignId, setAssignId] = useState<string | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);

  const items = useMemo<InventoryItem[]>(() => {
    const bootstrapAssignments = inventory.data?.assignments || {};
    const mergedAssignments = { ...bootstrapAssignments, ...operations.assignments };
    const simcards = [...(inventory.data?.simcards || []), ...(inventory.data?.manualSimcards || [])];
    return simcards.map((simcard) => {
      const assignment = mergedAssignments[simcard.id] || null;
      const connection =
        sourceOf(simcard) === "datatem"
          ? inventory.data?.connections.find(
              (candidate) =>
                (candidate.simcardId && candidate.simcardId === simcard.id) ||
                (candidate.iccid && candidate.iccid === simcard.iccid) ||
                (candidate.phoneNumber && candidate.phoneNumber === simcard.phoneNumber),
            ) || null
          : null;
      return {
        simcard,
        assignment,
        connection,
        classification: classifySimcard(simcard, assignment),
        legacyMetadata: null,
      };
    });
  }, [inventory.data, operations.assignments]);

  const operators = useMemo(
    () => Array.from(new Set(items.map((item) => displayValue(item.simcard.operatorName, "")))).filter(Boolean).sort(),
    [items],
  );

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((item) => {
      const project = item.assignment?.opportunityName || item.assignment?.projectName || "";
      const matchesSearch =
        !term ||
        [
          item.simcard.id,
          item.simcard.iccid,
          item.simcard.phoneNumber,
          item.simcard.operatorName,
          project,
          item.assignment?.clientName,
        ]
          .map((value) => displayValue(value, "").toLowerCase())
          .some((value) => value.includes(term));
      const matchesStatus = status === "all" || item.classification === status;
      const matchesOperator = operator === "all" || displayValue(item.simcard.operatorName) === operator;
      const matchesSource = source === "all" || sourceOf(item.simcard) === source;
      const matchesGroup = technologyGroup === "all" || technologyGroupOf(item.simcard) === technologyGroup;
      return matchesSearch && matchesStatus && matchesOperator && matchesSource && matchesGroup;
    });
  }, [items, search, status, operator, source, technologyGroup]);

  const groupedItems = useMemo(() => {
    const groups: Record<TechnologyGroup, InventoryItem[]> = { "4G": [], "NB-IoT": [], Outros: [] };
    filteredItems.forEach((item) => groups[technologyGroupOf(item.simcard)].push(item));
    return groups;
  }, [filteredItems]);

  const totals = useMemo(
    () => ({
      total: items.length,
      available: items.filter((item) => item.classification === "available").length,
      assigned: items.filter((item) => item.classification === "assigned").length,
      inactive: items.filter((item) => item.classification === "inactive").length,
      manual: items.filter((item) => sourceOf(item.simcard) === "manual").length,
    }),
    [items],
  );

  const assignItem = assignId ? items.find((item) => item.simcard.id === assignId) || null : null;
  const detailsItem = detailsId ? items.find((item) => item.simcard.id === detailsId) || null : null;
  const warnings = inventory.data?.warnings || [];

  const handleAssign = async (payload: AssignPayload) => {
    if (!assignItem) return false;
    return operations.assign(assignItem.simcard.id, payload);
  };

  const handleUpdate = async (payload: AssignmentUpdatePayload) => {
    if (!detailsItem) return false;
    return operations.updateMetadata(detailsItem.simcard.id, payload);
  };

  const handleUpdateManual = async (payload: ManualSimcardUpdate) => {
    if (!detailsItem) return false;
    const success = await operations.updateManual(detailsItem.simcard.id, payload);
    if (success) inventory.reload();
    return success;
  };

  const handleDeleteManual = async () => {
    if (!detailsItem) return;
    const success = await operations.deleteManual(detailsItem.simcard.id);
    if (success) {
      inventory.reload();
      setDetailsId(null);
    }
  };

  const handleRelease = async (simcardId: string) => {
    const success = await operations.release(simcardId);
    if (success && detailsId === simcardId) setDetailsId(null);
  };

  const handleCreateManual = async (payload: ManualSimcardRequest) => {
    const success = await operations.createManual(payload);
    if (success) inventory.reload();
    return success;
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 md:p-10 flex flex-col gap-8 min-h-screen">
      <motion.header initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
        <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border-color)] bg-[var(--glass-bg)] p-6 backdrop-blur-2xl shadow-[var(--shadow-card)] md:p-8">
          <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-[var(--accent-color)]/10 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="relative">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mt-6">
              <div>
                <h1 className="text-4xl md:text-5xl text-[var(--text-primary)] tracking-tight mb-3">
                  Gestão de Chips M2M
                </h1>
                <p className="text-base md:text-md text-[var(--text-secondary)] opacity-80 max-w-2xl leading-relaxed m-0">
                  Inventário DATATEM e SIMs manuais em um só lugar, agrupados por tecnologia e com atribuição auditável.
                </p>
                {inventory.lastUpdated && (
                  <p className="text-[10px] text-[var(--text-secondary)] mt-3 mb-0 flex items-center gap-1.5">
                    <RefreshCw size={10} /> Última consulta:{" "}
                    {new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(inventory.lastUpdated)}
                    {inventory.data?.stale ? " · exibindo última sincronização válida" : ""}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 md:gap-3">
                <Button
                  type="button"
                  onClick={() => setSourceModalOpen(true)}
                  className=""
                >
                  <Plus size={15} /> Nova atribuição
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-7">
              <StatCard label="Total" value={totals.total} icon={<Boxes size={18} />} accent="bg-[var(--accent-color)]/10 text-[var(--accent-color)]" />
              <StatCard label="Disponíveis" value={totals.available} icon={<CircleCheck size={18} />} accent="bg-emerald-500/10 text-emerald-500" />
              <StatCard label="Atribuídos" value={totals.assigned} icon={<Signal size={18} />} accent="bg-cyan-500/10 text-cyan-500" />
              <StatCard label="Manuais" value={totals.manual} icon={<Wrench size={18} />} accent="bg-amber-500/10 text-amber-500" />
              <StatCard label="Inativos" value={totals.inactive} icon={<AlertTriangle size={18} />} accent="bg-rose-500/10 text-rose-500" />
            </div>
          </div>
        </div>
      </motion.header>

      {warnings.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-xs text-amber-600 dark:text-amber-400 flex flex-col gap-1.5">
          {warnings.slice(0, 3).map((warning, index) => (
            <p key={`${warning}-${index}`} className="m-0 flex items-center gap-2"><AlertTriangle size={13} /> {warning}</p>
          ))}
        </div>
      )}

      {!enabled ? (
        <div className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--card-bg)] p-10 text-center">
          <p className="text-sm font-bold text-[var(--text-primary)] m-0">
            {authLoading ? "Carregando sessão..." : "Entre na conta para consultar o inventário de chips."}
          </p>
        </div>
      ) : inventory.loading && !inventory.data ? (
        <SimCardLoading />
      ) : inventory.error && !inventory.data ? (
        <div className="rounded-[2rem] border border-rose-500/30 bg-rose-500/5 p-10 text-center flex flex-col items-center gap-4">
          <AlertTriangle size={28} className="text-rose-500" />
          <p className="text-sm font-bold text-[var(--text-primary)] m-0">{inventory.error}</p>
          <Button
            type="button"
            onClick={inventory.retry}
            className=""
          >
            <RefreshCw size={14} /> Tentar novamente
          </Button>
        </div>
      ) : (
        <>
          <SimCardFilters
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
            operator={operator}
            onOperatorChange={setOperator}
            source={source}
            onSourceChange={setSource}
            technologyGroup={technologyGroup}
            onTechnologyGroupChange={setTechnologyGroup}
            operators={operators}
            onRefresh={inventory.refresh}
            refreshing={inventory.loading}
            resultCount={filteredItems.length}
          />

          {filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-[2rem] border-2 border-dashed border-[var(--border-color)] bg-[var(--card-bg)] py-20 text-center"
            >
              <Boxes size={48} strokeWidth={1} className="text-[var(--text-secondary)] opacity-25 mx-auto mb-4" />
              <p className="text-lg font-black text-[var(--text-primary)] m-0">Nenhum chip encontrado</p>
              <p className="text-xs text-[var(--text-secondary)] mt-2 mb-0">
                Ajuste os filtros, sincronize o inventário ou cadastre um SIM manual.
              </p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-6">
              {GROUP_ORDER.map((group) =>
                groupedItems[group].length > 0 ? (
                  <GroupSection key={group} group={group} items={groupedItems[group]}>
                    <AnimatePresence mode="popLayout">
                      {groupedItems[group].map((item) => (
                        <SimCardCard
                          key={item.simcard.id}
                          item={item}
                          busy={operations.busyIds.includes(item.simcard.id)}
                          onAssign={() => setAssignId(item.simcard.id)}
                          onRelease={() => void handleRelease(item.simcard.id)}
                          onDetails={() => setDetailsId(item.simcard.id)}
                        />
                      ))}
                    </AnimatePresence>
                  </GroupSection>
                ) : null,
              )}
            </div>
          )}

          <AssignmentHistory history={operations.history} error={operations.historyError} />
        </>
      )}

      <AnimatePresence>
        {sourceModalOpen && (
          <SourceActionModal
            items={items}
            onClose={() => setSourceModalOpen(false)}
            onDatatem={(item) => {
              setSourceModalOpen(false);
              setAssignId(item.simcard.id);
            }}
            onManual={() => {
              setSourceModalOpen(false);
              setManualModalOpen(true);
            }}
          />
        )}
        {assignItem && (
          <AssignSimcardModal
            key={assignItem.simcard.id}
            item={assignItem}
            opportunities={opportunities}
            busy={operations.busyIds.includes(assignItem.simcard.id)}
            onClose={() => setAssignId(null)}
            onAssign={handleAssign}
          />
        )}
        {manualModalOpen && (
          <ManualSimcardModal
            opportunities={opportunities}
            operators={operators}
            busy={operations.busyIds.includes("manual-new")}
            onClose={() => setManualModalOpen(false)}
            onCreate={handleCreateManual}
          />
        )}
        {detailsItem && (
          <SimcardDetailsModal
            key={detailsItem.simcard.id}
            item={detailsItem}
            history={operations.history}
            connectionsAvailable={inventory.data?.connectionsAvailable ?? false}
            busy={operations.busyIds.includes(detailsItem.simcard.id)}
            onClose={() => setDetailsId(null)}
            onUpdate={handleUpdate}
            onUpdateManual={handleUpdateManual}
            onRelease={() => handleRelease(detailsItem.simcard.id)}
            onDelete={() => handleDeleteManual()}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
