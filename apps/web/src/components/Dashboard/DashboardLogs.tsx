import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  User,
  CheckCircle2,
  Activity,
  FileText,
  Trash2,
  Shield,
} from 'lucide-react';
import { timeAgo } from '../../utils/systemLogger';

interface DashboardLogsProps {
  recentLogs: any[];
  setIsLogsOpen: (b: boolean) => void;
  t: any;
}

export const DashboardLogs: React.FC<DashboardLogsProps> = ({
  recentLogs,
  setIsLogsOpen,
  t: workspaceT,
}) => {
  const getLogIcon = (action: string) => {
    const l = action.toLowerCase();
    if (l.includes('login') || l.includes('acesso'))
      return <User size={18} strokeWidth={2.5} />;
    if (l.includes('meta') || l.includes('tarefa'))
      return <CheckCircle2 size={18} strokeWidth={2.5} />;
    if (l.includes('coluna')) return <Activity size={18} strokeWidth={2.5} />;
    if (l.includes('página') || l.includes('page'))
      return <FileText size={18} strokeWidth={2.5} />;
    if (l.includes('exclui')) return <Trash2 size={18} strokeWidth={2.5} />;
    return <Shield size={18} strokeWidth={2.5} />;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="m-0 text-xl font-black tracking-tighter text-[var(--text-primary)]">Events</h2>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-app)]/60 text-[var(--text-secondary)] border border-[var(--border-color)]/50">
            <Clock size={14} strokeWidth={3} />
          </div>
        </div>
 
        <div className="flex flex-col gap-5 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
          {recentLogs.length === 0 ? (
            <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40 text-center py-8">
              No recent activity
            </span>
          ) : (
            recentLogs.map((log, i) => (
              <div
                key={log.id}
                className="flex items-start gap-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-app)]/80 text-[var(--text-primary)] border border-[var(--border-color)]/50 shadow-sm">
                  {getLogIcon(log.action)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[12px] font-black tracking-tight text-[var(--text-primary)]">{log.user}</span>
                  <span className="text-[11px] font-medium text-[var(--text-secondary)] opacity-70 leading-snug truncate">{log.action}</span>
                  <span className="mt-1 text-[9px] font-black tracking-tighter text-[var(--text-secondary)] opacity-30 uppercase">{timeAgo(log.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
 
        <motion.button
          onClick={() => setIsLogsOpen(true)}
          className="mt-8 w-full rounded-xl border border-[var(--border-color)]/50 bg-[var(--bg-app)]/60 py-3 text-[10px] font-black tracking-[0.15em] text-[var(--text-primary)] uppercase transition-all hover:bg-[var(--accent-color)] hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-[var(--accent-color)]/20"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          View Full Log
        </motion.button>
      </div>
    </div>
  );
};
