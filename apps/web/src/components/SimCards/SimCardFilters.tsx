import { Filter, RefreshCw, Search, X } from "lucide-react";
import type { SimcardClassification, SimcardSource, TechnologyGroup } from "../../types/simcard";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";


import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


interface SimCardFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: SimcardClassification | "all";
  onStatusChange: (value: SimcardClassification | "all") => void;
  operator: string;
  onOperatorChange: (value: string) => void;
  source: SimcardSource | "all";
  onSourceChange: (value: SimcardSource | "all") => void;
  technologyGroup: TechnologyGroup | "all";
  onTechnologyGroupChange: (value: TechnologyGroup | "all") => void;
  operators: string[];
  onRefresh: () => void;
  refreshing: boolean;
  resultCount: number;
}

const STATUS_OPTIONS: Array<{ value: SimcardClassification | "all"; label: string }> = [
  { value: "all", label: "Todos os status" },
  { value: "available", label: "Disponíveis" },
  { value: "assigned", label: "Atribuídos" },
  { value: "inactive", label: "Inativos" },
  { value: "unknown", label: "Sem status" },
];

const SOURCE_OPTIONS: Array<{ value: SimcardSource | "all"; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "datatem", label: "DATATEM" },
  { value: "manual", label: "Manual" },
];

const GROUP_OPTIONS: Array<{ value: TechnologyGroup | "all"; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "4G", label: "4G" },
  { value: "NB-IoT", label: "NB-IoT" },
  { value: "Outros", label: "Outros" },
];

const selectClass =
  "w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl px-3 py-2.5 text-xs font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] transition-all cursor-pointer appearance-none";

function Segment<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <ButtonGroup
      aria-label="Selecionar opção"
      className="w-fit rounded-xl border border-[var(--border-color)] bg-[var(--bg-app)] p-1 shadow-sm"
    >
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <Button
            key={option.value}
            type="button"
            variant="secondary"
            size="sm"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={`text-xs py-1
             
              ${
                isActive
                  ? "bg-[var(--border-color)]/10"
                  : "bg-[var(--border-color)]/50"
              }
            `}
          >
            {option.label}
          </Button>
        );
      })}
    </ButtonGroup>
  );
}

export { Segment };

export function SimCardFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  operator,
  onOperatorChange,
  source,
  onSourceChange,
  technologyGroup,
  onTechnologyGroupChange,
  operators,
  onRefresh,
  refreshing,
  resultCount,
}: SimCardFiltersProps) {
  const hasFilters = Boolean(
    search || status !== "all" || operator !== "all" || source !== "all" || technologyGroup !== "all",
  );
  const clear = () => {
    onSearchChange("");
    onStatusChange("all");
    onOperatorChange("all");
    onSourceChange("all");
    onTechnologyGroupChange("all");
  };

  const selectedStatus =
  STATUS_OPTIONS.find((option) => option.value === status) ?? null;
  
  const operatorOptions = [
    { value: "all", label: "Todas operadoras" },
    ...operators.map((name) => ({
      value: name,
      label: name,
    })),
  ];


  return (
    <div className="rounded-[1.75rem] border border-[var(--border-color)] bg-[var(--glass-bg)] backdrop-blur-2xl p-4 shadow-[var(--shadow-card)] flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1 min-w-0">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por linha, ICCID, projeto ou cliente..."
            className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] transition-all"
          />
        </div>

        <div className="grid grid-cols-2 lg:flex gap-3 lg:w-auto">
          <div className="min-w-[150px]">
            <Select
              items={STATUS_OPTIONS}
              value={status}
              onValueChange={(value) => {
                if (value !== null) {
                  onStatusChange(
                    value as SimcardClassification | "all"
                  );
                }
              }}
            >
              <SelectTrigger className="">
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[130px]">
           <Select
              items={operatorOptions}
              value={operator}
              onValueChange={(value) => {
                if (value !== null) {
                  onOperatorChange(value);
                }
              }}
            >
              <SelectTrigger className="">
                <SelectValue placeholder="Selecione uma operadora" />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  {operatorOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasFilters && (
            <Button
              variant="destructive"
              onClick={clear}
              className=""
              title="Limpar filtros"
            >
              <X size={14} /> Limpar
            </Button>
          )}
          <Button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className=""
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Sincronizar
          </Button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-t border-[var(--border-color)] pt-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-[0.16em] text-[var(--text-secondary)]">Origem</span>
            <Segment options={SOURCE_OPTIONS} value={source} onChange={onSourceChange} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.16em] text-[var(--text-secondary)]">Tecnologia</span>
            <Segment options={GROUP_OPTIONS} value={technologyGroup} onChange={onTechnologyGroupChange} />
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] shrink-0">
          <Filter size={12} /> {resultCount} {resultCount === 1 ? "chip" : "chips"}
        </div>
      </div>
    </div>
  );
}
