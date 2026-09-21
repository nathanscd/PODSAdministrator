import React from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { TodoColumn } from './TodoColumn';
import { Column } from '../../types';

interface TodoBoardProps {
  boardData: {
    tasks: Record<string, any>;
    columns: Record<string, Column>;
    columnOrder: string[];
  };
  onDragEnd: (result: any) => void;
  updateColumnTitle: (id: string, title: string) => void;
  deleteColumn: (id: string) => void;
  addTask: (id: string) => void;
  addColumn: () => void;
  toggleTaskCompletion: (e: React.MouseEvent, taskId: string) => void;
  onTaskClick: (taskId: string) => void;
  doneColumnId: string;
  t: any;
}

export const TodoBoard: React.FC<TodoBoardProps> = ({
  boardData,
  onDragEnd,
  updateColumnTitle,
  deleteColumn,
  addTask,
  addColumn,
  toggleTaskCompletion,
  onTaskClick,
  doneColumnId,
  t,
}) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="all-columns" direction="horizontal" type="column">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex-1 min-h-full overflow-x-auto custom-scrollbar flex gap-6 items-start px-2 md:px-10 pb-10"
            data-lenis-prevent
          >
            {boardData.columnOrder.map((columnId, index) => {
              const column = boardData.columns[columnId];
              const tasks = column.taskIds
                .map((id: string) => boardData.tasks[id])
                .filter(Boolean);
              const isDoneColumn = columnId === doneColumnId;

              return (
                <TodoColumn
                  key={column.id}
                  column={column}
                  tasks={tasks}
                  index={index}
                  isDoneColumn={isDoneColumn}
                  updateColumnTitle={updateColumnTitle}
                  deleteColumn={deleteColumn}
                  addTask={addTask}
                  toggleTaskCompletion={toggleTaskCompletion}
                  onTaskClick={onTaskClick}
                  t={t}
                />
              );
            })}
            {provided.placeholder}

            <button
              onClick={addColumn}
              className="w-[340px] shrink-0 h-[60px] rounded-[1.5rem] border-2 border-dashed border-[var(--border-color)] flex items-center justify-center gap-2 text-[var(--text-secondary)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] hover:bg-[var(--accent-color)]/5 transition-all bg-[var(--card-bg)] cursor-pointer shadow-sm"
            >
              <Plus size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {t.todoPage.defaults.newColumn}
              </span>
            </button>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
