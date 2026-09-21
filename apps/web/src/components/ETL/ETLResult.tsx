import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, FileText } from 'lucide-react';
import { ReportData } from '../../types';
import { downloadETLReport } from '../../utils/reportExporter';

interface ETLResultProps {
  reportData: ReportData;
}

export const ETLResult: React.FC<ETLResultProps> = ({ reportData }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--card-bg)] border border-emerald-500/30 rounded-[2rem] p-8 shadow-2xl backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-8 border-b border-[var(--border-color)] pb-6">
        <div>
          <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
            Relatório Gerado
          </h3>
          <p className="text-sm font-bold text-[var(--accent-color)] mt-1 uppercase tracking-widest">
            {reportData.theme}
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">{reportData.date}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => downloadETLReport(reportData)}
            className="flex items-center gap-2 bg-[var(--accent-color)] text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all"
          >
            <FileText size={16} />
            Baixar PDF
          </button>
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 size={24} className="text-emerald-500" />
          </div>
        </div>
      </div>

      {reportData.summary && (
        <div className="mb-8 p-4 bg-[var(--bg-app)] rounded-xl border border-[var(--border-color)]">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2">
            Resumo Executivo
          </p>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">
            {reportData.summary}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {reportData.metrics.map((m, i) => (
          <div
            key={i}
            className="bg-[var(--bg-app)] p-4 rounded-xl border border-[var(--border-color)]"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2">
              {m.label}
            </p>
            <p className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
              {m.value}
              {m.unit && (
                <span className="text-sm font-normal text-[var(--text-secondary)] ml-1">
                  {m.unit}
                </span>
              )}
            </p>
            {m.context && (
              <p className="text-[10px] text-[var(--text-secondary)] mt-1 leading-snug">
                {m.context}
              </p>
            )}
          </div>
        ))}
      </div>

      {reportData.insights.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">
            Principais Insights
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportData.insights.map((ins, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-app)]/50"
              >
                <span className="text-[9px] font-black uppercase bg-[var(--accent-color)]/10 text-[var(--accent-color)] px-2 py-1 rounded mb-2 inline-block">
                  {ins.type}
                </span>
                <p className="text-sm text-[var(--text-primary)]">{ins.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
