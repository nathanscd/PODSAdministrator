import { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import { useTodo } from '../hooks/useTodo';
import { TodoHeader } from '../components/Todo/TodoHeader';
import { TodoBoard } from '../components/Todo/TodoBoard';
import { TodoList } from '../components/Todo/TodoList';
import { TodoTaskModal } from '../components/Todo/TodoTaskModal';
import { AnimatePresence, motion } from 'framer-motion';

export default function TodoPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const {
    page,
    boardTitle,
    setBoardTitle,
    boardData,
    usersList,
    toggleTaskCompletion,
    onDragEnd,
    addTask,
    addColumn,
    updateColumnTitle,
    deleteColumn,
    updateTaskDetails,
    deleteTask,
    t,
    updatePage,
    getDoneColumnId,
  } = useTodo(pageId);

  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  if (!boardData || !page || !pageId) return null;

  const doneColumnId = getDoneColumnId();

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedTaskId(null);
    }, 300);
  };

  return (
    <PageTransition data-lenis-prevent>
      <div
        className="main p-6 min-h-[100vh] md:p-10 flex flex-col bg-[var(--bg-app)] relative"
        data-lenis-prevent
      >
        <div className="absolute top-0 right-0 w-[400px] h-full bg-[var(--accent-color)] rounded-full blur-[200px] opacity-10 pointer-events-none z-0" />

        <TodoHeader
          pageId={pageId}
          page={page}
          boardTitle={boardTitle}
          setBoardTitle={setBoardTitle}
          updatePage={updatePage}
          viewMode={viewMode}
          setViewMode={setViewMode}
          t={t}
        />

        <AnimatePresence mode="wait">
          {viewMode === 'board' ? (
            <motion.div
              key="board-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 relative z-10 flex flex-col"
            >
              <TodoBoard
                boardData={boardData}
                onDragEnd={onDragEnd}
                updateColumnTitle={updateColumnTitle}
                deleteColumn={deleteColumn}
                addTask={addTask}
                addColumn={addColumn}
                toggleTaskCompletion={(e, taskId) => {
                  const currentColId = Object.keys(boardData.columns).find((id) =>
                    boardData.columns[id].taskIds.includes(taskId)
                  );
                  if (currentColId) toggleTaskCompletion(taskId, currentColId);
                }}
                onTaskClick={(task) => handleTaskClick(task.id)}
                doneColumnId={doneColumnId}
                t={t}
              />
            </motion.div>
          ) : (
            <motion.div
              key="list-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 overflow-y-auto custom-scrollbar px-2 md:px-10 pb-20 relative z-10"
            >
              <TodoList
                boardData={boardData}
                doneColumnId={doneColumnId}
                addTask={addTask}
                toggleTaskCompletion={(e, taskId, currentColId) =>
                  toggleTaskCompletion(taskId, currentColId)
                }
                onTaskClick={(task) => handleTaskClick(task.id)}
                deleteTask={deleteTask}
                t={t}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <TodoTaskModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          taskId={selectedTaskId}
          boardData={boardData}
          usersList={usersList}
          updateTaskDetails={updateTaskDetails}
          deleteTask={deleteTask}
          t={t}
        />
      </div>
    </PageTransition>
  );
}
