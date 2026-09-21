import React from 'react';
import { Zap, Plus, CheckCircle2, ArrowRight, CheckSquare } from 'lucide-react';
import { QuickTask } from '../../types';

interface WorkspaceQuickTasksProps {
  quickTasks: QuickTask[];
  newTaskInput: string;
  setNewTaskInput: (val: string) => void;
  selectedUserForTask: string;
  setSelectedUserForTask: (val: string) => void;
  usersList: { id: string; name: string }[];
  onAddTask: () => void;
  onDeleteTask: (id: string) => void;
  t: any;
}

export const WorkspaceQuickTasks: React.FC<WorkspaceQuickTasksProps> = ({
  quickTasks,
  newTaskInput,
  setNewTaskInput,
  selectedUserForTask,
  setSelectedUserForTask,
  usersList,
  onAddTask,
  onDeleteTask,
  t,
}) => {
  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <h3 className="text-2xl font-black italic text-[var(--text-primary)] uppercase tracking-tighter flex items-center gap-3">
          <Zap size={24} className="text-yellow-500 fill-yellow-500" />{' '}
          {t.workspace.headers.fastTasks}
        </h3>
      </div>

      <div className="flex flex-col gap-4 mb-8 bg-black/20 p-4 rounded-3xl border border-white/5 shrink-0">
        <input
          className="w-full bg-transparent border-none outline-none px-4 py-1 text-sm font-black text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:opacity-50"
          placeholder={t.workspace.placeholders.taskInput}
          value={newTaskInput}
          onChange={(e) => setNewTaskInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onAddTask()}
        />
        <div className="flex items-center gap-3">
          <select
            value={selectedUserForTask}
            onChange={(e) => setSelectedUserForTask(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase text-[var(--text-secondary)] outline-none cursor-pointer appearance-none hover:bg-white/10 transition-colors"
          >
            <option value="">{t.workspace.labels.forMe}</option>
            {usersList.map((u) => (
              <option key={u.id} value={u.id}>
                {t.workspace.labels.for} {u.name.split(' ')[0]}
              </option>
            ))}
          </select>
          <button
            onClick={onAddTask}
            className="bg-gradient-to-br from-[var(--accent-color)] to-[var(--accent-hover)] text-white h-10 w-10 rounded-xl border-none cursor-pointer hover:shadow-[0_0_20px_rgba(255,106,0,0.3)] hover:-translate-y-0.5 transition-all shrink-0 flex items-center justify-center shadow-lg"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
        {quickTasks.map((tk) => (
          <div
            key={tk.id}
            className="group relative flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-[var(--accent-color)]/30 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <button
              onClick={() => onDeleteTask(tk.id)}
              className="relative mt-0.5 shrink-0 w-6 h-6 rounded-lg border-2 border-white/20 flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 transition-all bg-transparent cursor-pointer group/btn"
            >
              <CheckCircle2
                size={12}
                className="opacity-0 group-hover/btn:opacity-100 text-white"
              />
            </button>
            <div className="relative flex flex-col min-w-0">
              <span className="text-sm font-black text-[var(--text-primary)] leading-tight group-hover:translate-x-1 transition-transform">
                {tk.text}
              </span>
              {tk.assignedName && (
                <span className="text-[9px] font-black uppercase text-[var(--accent-color)] flex items-center gap-1 mt-3 bg-[var(--accent-color)]/10 w-fit px-2.5 py-1 rounded-md border border-[var(--accent-color)]/20">
                  <ArrowRight size={10} /> {tk.assignedName}
                </span>
              )}
            </div>
          </div>
        ))}
        {quickTasks.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-40 py-10">
            <div className="w-20 h-20 rounded-3xl bg-[var(--text-secondary)]/10 flex items-center justify-center mb-6">
               <CheckSquare size={40} className="text-[var(--text-secondary)]" />
            </div>
            <div className="text-xs font-black uppercase tracking-[0.2em]">
              {t.workspace.messages.allDone}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
