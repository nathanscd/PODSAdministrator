import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, CheckCircle2, File as FileIcon, ChevronRight } from 'lucide-react';

interface ComparisonPdfUploadProps {
  pdf1: File | null;
  setPdf1: (f: File | null) => void;
  pdf2: File | null;
  setPdf2: (f: File | null) => void;
  runPdfComparison: () => void;
  isPdfReady: boolean;
}

export const ComparisonPdfUpload: React.FC<ComparisonPdfUploadProps> = ({
  pdf1,
  setPdf1,
  pdf2,
  setPdf2,
  runPdfComparison,
  isPdfReady,
}) => {
  return (
    <motion.div
      key="step2_pdf"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-6">
        <FileText size={24} className="text-[var(--accent-color)]" />
        <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
          Upload de PDFs
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-app)] border border-[var(--border-color)] rounded-2xl p-6 transition-all focus-within:border-[var(--accent-color)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--text-primary)]">PDF 1 (Original)</h3>
            {pdf1 && (
              <span className="text-xs bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                <CheckCircle2 size={12} /> Importado
              </span>
            )}
          </div>
          {!pdf1 ? (
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[var(--border-color)] rounded-xl cursor-pointer hover:border-[var(--accent-color)] hover:bg-[var(--accent-color)]/5 transition-all group">
              <Upload className="text-[var(--text-secondary)] group-hover:text-[var(--accent-color)] mb-2 transition-colors" />
              <span className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">
                Selecionar PDF 1
              </span>
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={(e) => setPdf1(e.target.files?.[0] || null)}
              />
            </label>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl relative">
              <FileIcon size={32} className="text-[var(--accent-color)] mb-2" />
              <span className="text-sm font-bold truncate px-4 w-full text-center">
                {pdf1.name}
              </span>
              <button
                onClick={() => setPdf1(null)}
                className="absolute top-2 right-2 text-red-500 text-xs font-bold bg-red-500/10 px-2 py-1 rounded-md"
              >
                Trocar
              </button>
            </div>
          )}
        </div>

        <div className="bg-[var(--bg-app)] border border-[var(--border-color)] rounded-2xl p-6 transition-all focus-within:border-[var(--accent-color)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--text-primary)]">PDF 2 (Comparação)</h3>
            {pdf2 && (
              <span className="text-xs bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                <CheckCircle2 size={12} /> Importado
              </span>
            )}
          </div>
          {!pdf2 ? (
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[var(--border-color)] rounded-xl cursor-pointer hover:border-[var(--accent-color)] hover:bg-[var(--accent-color)]/5 transition-all group">
              <Upload className="text-[var(--text-secondary)] group-hover:text-[var(--accent-color)] mb-2 transition-colors" />
              <span className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">
                Selecionar PDF 2
              </span>
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={(e) => setPdf2(e.target.files?.[0] || null)}
              />
            </label>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl relative">
              <FileIcon size={32} className="text-[var(--accent-color)] mb-2" />
              <span className="text-sm font-bold truncate px-4 w-full text-center">
                {pdf2.name}
              </span>
              <button
                onClick={() => setPdf2(null)}
                className="absolute top-2 right-2 text-red-500 text-xs font-bold bg-red-500/10 px-2 py-1 rounded-md"
              >
                Trocar
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-[var(--border-color)]">
        <button
          disabled={!isPdfReady}
          onClick={runPdfComparison}
          className="bg-[var(--accent-color)] text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          Iniciar Comparação <ChevronRight size={18} />
        </button>
      </div>
    </motion.div>
  );
};
