import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ComparisonProcessingProps {
  progress: { current: number; total: number; timeMsg: string };
}

export const ComparisonProcessing: React.FC<ComparisonProcessingProps> = ({
  progress,
}) => {
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-10"
    >
      <div className="w-full max-w-md text-center space-y-6">
        <Loader2 size={48} className="animate-spin text-[var(--accent-color)] mx-auto" />
        <h3 className="text-xl font-black text-[var(--text-primary)]">
          Analisando Dados...
        </h3>

        <div className="bg-[var(--bg-app)] p-6 rounded-2xl border border-[var(--border-color)] w-full">
          <div className="flex justify-between text-[10px] font-black uppercase mb-3 text-[var(--text-secondary)]">
            <span>
              {progress.current} / {progress.total} itens
            </span>
            <span className="text-[var(--accent-color)]">
              {progress.total > 0
                ? Math.round((progress.current / progress.total) * 100)
                : 0}
              %
            </span>
          </div>
          <div className="w-full h-2 bg-[var(--border-color)] rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-[var(--accent-color)] transition-all duration-300 ease-out"
              style={{
                width: `${
                  progress.total > 0 ? (progress.current / progress.total) * 100 : 0
                }%`,
              }}
            ></div>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-medium animate-pulse">
            {progress.timeMsg}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
