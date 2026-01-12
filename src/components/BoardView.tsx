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
    if (!page.id) return;
    updatePage(page.id, newData);
  }, [page.id, updatePage]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;
    if (!destination || !boardData) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === 'column') {
      const newColumnOrder = Array.from(boardData.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);

      const newState = { ...boardData, columnOrder: newColumnOrder };
      setBoardData(newState);
      saveData(newState);
      return;
    }

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
    const newTask: Task = { id: newTaskId, content: "Nova tarefa", description: "", assignedTo: "" };
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
    saveData(newState);
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
      <div className="overflow-x-auto pb-4 px-4 md:px-8 h-full custom-scrollbar">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 items-start h-full">
            {boardData.columnOrder.map((columnId) => {
              const column = boardData.columns[columnId];
              const tasks = column.taskIds.map((taskId) => boardData.tasks[taskId]).filter(Boolean);

              return (
                <div key={column.id} className="w-[280px] flex-shrink-0 flex flex-col max-h-full">
                  <div className="flex items-center justify-between mb-4 px-1 group/col">
                    <input 
                       className="text-xs font-black text-gray-400 uppercase tracking-widest bg-transparent outline-none border border-transparent focus:border-gray-200 rounded px-1 w-full italic"
                       value={column.title}
                       onChange={(e) => handleColumnTitleChange(column.id, e.target.value)}
                    />
                    <span className="text-gray-400 text-xs font-bold ml-2 opacity-30">{tasks.length}</span>
                    <button onClick={() => handleAddTask(column.id)} className="opacity-0 group-hover/col:opacity-100 hover:bg-gray-200 p-1 rounded text-gray-500 transition-all border-none shadow-none">
                      +
                    </button>
                  </div>

                  <Droppable droppableId={column.id} type="task">
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`min-h-[150px] rounded-[2rem] transition-colors pb-10 ${snapshot.isDraggingOver ? "bg-gray-100/50" : ""}`}
                      >
                        {tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => openTaskModal(task)}
                                className={`group bg-[var(--card-bg)] p-5 mb-3 rounded-[1.5rem] border border-[var(--border-color)] hover:border-[var(--accent-color)] relative cursor-pointer transition-all ${snapshot.isDragging ? "shadow-2xl rotate-2 z-50 bg-white" : ""}`}
                              >
                                <div className="text-sm text-[var(--text-primary)] mb-3 font-bold leading-relaxed break-words">
                                  {task.content}
                                </div>
                                {task.assignedTo && (
                                  <div className="flex justify-end">
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-[var(--accent-color)] text-white px-2 py-0.5 rounded-full">
                                      {task.assignedTo.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTask(task.id, column.id);
                                  }}
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 p-1 border-none bg-transparent"
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
                          className="w-full text-left text-gray-400 hover:text-[var(--accent-color)] p-4 text-[10px] font-black uppercase tracking-widest mt-1 rounded-[1.5rem] border-2 border-dashed border-[var(--border-color)] hover:border-[var(--accent-color)] transition-all flex items-center justify-center gap-2 bg-transparent shadow-none"
                        >
                          <span>+</span> Novo Item
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
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center backdrop-blur-md p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-[var(--card-bg)] w-full max-w-2xl h-fit max-h-[90vh] rounded-[3rem] border border-[var(--border-color)] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-10 border-b border-[var(--border-color)] flex justify-between items-start">
               <div className="w-full">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-color)] block mb-2">Editar Tarefa</span>
                  <input 
                    className="text-4xl font-black italic uppercase text-[var(--text-primary)] outline-none w-full bg-transparent tracking-tighter"
                    value={selectedTask.content}
                    onChange={(e) => handleUpdateTask({ ...selectedTask, content: e.target.value })}
                  />
               </div>
               <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-[var(--text-primary)] p-2 bg-transparent border-none">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-8">
              <div className="group">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Responsável</label>
                <input 
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-2xl px-5 py-3 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] transition-all"
                  placeholder="Nome da pessoa..."
                  value={selectedTask.assignedTo || ""}
                  onChange={(e) => handleUpdateTask({ ...selectedTask, assignedTo: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Descrição</label>
                <textarea 
                   className="w-full min-h-[200px] bg-[var(--bg-app)] border border-[var(--border-color)] rounded-[2rem] p-6 resize-none outline-none text-sm font-medium text-[var(--text-primary)] leading-relaxed focus:border-[var(--accent-color)] transition-all"
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