import { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { usePages } from "../hooks/usePages";
import { Page, Task, Column } from "../types";

interface BoardViewProps {
  page: Page;
}

export default function BoardView({ page }: BoardViewProps) {
  const { updatePage } = usePages();
  const [boardData, setBoardData] = useState<{
    tasks: Record<string, Task>;
    columns: Record<string, Column>;
    columnOrder: string[];
  } | null>(null);
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (page.tasks && page.columns && page.columnOrder) {
      setBoardData({
        tasks: page.tasks,
        columns: page.columns,
        columnOrder: page.columnOrder,
      });
    }
  }, [page]);

  const saveData = useCallback((newData: any) => {
    updatePage(page.id, newData);
  }, [page.id, updatePage]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || !boardData) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const start = boardData.columns[source.droppableId];
    const finish = boardData.columns[destination.droppableId];

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
      const newColumn = { ...start, taskIds: newTaskIds };
      const newState = { ...boardData, columns: { ...boardData.columns, [newColumn.id]: newColumn } };
      setBoardData(newState);
      saveData(newState);
      return;
    }

    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = { ...start, taskIds: startTaskIds };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = { ...finish, taskIds: finishTaskIds };

    const newState = {
      ...boardData,
      columns: { ...boardData.columns, [newStart.id]: newStart, [newFinish.id]: newFinish },
    };
    setBoardData(newState);
    saveData(newState);
  };

  const handleAddTask = (columnId: string) => {
    if (!boardData) return;
    const newTaskId = `task-${Date.now()}`;
    const newTask: Task = { id: newTaskId, content: "Nova tarefa", description: "", assignee: "" };
    const newState = {
      ...boardData,
      tasks: { ...boardData.tasks, [newTaskId]: newTask },
      columns: {
        ...boardData.columns,
        [columnId]: { ...boardData.columns[columnId], taskIds: [...boardData.columns[columnId].taskIds, newTaskId] },
      },
    };
    setBoardData(newState);
    saveData(newState);
  };

  const handleUpdateTask = (task: Task) => {
    if (!boardData) return;
    const newState = {
      ...boardData,
      tasks: { ...boardData.tasks, [task.id]: task },
    };
    setBoardData(newState);
    saveData(newState);
    setSelectedTask(task); 
  };

  const handleColumnTitleChange = (columnId: string, newTitle: string) => {
    if (!boardData) return;
    const newState = {
      ...boardData,
      columns: {
        ...boardData.columns,
        [columnId]: { ...boardData.columns[columnId], title: newTitle },
      },
    };
    setBoardData(newState);
    const timeoutId = setTimeout(() => saveData(newState), 1000);
    return () => clearTimeout(timeoutId);
  };

  const handleDeleteTask = (taskId: string, columnId: string) => {
     if (!boardData) return;
     if(!confirm("Deletar tarefa?")) return;
     
     const newColumnTaskIds = boardData.columns[columnId].taskIds.filter(id => id !== taskId);
     const newTasks = { ...boardData.tasks };
     delete newTasks[taskId];

     const newState = {
       ...boardData,
       tasks: newTasks,
       columns: { ...boardData.columns, [columnId]: { ...boardData.columns[columnId], taskIds: newColumnTaskIds } }
     };
     setBoardData(newState);
     saveData(newState);
     if(selectedTask?.id === taskId) {
        setIsModalOpen(false);
        setSelectedTask(null);
     }
  };

  const openTaskModal = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  if (!boardData) return <div className="text-gray-400">Carregando quadro...</div>;

  return (
    <>
      <div className="overflow-x-auto pb-4 px-4 md:px-8 h-full">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 items-start h-full">
            {boardData.columnOrder.map((columnId) => {
              const column = boardData.columns[columnId];
              const tasks = column.taskIds.map((taskId) => boardData.tasks[taskId]);

              return (
                <div key={column.id} className="w-[280px] flex-shrink-0 flex flex-col max-h-full">
                  <div className="flex items-center justify-between mb-2 px-1 group/col">
                    <input 
                       className="text-sm font-semibold text-gray-500 uppercase tracking-wider bg-transparent outline-none border border-transparent focus:border-gray-200 rounded px-1 w-full"
                       value={column.title}
                       onChange={(e) => handleColumnTitleChange(column.id, e.target.value)}
                    />
                    <span className="text-gray-400 text-xs font-normal ml-2">{tasks.length}</span>
                    <button onClick={() => handleAddTask(column.id)} className="opacity-0 group-hover/col:opacity-100 hover:bg-gray-200 p-1 rounded text-gray-500 transition-all">
                      +
                    </button>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`min-h-[150px] rounded transition-colors pb-10 ${snapshot.isDraggingOver ? "bg-gray-50/50" : ""}`}
                      >
                        {tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => openTaskModal(task)}
                                className={`group bg-white p-3 mb-2 rounded shadow-sm border border-gray-200 hover:border-gray-300 relative cursor-pointer hover:bg-gray-50 transition-all ${snapshot.isDragging ? "shadow-lg rotate-2 z-50" : ""}`}
                              >
                                <div className="text-sm text-[#37352F] mb-2 font-medium break-words">
                                  {task.content}
                                </div>
                                {task.assignee && (
                                  <div className="flex justify-end">
                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                                      {task.assignee.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTask(task.id, column.id);
                                  }}
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 p-1"
                                >
                                  ×
                                </button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        <button
                          onClick={() => handleAddTask(column.id)}
                          className="w-full text-left text-gray-400 hover:text-gray-600 p-2 text-sm mt-1 rounded hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                          <span>+</span> Novo
                        </button>
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {isModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white w-full max-w-2xl h-[80vh] rounded-lg shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            
            <div className="px-8 pt-8 pb-4 border-b border-gray-100 flex justify-between items-start">
               <input 
                  className="text-3xl font-bold text-[#37352F] outline-none w-full bg-transparent placeholder-gray-300"
                  value={selectedTask.content}
                  onChange={(e) => handleUpdateTask({ ...selectedTask, content: e.target.value })}
               />
               <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="mb-6 flex items-center gap-4 text-sm text-gray-600">
                <div className="w-32 text-gray-500">Atribuído a</div>
                <input 
                  className="bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded outline-none focus:ring-1 focus:ring-blue-300 transition-colors"
                  placeholder="Nome da pessoa..."
                  value={selectedTask.assignee || ""}
                  onChange={(e) => handleUpdateTask({ ...selectedTask, assignee: e.target.value })}
                />
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Descrição</h4>
                <textarea 
                   className="w-full min-h-[300px] resize-none outline-none text-[#37352F] leading-relaxed placeholder-gray-300"
                   placeholder="Adicione detalhes sobre esta tarefa..."
                   value={selectedTask.description || ""}
                   onChange={(e) => handleUpdateTask({ ...selectedTask, description: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}