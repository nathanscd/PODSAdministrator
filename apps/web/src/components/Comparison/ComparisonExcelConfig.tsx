import React from 'react';
import { motion } from 'framer-motion';
import { Settings2, ArrowRight } from 'lucide-react';

interface ComparisonExcelConfigProps {
  globalConfig: any;
  setGlobalConfig: (c: any) => void;
  handleConfigSubmit: () => void;
}

export const ComparisonExcelConfig: React.FC<ComparisonExcelConfigProps> = ({
  globalConfig,
  setGlobalConfig,
  handleConfigSubmit,
}) => {
  return (
    <motion.div
      key="step1_excel"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-6">
        <Settings2 size={24} className="text-[var(--accent-color)]" />
        <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
          Regras de Comparação
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">
            Quantas planilhas?
          </label>
          <input
            type="number"
            min={1}
            max={5}
            value={globalConfig.nSheets}
            onChange={(e) =>
              setGlobalConfig({
                ...globalConfig,
                nSheets: parseInt(e.target.value) || 1,
              })
            }
            className="w-full bg-[var(--bg-app)] border-2 border-[var(--border-color)] rounded-xl px-4 py-3 text-[var(--text-primary)] font-bold outline-none focus:border-[var(--accent-color)] transition-colors"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">
            Quantas colunas avaliar?
          </label>
          <input
            type="number"
            min={1}
            max={5}
            value={globalConfig.nCols}
            onChange={(e) =>
              setGlobalConfig({
                ...globalConfig,
                nCols: parseInt(e.target.value) || 1,
              })
            }
            className="w-full bg-[var(--bg-app)] border-2 border-[var(--border-color)] rounded-xl px-4 py-3 text-[var(--text-primary)] font-bold outline-none focus:border-[var(--accent-color)] transition-colors"
          />
        </div>
      </div>

      {globalConfig.nSheets > 1 && (
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">
            Modo de Comparação
          </label>
          <select
            value={globalConfig.modo}
            onChange={(e) => setGlobalConfig({ ...globalConfig, modo: e.target.value })}
            className="w-full bg-[var(--bg-app)] border-2 border-[var(--border-color)] rounded-xl px-4 py-3 text-[var(--text-primary)] font-bold outline-none focus:border-[var(--accent-color)] transition-colors appearance-none cursor-pointer"
          >
            <option value="1_vs_outras">Primeira Planilha vs Outras</option>
            <option value="cruzada">Comparação Cruzada (Todas entre si)</option>
          </select>
        </div>
      )}

      <div className="space-y-3 bg-[var(--bg-app)] p-6 rounded-2xl border border-[var(--border-color)]">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">
            Similaridade Mínima (Match)
          </label>
          <span className="bg-[var(--accent-color)]/10 text-[var(--accent-color)] px-3 py-1 rounded-full text-xs font-bold">
            {globalConfig.threshold}%
          </span>
        </div>
        <input
          type="range"
          min={30}
          max={95}
          value={globalConfig.threshold}
          onChange={(e) =>
            setGlobalConfig({ ...globalConfig, threshold: parseInt(e.target.value) })
          }
          className="w-full accent-[var(--accent-color)] cursor-pointer h-2 bg-[var(--border-color)] rounded-lg appearance-none"
        />
        <p className="text-xs text-[var(--text-secondary)] mt-2">
          Valores abaixo deste percentual serão considerados "Sem Similaridade".
        </p>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleConfigSubmit}
          className="bg-[var(--accent-color)] text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg hover:-translate-y-1 transition-all"
        >
          Continuar <ArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  );
};
