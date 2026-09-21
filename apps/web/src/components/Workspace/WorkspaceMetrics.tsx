import React from 'react';
import { motion } from 'framer-motion';
import { Target, CheckSquare, LayoutGrid } from 'lucide-react';

interface WorkspaceMetricsProps {
  metrics: {
    totalOpps: number;
    activeTasks: number;
    assignedBoardTasks: number;
  };
  onAssignedTasksClick: () => void;
}

export const WorkspaceMetrics: React.FC<WorkspaceMetricsProps> = ({
  metrics,
  onAssignedTasksClick,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="group relative flex items-center gap-6 p-6 rounded-[2.5rem] bg-[var(--bg-app)]/40 border border-[var(--border-color)]/50 backdrop-blur-md shadow-lg hover:border-[var(--accent-color)]/50 transition-all duration-500 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
          <Target size={28} />
        </div>
        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-1 opacity-70">
            Total Opportunities
          </p>
          <h3 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter">
            {metrics.totalOpps}
          </h3>
        </div>
      </div>

      <div className="group relative flex items-center gap-6 p-6 rounded-[2.5rem] bg-[var(--bg-app)]/40 border border-[var(--border-color)]/50 backdrop-blur-md shadow-lg hover:border-[var(--accent-color)]/50 transition-all duration-500 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 shadow-inner">
          <CheckSquare size={28} />
        </div>
        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-1 opacity-70">
            Pending Tasks
          </p>
          <h3 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter">
            {metrics.activeTasks}
          </h3>
        </div>
      </div>

      <div
        onClick={onAssignedTasksClick}
        className="group relative flex items-center gap-6 p-6 rounded-[2.5rem] bg-[var(--bg-app)]/40 border border-[var(--border-color)]/50 backdrop-blur-md shadow-lg hover:border-[var(--accent-color)]/50 transition-all duration-500 hover:-translate-y-1 cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-inner">
          <LayoutGrid size={28} />
        </div>
        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-1 opacity-70">
            Assigned Board
          </p>
          <h3 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter">
            {metrics.assignedBoardTasks}
          </h3>
        </div>
      </div>
    </div>
  );
};
