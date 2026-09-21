import React from 'react';
import { Filter, Search } from 'lucide-react';
import { FilterOptions, UtilityType, CommunicationType } from '../../types';

interface AssetFiltersProps {
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  uniqueProjects: string[];
  uniqueResponsaveis: string[];
}

export const AssetFilters: React.FC<AssetFiltersProps> = ({
  filters,
  setFilters,
  uniqueProjects,
  uniqueResponsaveis,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-6">
      <div className="flex items-center gap-2 mb-6">
        <Filter size={20} className="text-slate-700" />
        <h2 className="text-lg font-bold text-slate-900">Filtros</h2>
      </div>

      <div className="space-y-5">
        {/* Search */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
            Buscar
          </label>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Série, modelo..."
              value={filters.searchTerm || ''}
              onChange={(e) =>
                setFilters({ ...filters, searchTerm: e.target.value })
              }
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Utility Filter */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
            Utility
          </label>
          <select
            value={filters.utility || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                utility: (e.target.value as UtilityType) || undefined,
              })
            }
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Todos</option>
            <option value="Água">Água</option>
            <option value="Energia">Energia</option>
            <option value="Gás">Gás</option>
            <option value="Saneamento">Saneamento</option>
            <option value="Telecomunicações">Telecomunicações</option>
          </select>
        </div>

        {/* Communication Type Filter */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
            Comunicação
          </label>
          <select
            value={filters.tipoComunicacao || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                tipoComunicacao: (e.target.value as CommunicationType) || undefined,
              })
            }
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Todos</option>
            <option value="NB">NB-IoT</option>
            <option value="3G">3G</option>
            <option value="4G">4G</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        {/* Project Filter */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
            Projeto
          </label>
          <select
            value={filters.projeto || ''}
            onChange={(e) =>
              setFilters({ ...filters, projeto: e.target.value || undefined })
            }
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Todos</option>
            {uniqueProjects.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Responsible Filter */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
            Responsável
          </label>
          <select
            value={filters.responsavel || ''}
            onChange={(e) =>
              setFilters({ ...filters, responsavel: e.target.value || undefined })
            }
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Todos</option>
            {uniqueResponsaveis.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        {Object.keys(filters).length > 0 && (
          <button
            onClick={() => setFilters({})}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors text-sm"
          >
            Limpar Filtros
          </button>
        )}
      </div>
    </div>
  );
};
