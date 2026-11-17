import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Trash2, Plus } from 'lucide-react';
import { TodoCard } from './TodoCard';
import { Column, Task } from '../../types';

interface TodoColumnProps {
  column: Column;
  tasks: Task[];
  index: number;
  isDoneColumn: boolean;
  updateColumnTitle: (id: string, title: string) => void;
  deleteColumn: (id: string) => void;
  addTask: (id: string) => void;
  toggleTaskCompletion: (e: React.MouseEvent, taskId: string) => void;
  onTaskClick: (task: Task) => void;
  t: any;
}

export const TodoColumn: React.FC<TodoColumnProps> = ({
  column,
  tasks,
  index,
  isDoneColumn,
  updateColumnTitle,
  deleteColumn,
  addTask,
  toggleTaskCompletion,
  onTaskClick,
  t,
}) => {
  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="w-[340px] shrink-0 flex flex-col max-h-full"
        >
          <div
            className="flex items-center justify-between mb-4 px-3 group/col bg-[var(--card-bg)] py-3 rounded-2xl border border-[var(--border-color)] shadow-sm"
            {...provided.dragHandleProps}
          >
            <div className="flex items-center gap-2 w-full">
              <div
                className={`w-2 h-2 rounded-full ${
                  isDoneColumn ? 'bg-emerald-500' : 'bg-[var(--accent-color)]'
                }`}
              />
              <input
                className="text-[11px] text-[var(--text-primary)] bg-transparent border-none outline-none focus:text-[var(--accent-color)] w-full"
                value={column.title}
                onChange={(e) => updateColumnTitle(column.id, e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[var(--text-secondary)] bg-[var(--bg-app)] px-2 py-0.5 rounded-md border border-[var(--border-color)]">
                {tasks.length}
              </span>
              <button
                onClick={() => deleteColumn(column.id)}
                className="opacity-0 group-hover/col:opacity-100 p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div className="bg-[var(--card-bg)] rounded-[2rem] border border-[var(--border-color)] p-2 flex flex-col shadow-inner max-h-full overflow-hidden">
            <Droppable droppableId={column.id} type="task">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`flex-1 overflow-y-auto custom-scrollbar p-2 space-y-3 min-h-[120px] transition-colors ${
                    snapshot.isDraggingOver
                      ? 'bg-[var(--accent-color)]/5 ring-2 ring-[var(--accent-color)]/30 rounded-2xl'
                      : ''
                  }`}
                >
                  {tasks.map((task, idx) => (
                    <TodoCard
                      key={task.id}
                      task={task}
                      index={idx}
                      isDoneColumn={isDoneColumn}
                      toggleTaskCompletion={(e) => toggleTaskCompletion(e, task.id)}
                      onClick={() => onTaskClick(task)}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            <button
              onClick={() => addTask(column.id)}
              className="mx-2 mb-2 mt-2 py-3.5 rounded-2xl bg-[var(--bg-app)] hover:bg-[var(--accent-color)] hover:text-white text-[var(--text-secondary)] transition-all flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest cursor-pointer border border-[var(--border-color)] hover:border-transparent shadow-sm"
            >
              <Plus size={16} /> {t.todoPage.ui.add}
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};
