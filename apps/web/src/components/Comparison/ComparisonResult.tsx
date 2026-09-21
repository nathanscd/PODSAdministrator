import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Download } from 'lucide-react';

interface ComparisonResultProps {
  mode: 'excel' | 'pdf';
  downloadExcel: () => void;
  downloadPdf: () => void;
  reset: () => void;
}

export const ComparisonResult: React.FC<ComparisonResultProps> = ({
  mode,
  downloadExcel,
  downloadPdf,
  reset,
}) => {
  return (
    <motion.div
      key="step3_result"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-10"
    >
      <div className="w-full max-w-md text-center space-y-8">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/20">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
        <div>
          <h3 className="text-3xl font-black text-[var(--text-primary)] mb-2 tracking-tight">
            Análise Concluída!
          </h3>
          <p className="text-[var(--text-secondary)]">
            As diferenças foram rastreadas com sucesso.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={mode === 'excel' ? downloadExcel : downloadPdf}
            className="w-full bg-[var(--accent-color)] text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(255,106,0,0.3)] hover:shadow-[0_15px_40px_rgba(255,106,0,0.4)] hover:-translate-y-1 transition-all"
          >
            <Download size={20} /> Baixar Relatório
          </button>
          <button
            onClick={reset}
            className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-secondary)] px-8 py-3.5 rounded-xl font-bold text-sm hover:border-[var(--accent-color)] hover:text-[var(--text-primary)] transition-all"
          >
            Fazer nova comparação
          </button>
        </div>
      </div>
    </motion.div>
  );
};
