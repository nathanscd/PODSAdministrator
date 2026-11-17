import { Search, Plus, Filter, Maximize2, Minimize2 } from 'lucide-react';

interface OpportunityHeaderProps {
  search: string;
  setSearch: (s: string) => void;
  filterUtility: string;
  setFilterUtility: (s: string) => void;
  filterGroup: string;
  setFilterGroup: (s: string) => void;
  uniqueUtilities: string[];
  uniqueGroups: string[]; // <-- Adicionado para remover os grupos fixos
  createOpportunity: () => void;
  t: any;
  isFullScreen: boolean;
  setIsFullScreen: (b: boolean) => void;
}

export const OpportunityHeader: React.FC<OpportunityHeaderProps> = ({
  search,
  setSearch,
  filterUtility,
  setFilterUtility,
  filterGroup,
  setFilterGroup,
  uniqueUtilities,
  uniqueGroups, 
  createOpportunity,
  t,
  isFullScreen,
  setIsFullScreen,
}) => {
  return (
    <header className="relative z-40 pt-5 pb-10 px-6 sm:px-10 lg:px-16 shrink-0 bg-[var(--bg-app)] border-b border-[var(--border-color)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        
        {/* Título e Subtítulo */}
        <div className="flex flex-col gap-1">
          <h1 className="text-5xl  uppercase tracking-tighter text-[var(--text-primary)]">
            {t.opp.title}
          </h1>
          <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--accent-color)] mt-2">
            {t.opp.subtitle}
          </span>
        </div>

        {/* Ações e Busca */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          
          <div className="relative group w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
            <input
              placeholder={t.opp.searchPlaceholder || "Search..."}
              className="w-full h-9 pl-9 pr-4 rounded-md border border-[var(--border-color)] bg-[var(--card-bg)] outline-none focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)] transition-all text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="h-9 w-9 flex items-center justify-center rounded-md border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-all cursor-pointer"
              title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
            >
              {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            <button
              onClick={createOpportunity}
              className="h-9 px-4 flex items-center justify-center gap-2 rounded-md bg-[var(--accent-color)] text-white text-sm font-medium hover:brightness-110 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus size={16} />
              <span>{t.opp.new || "New"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mt-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--accent-color)]/50 transition-colors">
          <Filter size={14} className="text-[var(--text-secondary)]" />
          <select
            className="bg-transparent border-none text-sm font-medium outline-none cursor-pointer text-[var(--text-primary)] appearance-none pr-2"
            value={filterUtility}
            onChange={(e) => setFilterUtility(e.target.value)}
          >
            <option value="all" className="bg-[var(--card-bg)] text-[var(--text-primary)]">
              {t.opp.filters.allCustomers || "All Utilities"}
            </option>
            {uniqueUtilities?.map((u) => (
              <option key={u} value={u} className="bg-[var(--card-bg)] text-[var(--text-primary)]">
                {u}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--accent-color)]/50 transition-colors">
          <Filter size={14} className="text-[var(--text-secondary)]" />
          <select
            className="bg-transparent border-none text-sm font-medium outline-none cursor-pointer text-[var(--text-primary)] appearance-none pr-2"
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
          >
            <option value="all" className="bg-[var(--card-bg)] text-[var(--text-primary)]">
              {t.opp.filters.allGroups || "All Groups"}
            </option>
            {uniqueGroups?.map((g) => (
              <option key={g} value={g} className="bg-[var(--card-bg)] text-[var(--text-primary)]">
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};