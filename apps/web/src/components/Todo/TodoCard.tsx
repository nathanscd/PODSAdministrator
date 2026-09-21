import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { CheckCircle2, Circle, AlignLeft } from 'lucide-react';
import { Task } from '../../types';

interface TodoCardProps {
  task: Task;
  index: number;
  isDoneColumn: boolean;
  toggleTaskCompletion: (e: React.MouseEvent, taskId: string) => void;
  onClick: () => void;
}

export const TodoCard: React.FC<TodoCardProps> = ({
  task,
  index,
  isDoneColumn,
  toggleTaskCompletion,
  onClick,
}) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          style={{
            ...provided.draggableProps.style,
            ...(snapshot.isDragging
              ? {
                  transform: provided.draggableProps.style?.transform
                    ? `${provided.draggableProps.style.transform} scale(1.05) rotate(3deg)`
                    : 'scale(1.05) rotate(3deg)',
                  boxShadow: '0 25px 50px -12px rgba(255, 106, 0, 0.4)',
                  borderColor: 'var(--accent-color)',
                  backgroundColor: 'var(--card-bg)',
                  opacity: 1,
                  zIndex: 9999,
                }
              : {}),
          }}
          className={`
            bg-[var(--card-bg)] p-4 rounded-2xl border transition-colors cursor-pointer shadow-sm group relative overflow-hidden
            ${snapshot.isDragging ? '' : 'border-[var(--border-color)] hover:border-[var(--accent-color)]/50'}
            ${isDoneColumn && !snapshot.isDragging ? 'opacity-60 hover:opacity-100' : ''}
          `}
        >
          <div
            className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${
              isDoneColumn
                ? 'bg-emerald-500'
                : 'bg-[var(--accent-color)] opacity-0 group-hover:opacity-100'
            }`}
          />

          <div className="flex items-start gap-3">
            <button
              onClick={(e) => toggleTaskCompletion(e, task.id)}
              className="mt-0.5 shrink-0 text-[var(--text-secondary)] hover:text-emerald-500 transition-colors"
            >
              {isDoneColumn ? (
                <CheckCircle2 size={18} className="text-emerald-500" />
              ) : (
                <Circle size={18} />
              )}
            </button>

            <div className="flex-1">
              <p
                className={`text-sm font-bold leading-snug mb-3 transition-colors ${
                  isDoneColumn
                    ? 'text-[var(--text-secondary)] line-through decoration-[var(--border-color)]'
                    : 'text-[var(--text-primary)]'
                }`}
              >
                {task.content}
              </p>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  {task.assignedName && task.assignedTo && (
                    <div className="flex items-center gap-1.5 bg-[var(--bg-app)] px-2 py-1 rounded-lg border border-[var(--border-color)]">
                      <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-[7px] text-white font-black">
                        {task.assignedName.charAt(0)}
                      </div>
                      <span className="text-[8px] font-black uppercase text-[var(--text-secondary)] truncate max-w-[70px]">
                        {task.assignedName.split(' ')[0]}
                      </span>
                    </div>
                  )}
                  {task.description && (
                    <div className="text-[var(--text-secondary)] opacity-40">
                      <AlignLeft size={12} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
