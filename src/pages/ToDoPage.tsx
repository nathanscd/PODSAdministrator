import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { usePages } from "../hooks/usePages";
import { Page, Task, Column } from "../types";
import { ArrowLeft, Plus, Globe, Lock, X, User, Trash2, Layout } from "lucide-react";
import PageTransition from "../components/PageTransition";

export default function TodoPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const { updatePage } = usePages();
  const [page, setPage] = useState<Page | null>(null);
  const [boardTitle, setBoardTitle] = useState("");
  const [boardData, setBoardData] = useState<{ tasks: Record<string, Task>; columns: Record<string, Column>; columnOrder: string[]; } | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!pageId) return;
    return onSnapshot(doc(db, "pages", pageId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Page;
        setPage(data);
        setBoardTitle(data.title || "");
        setBoardData({
          tasks: data.tasks || {},
          columns: data.columns || { 
            "col-1": { id: "col-1", title: "A Fazer", taskIds: [] }, 
            "col-2": { id: "col-2", title: "Em Andamento", taskIds: [] }, 
            "col-3": { id: "col-3", title: "Concluído", taskIds: [] } 
          },
          columnOrder: data.columnOrder || ["col-1", "col-2", "col-3"],
        });
      }
    });
  }, [pageId]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;
    if (!destination || !boardData || !pageId) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === "column") {
      const newColumnOrder = Array.from(boardData.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);
      updatePage(pageId, { columnOrder: newColumnOrder });
      return;
    }

    const start = boardData.columns[source.droppableId];
    const finish = boardData.columns[destination.droppableId];

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
      const newColumn = { ...start, taskIds: newTaskIds };
      updatePage(pageId, { columns: { ...boardData.columns, [newColumn.id]: newColumn } });
      return;
    }

    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);

    updatePage(pageId, { 
      columns: { 
        ...boardData.columns, 
        [start.id]: { ...start, taskIds: startTaskIds }, 
        [finish.id]: { ...finish, taskIds: finishTaskIds } 
      } 
    });
  };

  const addTask = (columnId: string) => {
    if (!boardData || !pageId) return;
    const taskId = `task-${Date.now()}`;
    const newTask = { id: taskId, content: "Nova tarefa", description: "", assignedTo: "" };
    const newTasks = { ...boardData.tasks, [taskId]: newTask };
    const newColumns = { ...boardData.columns };
    newColumns[columnId].taskIds.push(taskId);
    updatePage(pageId, { tasks: newTasks, columns: newColumns });
  };

  const addColumn = () => {
    if (!boardData || !pageId) return;
    const colId = `col-${Date.now()}`;
    const newColumn = { id: colId, title: "Nova Coluna", taskIds: [] };
    updatePage(pageId, {
      columns: { ...boardData.columns, [colId]: newColumn },
      columnOrder: [...boardData.columnOrder, colId]
    });
  };

  const updateColumnTitle = (colId: string, title: string) => {
    if (!boardData || !pageId) return;
    const newColumns = { ...boardData.columns };
    newColumns[colId].title = title;
    updatePage(pageId, { columns: newColumns });
  };

  const deleteColumn = (colId: string) => {
    if (!boardData || !pageId) return;
    const newColumns = { ...boardData.columns };
    delete newColumns[colId];
    const newOrder = boardData.columnOrder.filter(id => id !== colId);
    updatePage(pageId, { columns: newColumns, columnOrder: newOrder });
  };

  const updateTaskDetails = (taskId: string, updates: Partial<Task>) => {
    if (!boardData || !pageId) return;
    const newTasks = { ...boardData.tasks };
    newTasks[taskId] = { ...newTasks[taskId], ...updates };
    updatePage(pageId, { tasks: newTasks });
  };

  const deleteTask = (taskId: string) => {
    if (!boardData || !pageId) return;
    const newTasks = { ...boardData.tasks };
    delete newTasks[taskId];
    const newColumns = { ...boardData.columns };
    Object.keys(newColumns).forEach(cId => {
      newColumns[cId].taskIds = newColumns[cId].taskIds.filter(id => id !== taskId);
    });
    updatePage(pageId, { tasks: newTasks, columns: newColumns });
    setIsModalOpen(false);
  };

  if (!boardData || !page) return null;

  return (
    <PageTransition>
      <div className="main ml-10 -mr-10 flex flex-col ml-10 -mt-10 h-screen overflow-hidden">
        <header className="flex items-center justify-between mb-8 shrink-0 px-2">
          <div className="flex items-center gap-6 flex-1">
            <button onClick={() => navigate("/todo")} className="p-2 hover:bg-[var(--card-bg)] rounded-xl transition-all border-none bg-transparent">
              <ArrowLeft size={20} className="text-[var(--text-primary)]" />
            </button>
            <input 
              className="text-4xl font-black bg-transparent border-none outline-none w-full text-[var(--text-primary)] italic uppercase tracking-tighter"
              value={boardTitle}
              onChange={(e) => { setBoardTitle(e.target.value); updatePage(pageId!, { title: e.target.value }); }}
            />
            <button 
              onClick={() => updatePage(pageId!, { isPublic: !page.isPublic })}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                page.isPublic ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-orange-500/10 border-orange-500/20 text-orange-500"
              }`}
            >
              {page.isPublic ? <Globe size={12} /> : <Lock size={12} />}
              {page.isPublic ? "Público" : "Privado"}
            </button>
          </div>
        </header>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-columns" direction="horizontal" type="column">
            {(provided) => (
              <main {...provided.droppableProps} ref={provided.innerRef} className="flex-1 overflow-x-auto custom-scrollbar flex gap-8 items-start p-2 pb-10">
                {boardData.columnOrder.map((columnId, index) => {
                  const column = boardData.columns[columnId];
                  const tasks = column.taskIds.map(id => boardData.tasks[id]).filter(Boolean);
                  return (
                    <Draggable key={column.id} draggableId={column.id} index={index}>
                      {(provided) => (
                        <div {...provided.draggableProps} ref={provided.innerRef} className="w-[320px] shrink-0">
                          <div className="flex items-center justify-between mb-6 px-2 group/col" {...provided.dragHandleProps}>
                            <input 
                              className="font-black text-[10px] uppercase tracking-[0.3em] text-[var(--text-secondary)] bg-transparent border-none outline-none focus:text-[var(--accent-color)] w-full"
                              value={column.title}
                              onChange={(e) => updateColumnTitle(column.id, e.target.value)}
                            />
                            <button onClick={() => deleteColumn(column.id)} className="opacity-0 group-hover/col:opacity-100 p-1 text-red-500 hover:bg-red-500/10 rounded-lg transition-all bg-transparent border-none">
                              <Trash2 size={12} />
                            </button>
                          </div>

                          <Droppable droppableId={column.id} type="task">
                            {(provided) => (
                              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4 min-h-[150px]">
                                {tasks.map((task, idx) => (
                                  <Draggable key={task.id} draggableId={task.id} index={idx}>
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                        onClick={() => { setSelectedTask(task); setIsModalOpen(true); }}
                                        className="bg-[var(--card-bg)] p-6 rounded-[2rem] border border-[var(--border-color)] hover:border-[var(--accent-color)] transition-all cursor-pointer shadow-sm"
                                      >
                                        <p className="text-sm font-bold text-[var(--text-primary)] mb-3">{task.content}</p>
                                        {task.assignedTo && (
                                          <div className="flex items-center gap-2 text-[10px] font-black uppercase opacity-40">
                                            <User size={10} /> {task.assignedTo}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                                <button onClick={() => addTask(column.id)} className="w-full py-4 rounded-[2rem] border-2 border-dashed border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] transition-all bg-transparent flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest">
                                  <Plus size={14} /> Novo Item
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
                <button onClick={addColumn} className="w-[320px] shrink-0 h-[120px] rounded-[2.5rem] border-2 border-dashed border-[var(--border-color)] flex flex-col items-center justify-center gap-2 text-[var(--text-secondary)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] transition-all bg-transparent mt-12">
                   <Plus size={20} />
                   <span className="text-[9px] font-black uppercase tracking-widest">Nova Coluna</span>
                </button>
              </main>
            )}
          </Droppable>
        </DragDropContext>

        {isModalOpen && selectedTask && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
            <div className="relative bg-[var(--card-bg)] w-full max-w-xl rounded-[3rem] border border-[var(--border-color)] shadow-2xl p-10 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-start mb-10">
                <div className="space-y-1 w-full">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-color)]">Atividade</span>
                  <input 
                    className="text-3xl font-black bg-transparent border-none outline-none w-full text-[var(--text-primary)] italic uppercase tracking-tighter"
                    value={selectedTask.content}
                    onChange={(e) => updateTaskDetails(selectedTask.id, { content: e.target.value })}
                  />
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[var(--bg-app)] rounded-full text-[var(--text-secondary)] border-none bg-transparent shadow-none">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40 block mb-3">Atribuído a</label>
                  <input 
                    className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-2xl px-5 py-3 text-sm text-[var(--text-primary)] font-bold outline-none focus:border-[var(--accent-color)]"
                    placeholder="Responsável..."
                    value={selectedTask.assignedTo || ""}
                    onChange={(e) => updateTaskDetails(selectedTask.id, { assignedTo: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40 block mb-3">Descrição</label>
                  <textarea 
                    className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-[2rem] p-6 text-sm text-[var(--text-primary)] font-medium outline-none focus:border-[var(--accent-color)] h-40 resize-none leading-relaxed"
                    placeholder="Detalhes..."
                    value={selectedTask.description || ""}
                    onChange={(e) => updateTaskDetails(selectedTask.id, { description: e.target.value })}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={() => deleteTask(selectedTask.id)} className="flex-1 py-4 bg-red-500/10 text-red-500 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-red-500 hover:text-white transition-all border-none">
                    Excluir
                  </button>
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-[var(--accent-color)] text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:opacity-90 transition-all border-none">
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}