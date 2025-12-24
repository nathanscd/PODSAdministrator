import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { usePages } from "../hooks/usePages";
import { Page, Task, Column } from "../types";

export default function TodoPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const { updatePage } = usePages();
  
  const [boardTitle, setBoardTitle] = useState("");
  const [boardData, setBoardData] = useState<{
    tasks: Record<string, Task>;
    columns: Record<string, Column>;
    columnOrder: string[];
  } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!pageId) return;
    const unsub = onSnapshot(doc(db, "pages", pageId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Page;
        setBoardTitle(data.title || "");
        
        // CORREÇÃO AQUI:
        // Removemos a verificação 'if type === board'.
        // Se não houver colunas salvas, usamos um padrão inicial.
        const defaultColumns = {
          "col-1": { id: "col-1", title: "A Fazer", taskIds: [] },
          "col-2": { id: "col-2", title: "Em Andamento", taskIds: [] },
          "col-3": { id: "col-3", title: "Concluído", taskIds: [] }
        };
        const defaultOrder = ["col-1", "col-2", "col-3"];

        setBoardData({
          tasks: data.tasks || {},
          columns: (data.columns && Object.keys(data.columns).length > 0) ? data.columns : defaultColumns,
          columnOrder: (data.columnOrder && data.columnOrder.length > 0) ? data.columnOrder : defaultOrder,
        });
      } else {
        // Se o documento não existir, redireciona ou avisa
        navigate("/"); 
      }
    });
    return unsub;
  }, [pageId, navigate]);

  const saveData = useCallback((newData: any) => {
    if (pageId) {
        // Forçamos o type='board' para garantir que futuras leituras saibam que isso virou um quadro
        updatePage(pageId, { ...newData, type: 'board' });
    }
  }, [pageId, updatePage]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination || !boardData) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === "column") {
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

  const handleAddColumn = () => {
    if (!boardData) return;
    const newColId = `col-${Date.now()}`;
    const newColumn: Column = { id: newColId, title: "Novo Quadro", taskIds: [] };
    
    const newState = {
      ...boardData,
      columns: { ...boardData.columns, [newColId]: newColumn },
      columnOrder: [...boardData.columnOrder, newColId]
    };
    setBoardData(newState);
    saveData(newState);
  };

  const handleDeleteColumn = (colId: string) => {
    if (!boardData) return;
    if (!confirm("Deletar este quadro e suas tarefas?")) return;

    const newColumnOrder = boardData.columnOrder.filter(id => id !== colId);
    const newColumns = { ...boardData.columns };
    
    // Opcional: Limpar tarefas orfãs
    if (boardData.columns[colId]) {
        boardData.columns[colId].taskIds.forEach(taskId => {
            if (boardData.tasks[taskId]) delete boardData.tasks[taskId]; // Nota: isso é uma simplificação local
        });
        delete newColumns[colId];
    }

    const newState = {
      ...boardData,
      columns: newColumns,
      columnOrder: newColumnOrder
    };
    setBoardData(newState);
    saveData(newState);
  };

  const handleAddTask = (columnId: string) => {
    if (!boardData) return;
    const newTaskId = `task-${Date.now()}`;
    const newTask: Task = { 
      id: newTaskId, 
      content: "Nova tarefa", 
      description: "", 
      assignee: "" 
    };

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
    openTaskModal(newTask);
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

  const handleDeleteTask = (taskId: string, columnId: string) => {
    if (!boardData) return;
    if (!confirm("Excluir tarefa permanentemente?")) return;

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
    if (selectedTask?.id === taskId) {
      setIsModalOpen(false);
      setSelectedTask(null);
    }
  };

  const handleColumnTitleChange = (colId: string, val: string) => {
    if (!boardData) return;
    const newState = {
      ...boardData,
      columns: { ...boardData.columns, [colId]: { ...boardData.columns[colId], title: val } }
    };
    setBoardData(newState);
    // Debounce simples
    const timer = setTimeout(() => saveData(newState), 1000);
    return () => clearTimeout(timer);
  };

  const openTaskModal = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  if (!boardData) return (
    <div className="flex items-center justify-center h-screen text-gray-400 gap-2">
        <span className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full"></span>
        Carregando quadro...
    </div>
  );

  return (
    <div className="h-screen bg-white text-[#37352F] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4 shrink-0 bg-white">
        <button onClick={() => navigate("/")} className="text-gray-400 hover:bg-gray-100 p-2 rounded text-sm transition-colors">
          ⤺ Voltar
        </button>
        <input 
          className="text-xl font-bold outline-none placeholder-gray-300 w-full bg-transparent"
          value={boardTitle}
          onChange={(e) => {
            setBoardTitle(e.target.value);
            if(pageId) updatePage(pageId, { title: e.target.value });
          }}
          placeholder="Nome do Projeto"
        />
      </div>

      {/* Board Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-[#F7F7F5]">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-columns" direction="horizontal" type="column">
            {(provided) => (
              <div 
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex gap-4 h-full items-start"
              >
                {boardData.columnOrder.map((columnId, index) => {
                  const column = boardData.columns[columnId];
                  // Proteção extra caso a coluna exista no order mas não no objeto columns
                  if (!column) return null; 

                  const tasks = column.taskIds.map((taskId) => boardData.tasks[taskId]).filter(Boolean);

                  return (
                    <Draggable key={column.id} draggableId={column.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="w-[280px] flex-shrink-0 flex flex-col max-h-full group/column"
                        >
                          {/* Column Header */}
                          <div className="flex items-center justify-between mb-2 px-1" {...provided.dragHandleProps}>
                            <input
                              className="text-sm font-semibold text-gray-600 bg-transparent outline-none focus:bg-white focus:shadow-sm px-1 py-0.5 rounded w-full border border-transparent focus:border-blue-200"
                              value={column.title}
                              onChange={(e) => handleColumnTitleChange(column.id, e.target.value)}
                            />
                            <div className="flex items-center gap-1">
                               <span className="text-gray-400 text-xs">{tasks.length}</span>
                               <button 
                                 onClick={() => handleDeleteColumn(column.id)}
                                 className="opacity-0 group-hover/column:opacity-100 hover:bg-red-50 text-gray-400 hover:text-red-500 p-1 rounded transition-opacity"
                               >
                                 ×
                               </button>
                            </div>
                          </div>

                          {/* Tasks Container */}
                          <Droppable droppableId={column.id} type="task">
                            {(provided, snapshot) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={`flex-1 overflow-y-auto px-1 pb-2 rounded-lg transition-colors scrollbar-hide ${snapshot.isDraggingOver ? "bg-gray-200/50" : ""}`}
                              >
                                {tasks.map((task, index) => (
                                  <Draggable key={task.id} draggableId={task.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        onClick={() => openTaskModal(task)}
                                        className={`
                                          group bg-white p-3 mb-2 rounded shadow-sm border border-gray-200 
                                          hover:shadow-md cursor-pointer relative transition-all
                                          ${snapshot.isDragging ? "shadow-xl rotate-2 z-50 ring-2 ring-blue-400" : ""}
                                        `}
                                      >
                                        <div className="text-sm text-[#37352F] font-medium mb-2 break-words leading-relaxed">
                                          {task.content}
                                        </div>
                                        
                                        {task.assignee && (
                                          <div className="flex justify-end mt-2">
                                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100 font-medium">
                                              {task.assignee}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                                <button
                                  onClick={() => handleAddTask(column.id)}
                                  className="w-full text-left text-gray-500 hover:text-gray-800 p-2 text-sm mt-1 rounded hover:bg-gray-200/50 transition-colors flex items-center gap-2"
                                >
                                  + Novo
                                </button>
                              </div>
                            )}
                          </Droppable>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
                
                {/* Add Column Button */}
                <button
                  onClick={handleAddColumn}
                  className="w-[280px] flex-shrink-0 h-10 flex items-center gap-2 px-3 text-gray-500 hover:bg-gray-200/50 rounded transition-colors text-sm font-medium"
                >
                  + Adicionar quadro
                </button>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Modal */}
      {isModalOpen && selectedTask && (
        <div 
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white w-full max-w-3xl h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 pt-8 pb-4 flex justify-between items-start gap-4 shrink-0 border-b border-transparent hover:border-gray-50 transition-colors">
               <textarea 
                  className="text-3xl font-bold text-[#37352F] outline-none w-full bg-transparent resize-none overflow-hidden placeholder-gray-300"
                  value={selectedTask.content}
                  rows={1}
                  onChange={(e) => handleUpdateTask({ ...selectedTask, content: e.target.value })}
                  onInput={(e) => {
                    e.currentTarget.style.height = "auto";
                    e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";
                  }}
               />
               <div className="flex gap-2 shrink-0">
                  <button 
                     onClick={() => handleDeleteTask(selectedTask.id, Object.keys(boardData!.columns).find(key => boardData!.columns[key].taskIds.includes(selectedTask.id))!)}
                     className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded p-2 transition-colors"
                     title="Excluir"
                  >
                    🗑️
                  </button>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded p-2 transition-colors">
                    ✕
                  </button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-4">
              <div className="grid grid-cols-[140px_1fr] items-center gap-y-6 mb-8 text-sm">
                <div className="text-gray-500 font-medium flex items-center gap-2">
                  👤 Responsável
                </div>
                <input 
                  className="bg-transparent hover:bg-gray-100 px-2 py-1.5 rounded outline-none focus:ring-1 focus:ring-blue-200 transition-colors w-full sm:w-1/2 text-[#37352F]"
                  placeholder="Vazio"
                  value={selectedTask.assignee || ""}
                  onChange={(e) => handleUpdateTask({ ...selectedTask, assignee: e.target.value })}
                />
              </div>

              <div className="border-t border-gray-100 my-6"></div>

              <div className="flex flex-col h-full pb-10">
                <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                  📄 Descrição
                </h4>
                <textarea 
                   className="w-full flex-1 resize-none outline-none text-[#37352F] leading-relaxed placeholder-gray-300 bg-transparent text-base"
                   placeholder="Digite '/' para comandos ou comece a escrever..."
                   value={selectedTask.description || ""}
                   onChange={(e) => handleUpdateTask({ ...selectedTask, description: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}