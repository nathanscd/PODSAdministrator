import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Calendar, AlignLeft, Trash2, Check, AlertCircle } from 'lucide-react';
import { Task } from '../../types';

interface TodoTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null;
  boardData: {
    tasks: Record<string, Task>;
    columns: Record<string, any>;
    columnOrder: string[];
  } | null;
  usersList: { id: string; name: string }[];
  updateTaskDetails: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  t: any;
}

export const TodoTaskModal: React.FC<TodoTaskModalProps> = ({
  isOpen,
  onClose,
  taskId,
  boardData,
  usersList,
  updateTaskDetails,
  deleteTask,
  t,
}) => {
  const [localContent, setLocalContent] = useState('');
  const [localDescription, setLocalDescription] = useState('');
  const [localAssignedTo, setLocalAssignedTo] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const task = taskId && boardData ? boardData.tasks[taskId] : null;

  useEffect(() => {
    if (task && isOpen) {
      setLocalContent(task.content || '');
      setLocalDescription(task.description || '');
      setLocalAssignedTo(task.assignedTo || '');
      setError(null);
    }
  }, [task, isOpen, taskId]);

  if (!isOpen || !task) return null;

  const handleSave = async () => {
    if (!taskId) return;
    setIsSaving(true);
    setError(null);

    try {
      const updates: Partial<Task> = {};
      if (localContent !== task.content) updates.content = localContent;
      if (localDescription !== task.description) updates.description = localDescription;
      if (localAssignedTo !== task.assignedTo) updates.assignedTo = localAssignedTo;

      if (Object.keys(updates).length > 0) {
        await updateTaskDetails(taskId, updates);
      }

      setTimeout(() => {
        onClose();
      }, 200);
    } catch (err) {
      setError('Erro ao salvar. Tente novamente.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!taskId || !window.confirm('Tem certeza que deseja deletar esta tarefa?')) return;
    setIsSaving(true);
    setError(null);

    try {
      await deleteTask(taskId);
      onClose();
    } catch (err) {
      setError('Erro ao deletar. Tente novamente.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    localContent !== task.content ||
    localDescription !== task.description ||
    localAssignedTo !== task.assignedTo;

  const assignedUser = usersList.find((u) => u.id === localAssignedTo);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            data-lenis-prevent
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4 md:p-6 pointer-events-none"
            data-lenis-prevent
          >
            <div className="relative w-full max-w-2xl pointer-events-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent-color)]/20 to-transparent rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent-color)]/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 p-8 md:p-10">
                  <div className="flex items-start justify-between gap-4 mb-8">
                    <div className="flex-1 space-y-3">
                      <span className="inline-block text-[9px] font-black uppercase tracking-[0.3em] text-[var(--accent-color)] bg-[var(--accent-color)]/10 px-3 py-1.5 rounded-lg">
                        {t.todoPage.ui.taskLabel}
                      </span>
                      <input
                        type="text"
                        value={localContent}
                        onChange={(e) => setLocalContent(e.target.value)}
                        disabled={isSaving}
                        className="w-full text-3xl md:text-4xl font-black bg-transparent border-none outline-none text-[var(--text-primary)] italic tracking-tighter placeholder:text-[var(--text-secondary)]/20 disabled:opacity-50"
                      />
                    </div>
                    <motion.button
                      onClick={onClose}
                      disabled={isSaving}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 rounded-full bg-[var(--bg-app)] hover:bg-[var(--accent-color)] hover:text-white text-[var(--text-secondary)] border border-[var(--border-color)] transition-all shrink-0 disabled:opacity-50"
                    >
                      <X size={20} />
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60 flex items-center gap-2">
                          <User size={14} className="text-[var(--accent-color)]" />
                          {t.todoPage.ui.assignee}
                        </label>
                        <div className="relative group">
                          <select
                            value={localAssignedTo}
                            onChange={(e) => setLocalAssignedTo(e.target.value)}
                            disabled={isSaving}
                            className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-2xl px-5 py-4 text-sm text-[var(--text-primary)] font-bold outline-none focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)]/20 cursor-pointer appearance-none hover:border-[var(--accent-color)]/50 transition-all disabled:opacity-50"
                          >
                            <option value="">{t.todoPage.ui.unassigned}</option>
                            {usersList.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                          </div>
                        </div>
                        {assignedUser && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 p-3 bg-[var(--accent-color)]/10 rounded-lg border border-[var(--accent-color)]/20"
                          >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--accent-color)] to-[var(--accent-color)]/60 flex items-center justify-center text-white text-xs font-black">
                              {assignedUser.name.charAt(0)}
                            </div>
                            <span className="text-xs font-bold text-[var(--text-primary)]">
                              {assignedUser.name}
                            </span>
                          </motion.div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60 flex items-center gap-2">
                          <Calendar size={14} className="text-[var(--accent-color)]" />
                          {t.todoPage.ui.creationDate}
                        </label>
                        <div className="bg-[var(--bg-app)] border border-[var(--border-color)] rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-70">
                          {task.createdAt
                            ? new Date(task.createdAt).toLocaleString('pt-BR')
                            : 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60 flex items-center gap-2">
                        <AlignLeft size={14} className="text-[var(--accent-color)]" />
                        {t.todoPage.ui.description}
                      </label>
                      <textarea
                        value={localDescription}
                        onChange={(e) => setLocalDescription(e.target.value)}
                        disabled={isSaving}
                        placeholder={t.todoPage.ui.descPlaceholder}
                        className="flex-1 w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-2xl p-5 text-sm text-[var(--text-primary)] font-medium outline-none focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)]/20 resize-none leading-relaxed custom-scrollbar disabled:opacity-50 transition-all"
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm font-bold text-red-600 flex items-center gap-3"
                    >
                      <AlertCircle size={18} />
                      {error}
                    </motion.div>
                  )}

                  {hasChanges && !error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/30 rounded-xl text-xs font-bold text-[var(--accent-color)] flex items-center gap-3"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-[var(--accent-color)]"
                      />
                      Alterações não salvas
                    </motion.div>
                  )}

                  <div className="flex flex-col md:flex-row gap-3 pt-6 border-t border-[var(--border-color)]">
                    <motion.button
                      onClick={handleDelete}
                      disabled={isSaving}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-4 bg-red-500/10 text-red-500 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={16} />
                      {t.todoPage.ui.deleteTask}
                    </motion.button>

                    <motion.button
                      onClick={handleSave}
                      disabled={isSaving || !hasChanges}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-[2] py-4 bg-[var(--accent-color)] text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:shadow-[0_12px_32px_rgba(255,106,0,0.3)] hover:-translate-y-1 transition-all border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          {hasChanges ? 'Salvar Alterações' : t.todoPage.ui.saveClose}
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
