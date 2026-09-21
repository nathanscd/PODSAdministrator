import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, CheckCircle2, ChevronRight } from 'lucide-react';
import { SheetConfig } from '../../hooks/useComparison';

interface ComparisonExcelMappingProps {
  configs: SheetConfig[];
  globalConfig: any;
  setStep: (s: number) => void;
  handleFileUpload: (index: number, file: File) => void;
  handleSheetChange: (index: number, sheetName: string) => void;
  handleColChange: (configIndex: number, colIndex: number, colName: string) => void;
  runExcelComparison: () => void;
  isExcelReady: boolean;
}

export const ComparisonExcelMapping: React.FC<ComparisonExcelMappingProps> = ({
  configs,
  globalConfig,
  setStep,
  handleFileUpload,
  handleSheetChange,
  handleColChange,
  runExcelComparison,
  isExcelReady,
}) => {
  return (
    <motion.div
      key="step2_excel"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-6">
        <div className="flex items-center gap-3">
          <FileText size={24} className="text-[var(--accent-color)]" />
          <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
            Upload e Mapeamento
          </h2>
        </div>
        <button
          onClick={() => setStep(1)}
          className="text-sm text-[var(--text-secondary)] font-bold hover:text-[var(--text-primary)]"
        >
          Voltar
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {configs.map((config, index) => (
          <div
            key={index}
            className="bg-[var(--bg-app)] border border-[var(--border-color)] rounded-2xl p-6 transition-all focus-within:border-[var(--accent-color)]"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[var(--accent-color)]/20 text-[var(--accent-color)] flex items-center justify-center text-xs">
                  {index + 1}
                </span>
                Planilha {index + 1}
              </h3>
              {config.file && (
                <span className="text-xs bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Importada
                </span>
              )}
            </div>

            {!config.file ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--border-color)] rounded-xl cursor-pointer hover:border-[var(--accent-color)] hover:bg-[var(--accent-color)]/5 transition-all group">
                <Upload className="text-[var(--text-secondary)] group-hover:text-[var(--accent-color)] mb-2 transition-colors" />
                <span className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">
                  Procurar Arquivo
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(index, file);
                  }}
                />
              </label>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest">
                    Aba da Planilha
                  </label>
                  <select
                    value={config.selectedSheet}
                    onChange={(e) => handleSheetChange(index, e.target.value)}
                    className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
                  >
                    {config.sheetNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {Array.from({ length: globalConfig.nCols }).map((_, colIndex) => (
                    <div key={colIndex} className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase text-[var(--text-secondary)] tracking-widest">
                        Coluna alvo {colIndex + 1}
                      </label>
                      <select
                        value={config.selectedCols[colIndex]}
                        onChange={(e) => handleColChange(index, colIndex, e.target.value)}
                        className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
                      >
                        <option value="" disabled>
                          Selecione...
                        </option>
                        {config.availableCols.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-[var(--border-color)]">
        <button
          disabled={!isExcelReady}
          onClick={runExcelComparison}
          className="bg-[var(--accent-color)] text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          Iniciar Comparação <ChevronRight size={18} />
        </button>
      </div>
    </motion.div>
  );
};
