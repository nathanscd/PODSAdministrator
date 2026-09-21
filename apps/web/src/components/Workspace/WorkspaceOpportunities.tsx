import React from 'react';
import { Layers, ArrowRight } from 'lucide-react';
import { Opportunity } from '../../types';
import { motion } from 'framer-motion';

interface WorkspaceOpportunitiesProps {
  opportunities: Opportunity[];
  userGroup: string | null;
  t: any;
  onNavigateToOpportunities: () => void;
}

export const WorkspaceOpportunities: React.FC<WorkspaceOpportunitiesProps> = ({
  opportunities,
  userGroup,
  t,
  onNavigateToOpportunities,
}) => {
  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <h3 className="text-2xl font-black italic uppercase text-[var(--text-primary)] tracking-tighter flex items-center gap-3">
          <Layers size={24} className="text-[var(--accent-color)]" />{' '}
          {userGroup || t.workspace.headers.opportunities}
        </h3>
        <button
          onClick={onNavigateToOpportunities}
          className="w-10 h-10 flex items-center justify-center bg-[var(--bg-app)]/40 border border-[var(--border-color)]/50 backdrop-blur-md rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)] transition-all shadow-lg"
        >
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
        {opportunities.slice(0, 10).map((opp) => (
          <div
            key={opp.id}
            onClick={onNavigateToOpportunities}
            className="group relative flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-[var(--accent-color)]/30 transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-color)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex flex-col gap-2 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-black text-[var(--accent-color)] uppercase tracking-widest px-2 py-1 bg-[var(--accent-color)]/10 rounded-md border border-[var(--accent-color)]/20">
                  {opp.utility}
                </span>
                <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase border border-[var(--border-color)]/50 px-2 py-1 rounded-md bg-black/20">
                  {opp.status}
                </span>
              </div>
              <span className="text-sm font-black text-[var(--text-primary)] truncate group-hover:translate-x-1 transition-transform">
                {opp.description}
              </span>
            </div>
            <div className="relative hidden sm:flex flex-col items-end shrink-0 ml-4">
              <span className="text-[10px] font-black uppercase text-[var(--text-secondary)] mb-2 opacity-60">
                {opp.kam || 'No KAM'}
              </span>
              <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${opp.progress}%` }}
                  className="h-full bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-hover)] rounded-full"
                />
              </div>
            </div>
          </div>
        ))}
        {opportunities.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-40 py-20">
            <div className="w-20 h-20 rounded-3xl bg-[var(--text-secondary)]/10 flex items-center justify-center mb-6">
              <Layers size={40} className="text-[var(--text-secondary)]" />
            </div>
            <div className="text-xs font-black uppercase tracking-[0.2em]">
              {t.workspace.messages.noOpps}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
