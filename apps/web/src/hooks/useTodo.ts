import { useState, useEffect } from 'react';
import { doc, onSnapshot, collection, updateDoc } from 'firebase/firestore';
import { DropResult } from '@hello-pangea/dnd';
import { db } from '../firebase';
import { usePages } from '../hooks/usePages';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useLang } from '../contexts/LangContext';
import { Page, Task, Column } from '../types';
import { logAction } from '../utils/systemLogger';
import { sendNotification } from '../utils/notificationSystem';

export const useTodo = (pageId: string | undefined) => {
  const { updatePage } = usePages();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { t } = useLang();

  const [page, setPage] = useState<Page | null>(null);
  const [boardTitle, setBoardTitle] = useState('');
  const [boardData, setBoardData] = useState<{
    tasks: Record<string, Task>;
    columns: Record<string, Column>;
    columnOrder: string[];
  } | null>(null);
  const [usersList, setUsersList] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (s) => {
      setUsersList(
        s.docs.map((d) => ({
          id: d.id,
          name: d.data().displayName || d.data().name || t.todoPage.defaults.noName,
        }))
      );
    });
    return unsub;
  }, [t]);

  useEffect(() => {
    if (!pageId) return;
    return onSnapshot(doc(db, 'pages', pageId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Page;
        setPage(data);
        setBoardTitle(data.title || '');

        setBoardData({
          tasks: data.tasks || {},
          columns: data.columns || {
            'col-1': { id: 'col-1', title: t.todoPage.defaults.todo, taskIds: [] },
            'col-2': { id: 'col-2', title: t.todoPage.defaults.inProgress, taskIds: [] },
            'col-3': { id: 'col-3', title: t.todoPage.defaults.done, taskIds: [] },
          },
          columnOrder: data.columnOrder || ['col-1', 'col-2', 'col-3'],
        });
      }
    });
  }, [pageId, t]);

  const getDoneColumnId = () =>
    boardData?.columnOrder[boardData.columnOrder.length - 1] || '';
  const getTodoColumnId = () => boardData?.columnOrder[0] || '';

  const toggleTaskCompletion = async (taskId: string, currentColId: string) => {
    if (!boardData || !pageId) return;

    const doneColId = getDoneColumnId();
    const todoColId = getTodoColumnId();
    const targetColId = currentColId === doneColId ? todoColId : doneColId;

    if (currentColId === targetColId) return;

    const startCol = boardData.columns[currentColId];
    const finishCol = boardData.columns[targetColId];

    const startTaskIds = startCol.taskIds.filter((id) => id !== taskId);
    const finishTaskIds = [...finishCol.taskIds, taskId];

    await updatePage(pageId, {
      columns: {
        ...boardData.columns,
        [startCol.id]: { ...startCol, taskIds: startTaskIds },
        [finishCol.id]: { ...finishCol, taskIds: finishTaskIds },
      },
    });

    const taskContent =
      boardData.tasks[taskId]?.content || t.todoPage.defaults.task;
    logAction(
      t.todoPage.logs.movedTask,
      `${taskContent}: ${startCol.title} -> ${finishCol.title}`
    );
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;
    if (!destination || !boardData || !pageId) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    if (type === 'column') {
      const newColumnOrder = Array.from(boardData.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);

      await updatePage(pageId, { columnOrder: newColumnOrder });
      return;
    }

    const start = boardData.columns[source.droppableId];
    const finish = boardData.columns[destination.droppableId];

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
      const newColumn = { ...start, taskIds: newTaskIds };

      await updatePage(pageId, {
        columns: { ...boardData.columns, [newColumn.id]: newColumn },
      });
      return;
    }

    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);

    await updatePage(pageId, {
      columns: {
        ...boardData.columns,
        [start.id]: { ...start, taskIds: startTaskIds },
        [finish.id]: { ...finish, taskIds: finishTaskIds },
      },
    });

    const taskContent =
      boardData.tasks[draggableId]?.content || t.todoPage.defaults.task;
    logAction(
      t.todoPage.logs.movedTask,
      `${taskContent}: ${start.title} -> ${finish.title}`
    );
  };

  const addTask = async (columnId: string) => {
    if (!boardData || !pageId) return;

    const taskId = `task-${Date.now()}`;
    const newTask: Task = {
      id: taskId,
      content: t.todoPage.defaults.newTask,
      description: '',
      assignedTo: '',
      assignedName: '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const newTasks = { ...boardData.tasks, [taskId]: newTask };
    const newColumns = {
      ...boardData.columns,
      [columnId]: {
        ...boardData.columns[columnId],
        taskIds: [...boardData.columns[columnId].taskIds, taskId],
      },
    };

    try {
      await updatePage(pageId, { tasks: newTasks, columns: newColumns });
      logAction(
        t.todoPage.logs.createdTask,
        `${boardData.columns[columnId].title}`
      );
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      addToast('Erro ao criar tarefa', 'error');
    }
  };

  const addColumn = async () => {
    if (!boardData || !pageId) return;
    const colId = `col-${Date.now()}`;
    const newColumn = { id: colId, title: t.todoPage.defaults.newColumn, taskIds: [] };

    try {
      await updatePage(pageId, {
        columns: { ...boardData.columns, [colId]: newColumn },
        columnOrder: [...boardData.columnOrder, colId],
      });
      logAction(t.todoPage.logs.createdColumn, t.todoPage.logs.newSection);
    } catch (error) {
      console.error('Erro ao adicionar coluna:', error);
      addToast('Erro ao criar coluna', 'error');
    }
  };

  const updateColumnTitle = async (colId: string, title: string) => {
    if (!boardData || !pageId) return;
    const newColumns = { ...boardData.columns };
    newColumns[colId].title = title;
    
    try {
      await updatePage(pageId, { columns: newColumns });
    } catch (error) {
      console.error('Erro ao atualizar título da coluna:', error);
      addToast('Erro ao atualizar coluna', 'error');
    }
  };

  const deleteColumn = async (colId: string) => {
    if (!boardData || !pageId) return;
    const colTitle = boardData.columns[colId].title;

    const newColumns = { ...boardData.columns };
    delete newColumns[colId];
    const newOrder = boardData.columnOrder.filter((id) => id !== colId);

    try {
      await updatePage(pageId, { columns: newColumns, columnOrder: newOrder });
      logAction(t.todoPage.logs.deletedColumn, `${colTitle}`);
      addToast('Coluna deletada', 'info');
    } catch (error) {
      console.error('Erro ao deletar coluna:', error);
      addToast('Erro ao deletar coluna', 'error');
    }
  };

  const updateTaskDetails = async (taskId: string, updates: Partial<Task>) => {
    if (!boardData || !pageId) return;

    let finalUpdates = { ...updates };
    let logMsg = '';
    const currentTaskContent =
      boardData.tasks[taskId]?.content || t.todoPage.defaults.task;

    if (updates.assignedTo !== undefined) {
      if (updates.assignedTo === '') {
        finalUpdates.assignedName = '';
        logMsg = t.todoPage.logs.assignmentRemoved;
        addToast(t.todoPage.notifications.removedAssign, 'info');
      } else {
        const assignedUser = usersList.find((u) => u.id === updates.assignedTo);
        const userName = assignedUser?.name || t.todoPage.defaults.user;

        finalUpdates.assignedName = userName;
        logMsg = `${t.todoPage.logs.assignedTo}: ${userName}`;

        try {
          await sendNotification(
            updates.assignedTo,
            t.todoPage.notifications.title,
            t.todoPage.notifications.body
              .replace('{user}', user?.displayName || 'Admin')
              .replace('{task}', currentTaskContent)
              .replace('{board}', boardTitle),
            'assignment',
            `/todo/${pageId}`
          );
        } catch (error) {
          console.error('Erro ao enviar notificação:', error);
        }

        addToast(
          t.todoPage.notifications.successAssign.replace('{name}', userName),
          'success'
        );
      }
    }

    const newTasks = { ...boardData.tasks };
    newTasks[taskId] = { ...newTasks[taskId], ...finalUpdates } as Task;

    try {
      await updatePage(pageId, { tasks: newTasks });

      if (logMsg) {
        logAction(t.todoPage.logs.changedAssignee, `${currentTaskContent} - ${logMsg}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      addToast('Erro ao salvar alterações', 'error');
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!boardData || !pageId) return;
    const taskContent = boardData.tasks[taskId].content;

    const newTasks = { ...boardData.tasks };
    delete newTasks[taskId];
    const newColumns = { ...boardData.columns };
    Object.keys(newColumns).forEach((cId) => {
      newColumns[cId].taskIds = newColumns[cId].taskIds.filter((id) => id !== taskId);
    });

    try {
      await updatePage(pageId, { tasks: newTasks, columns: newColumns });
      logAction(t.todoPage.logs.deletedTask, `Task: ${taskContent}`);
      addToast(t.todoPage.notifications.deletedTask, 'info');
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      addToast('Erro ao deletar tarefa', 'error');
      throw error;
    }
  };

  return {
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
  };
};
