import React from 'react';
import { Plus, CheckCircle2, Circle, AlignLeft, Clock, Trash2 } from 'lucide-react';
import { Column } from '../../types';

interface TodoListProps {
  boardData: {
    tasks: Record<string, any>;
    columns: Record<string, Column>;
    columnOrder: string[];
  };
  doneColumnId: string;
  addTask: (id: string) => void;
  toggleTaskCompletion: (e: React.MouseEvent, taskId: string, currentColId: string) => void;
  onTaskClick: (taskId: string) => void;
  deleteTask: (id: string) => void;
  t: any;
}

export const TodoList: React.FC<TodoListProps> = ({
  boardData,
  doneColumnId,
  addTask,
  toggleTaskCompletion,
  onTaskClick,
  deleteTask,
  t,
}) => {
  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {boardData.columnOrder.map((columnId) => {
        const column = boardData.columns[columnId];
        const tasks = column.taskIds
          .map((id: string) => boardData.tasks[id])
          .filter(Boolean);
        const isDoneColumn = columnId === doneColumnId;

        return (
          <div key={column.id} className="flex flex-col">
            <div className="flex items-center gap-4 mb-4 border-b border-[var(--border-color)] pb-3">
              <div
                className={`w-3 h-3 rounded-full shadow-sm ${
                  isDoneColumn ? 'bg-emerald-500' : 'bg-[var(--accent-color)]'
                }`}
              />
              <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight uppercase">
                {column.title}
              </h2>
              <span className="bg-[var(--card-bg)] text-[var(--text-secondary)] text-[10px] font-bold px-2 py-1 rounded-md border border-[var(--border-color)]">
                {tasks.length}
              </span>

              <div className="ml-auto">
                <button
                  onClick={() => addTask(column.id)}
                  className="text-[var(--text-secondary)] hover:text-[var(--accent-color)] p-2 bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {tasks.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-[var(--border-color)] rounded-2xl bg-[var(--card-bg)]/50 opacity-60">
                <p className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">
                  Sem tarefas nesta seção
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task.id)}
                    className={`
                      flex items-center gap-4 p-4 bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] hover:border-[var(--accent-color)]/50 transition-all cursor-pointer group shadow-sm
                      ${isDoneColumn ? 'opacity-60 hover:opacity-100 bg-[var(--bg-app)]' : ''}
                    `}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskCompletion(e, task.id, column.id);
                      }}
                      className="shrink-0 text-[var(--text-secondary)] hover:text-emerald-500 transition-colors p-1"
                    >
                      {isDoneColumn ? (
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      ) : (
                        <Circle size={20} />
                      )}
                    </button>

                    <div className="flex-1 min-w-0 flex items-center justify-between gap-6">
                      <div className="flex items-center gap-3 min-w-0">
                        <p
                          className={`text-sm font-bold truncate transition-colors ${
                            isDoneColumn
                              ? 'text-[var(--text-secondary)] line-through decoration-[var(--border-color)]'
                              : 'text-[var(--text-primary)]'
                          }`}
                        >
                          {task.content}
                        </p>
                        {task.description && (
                          <AlignLeft
                            size={14}
                            className="text-[var(--text-secondary)] shrink-0 opacity-40"
                          />
                        )}
                      </div>

                      <div className="flex items-center gap-6 shrink-0">
                        {task.assignedName && (
                          <div className="hidden sm:flex items-center gap-2 bg-[var(--bg-app)] px-3 py-1.5 rounded-lg border border-[var(--border-color)]">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-[8px] text-white font-black">
                              {task.assignedName.charAt(0)}
                            </div>
                            <span className="text-[10px] font-black uppercase text-[var(--text-secondary)] max-w-[100px] truncate">
                              {task.assignedName}
                            </span>
                          </div>
                        )}

                        {task.createdAt && (
                          <div className="hidden md:flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60">
                            <Clock size={12} />
                            {new Date(task.createdAt).toLocaleDateString()}
                          </div>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTask(task.id);
                          }}
                          className="p-2 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
