import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { doc, onSnapshot, collection } from "firebase/firestore";
import { db } from "../firebase";
import { usePages } from "../hooks/usePages";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext"; // Importação do Toast (Pop-up)
import { Page, Task, Column } from "../types";
import { ArrowLeft, Plus, Globe, Lock, X, User, Trash2, Calendar, AlignLeft } from "lucide-react";
import PageTransition from "../components/PageTransition";
import { logAction } from "../utils/systemLogger"; 
import { sendNotification } from "../utils/notificationSystem";

export default function TodoPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const { updatePage } = usePages();
  const { user } = useAuth(); // Usuário atual (quem está atribuindo)
  const { addToast } = useToast(); // Hook para disparar o pop-up
  
  const [page, setPage] = useState<Page | null>(null);
  const [boardTitle, setBoardTitle] = useState("");
  
  // Estado local do board para manipulação rápida e fluida
  const [boardData, setBoardData] = useState<{ tasks: Record<string, Task>; columns: Record<string, Column>; columnOrder: string[]; } | null>(null);
  
  const [usersList, setUsersList] = useState<{id: string, name: string}[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // --- 1. CARREGAR LISTA DE USUÁRIOS (Para o Select) ---
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (s) => {
      setUsersList(s.docs.map(d => ({ 
        id: d.id, 
        name: d.data().displayName || d.data().name || "Sem nome" 
      })));
    });
    return unsub;
  }, []);

  // --- 2. CARREGAR DADOS DO BOARD (FIRESTORE) ---
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

  // --- 3. LÓGICA DE DRAG AND DROP ---
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;
    if (!destination || !boardData || !pageId) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Movendo Colunas
    if (type === "column") {
      const newColumnOrder = Array.from(boardData.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);
      
      updatePage(pageId, { columnOrder: newColumnOrder });
      return;
    }

    const start = boardData.columns[source.droppableId];
    const finish = boardData.columns[destination.droppableId];

    // Movendo Tarefa na MESMA coluna
    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
      const newColumn = { ...start, taskIds: newTaskIds };
      
      updatePage(pageId, { columns: { ...boardData.columns, [newColumn.id]: newColumn } });
      return;
    }

    // Movendo Tarefa entre COLUNAS DIFERENTES
    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);

    await updatePage(pageId, { 
      columns: { 
        ...boardData.columns, 
        [start.id]: { ...start, taskIds: startTaskIds }, 
        [finish.id]: { ...finish, taskIds: finishTaskIds } 
      } 
    });

    // Log Automático
    const taskContent = boardData.tasks[draggableId]?.content || "Tarefa";
    logAction("Moveu Tarefa", `${taskContent}: De ${start.title} para ${finish.title}`);
  };

  // --- 4. AÇÕES (CRUD) ---

  const addTask = async (columnId: string) => {
    if (!boardData || !pageId) return;

    const taskId = `task-${Date.now()}`;

    const newTask: Task = { 
      id: taskId, 
      content: "Nova tarefa", 
      description: "", 
      assignedTo: "", 
      assignedName: "", 
      status: "pending",
      createdAt: new Date().toISOString()
    };

    const newTasks = { ...boardData.tasks, [taskId]: newTask };
    const newColumns = { 
      ...boardData.columns,
      [columnId]: {
        ...boardData.columns[columnId],
        taskIds: [...boardData.columns[columnId].taskIds, taskId]
      }
    };

    try {
      await updatePage(pageId, { 
        tasks: newTasks,
        columns: newColumns
      });
      logAction("Criou Tarefa", `Na coluna: ${boardData.columns[columnId].title}`);
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
    }
  };

  const addColumn = async () => {
    if (!boardData || !pageId) return;
    const colId = `col-${Date.now()}`;
    const newColumn = { id: colId, title: "Nova Coluna", taskIds: [] };
    
    await updatePage(pageId, {
      columns: { ...boardData.columns, [colId]: newColumn },
      columnOrder: [...boardData.columnOrder, colId]
    });

    logAction("Criou Coluna", "Nova seção adicionada ao quadro");
  };

  const updateColumnTitle = (colId: string, title: string) => {
    if (!boardData || !pageId) return;
    const newColumns = { ...boardData.columns };
    newColumns[colId].title = title;
    updatePage(pageId, { columns: newColumns });
  };

  const deleteColumn = async (colId: string) => {
    if (!boardData || !pageId) return;
    const colTitle = boardData.columns[colId].title;
    
    const newColumns = { ...boardData.columns };
    delete newColumns[colId];
    const newOrder = boardData.columnOrder.filter(id => id !== colId);
    
    await updatePage(pageId, { columns: newColumns, columnOrder: newOrder });
    logAction("Excluiu Coluna", `Coluna: ${colTitle}`);
  };

  // --- 5. ATUALIZAÇÃO DE DETALHES E ATRIBUIÇÃO (IMPORTANTE) ---
  const updateTaskDetails = async (taskId: string, updates: Partial<Task>) => {
    if (!boardData || !pageId) return;
    
    let finalUpdates = { ...updates };
    let logMsg = "";
    
    const currentTaskContent = boardData.tasks[taskId]?.content || "Tarefa";

    // Verifica se a propriedade assignedTo está sendo alterada
    if (updates.assignedTo !== undefined) {
        if (updates.assignedTo === "") {
            // Se estiver limpando
            finalUpdates.assignedName = "";
            logMsg = "Removeu atribuição";
            addToast("Atribuição removida.", "info");
        } else {
            // Se estiver atribuindo a alguém
            const assignedUser = usersList.find(u => u.id === updates.assignedTo);
            const userName = assignedUser?.name || "Usuário";
            
            finalUpdates.assignedName = userName;
            logMsg = `Atribuiu para: ${userName}`;

            // A: Envia Notificação Persistente
            await sendNotification(
                updates.assignedTo, 
                "Nova Tarefa Atribuída",
                `${user?.displayName || "Um administrador"} atribuiu a tarefa "${currentTaskContent}" a você no quadro ${boardTitle}.`,
                "assignment",
                `/todo/${pageId}`
            );

            // B: Exibe Toast (Pop-up) Instantâneo
            addToast(`Tarefa atribuída a ${userName} com sucesso!`, "success");
        }
    }

    // Atualiza Estado Local (Optimistic UI)
    const newTasks = { ...boardData.tasks };
    newTasks[taskId] = { ...newTasks[taskId], ...finalUpdates } as Task;
    
    if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, ...finalUpdates } as Task);
    }

    // Atualiza Firestore
    await updatePage(pageId, { tasks: newTasks });

    // Loga a ação
    if (logMsg) {
        logAction("Alterou Responsável", `${currentTaskContent} - ${logMsg}`);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!boardData || !pageId) return;
    const taskContent = boardData.tasks[taskId].content;

    const newTasks = { ...boardData.tasks };
    delete newTasks[taskId];
    const newColumns = { ...boardData.columns };
    Object.keys(newColumns).forEach(cId => {
      newColumns[cId].taskIds = newColumns[cId].taskIds.filter(id => id !== taskId);
    });
    
    await updatePage(pageId, { tasks: newTasks, columns: newColumns });
    setIsModalOpen(false);

    logAction("Excluiu Tarefa", `Task: ${taskContent}`);
    addToast("Tarefa excluída.", "info");
  };

  if (!boardData || !page) return null;

  return (
    <PageTransition>
      <div className="main p-10 flex flex-col h-screen overflow-hidden bg-[var(--bg-app)]">
        
        {/* HEADER */}
        <header className="flex items-center justify-between mb-8 shrink-0 px-2 pt-6 mx-8">
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

        {/* BOARD AREA */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-columns" direction="horizontal" type="column">
            {(provided) => (
              <main {...provided.droppableProps} ref={provided.innerRef} className="flex-1 overflow-x-auto custom-scrollbar flex gap-8 items-start px-10 pb-10">
                {boardData.columnOrder.map((columnId, index) => {
                  const column = boardData.columns[columnId];
                  const tasks = column.taskIds.map(id => boardData.tasks[id]).filter(Boolean);
                  return (
                    <Draggable key={column.id} draggableId={column.id} index={index}>
                      {(provided) => (
                        <div {...provided.draggableProps} ref={provided.innerRef} className="w-[340px] shrink-0 flex flex-col max-h-full">
                          
                          {/* Coluna Header */}
                          <div className="flex items-center justify-between mb-4 px-2 group/col" {...provided.dragHandleProps}>
                            <input 
                              className="font-black text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)] bg-transparent border-none outline-none focus:text-[var(--accent-color)] w-full"
                              value={column.title}
                              onChange={(e) => updateColumnTitle(column.id, e.target.value)}
                            />
                            <button onClick={() => deleteColumn(column.id)} className="opacity-0 group-hover/col:opacity-100 p-1 text-red-500 hover:bg-red-500/10 rounded-lg transition-all bg-transparent border-none cursor-pointer">
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {/* Coluna Content */}
                          <div className="bg-[#0a0a0a] rounded-[2rem] border border-[var(--border-color)] p-2 flex flex-col shadow-inner max-h-full overflow-hidden">
                              <Droppable droppableId={column.id} type="task">
                                {(provided) => (
                                  <div {...provided.droppableProps} ref={provided.innerRef} className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-3 min-h-[100px]">
                                    {tasks.map((task, idx) => (
                                      <Draggable key={task.id} draggableId={task.id} index={idx}>
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                            onClick={() => { setSelectedTask(task); setIsModalOpen(true); }}
                                            style={{ ...provided.draggableProps.style }}
                                            className={`
                                                bg-[var(--card-bg)] p-5 rounded-[1.5rem] border border-[var(--border-color)] 
                                                hover:border-[var(--accent-color)]/50 transition-all cursor-pointer shadow-sm group
                                                ${snapshot.isDragging ? 'shadow-2xl scale-105 border-[var(--accent-color)] z-50' : ''}
                                            `}
                                          >
                                            <p className="text-sm font-bold text-[var(--text-primary)] mb-3 leading-snug">{task.content}</p>
                                            
                                            <div className="flex items-center justify-between mt-2">
                                                {task.assignedName && task.assignedTo ? (
                                                  <div className="flex items-center gap-1.5 bg-[var(--bg-app)] px-2 py-1 rounded-lg border border-[var(--border-color)]">
                                                    <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-[8px] text-white font-bold">
                                                        {task.assignedName.charAt(0)}
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase text-[var(--text-secondary)] truncate max-w-[80px]">
                                                        {task.assignedName.split(' ')[0]}
                                                    </span>
                                                  </div>
                                                ) : (
                                                    <div className="opacity-0 group-hover:opacity-30 text-[var(--text-secondary)]">
                                                        <User size={14} />
                                                    </div>
                                                )}
                                                
                                                {task.description && (
                                                    <div className="text-[var(--text-secondary)] opacity-40">
                                                        <AlignLeft size={12} />
                                                    </div>
                                                )}
                                            </div>
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                              
                              <button 
                                onClick={() => addTask(column.id)} 
                                className="mx-2 mb-2 mt-2 py-3 rounded-xl bg-[var(--bg-app)] hover:bg-[var(--accent-color)] hover:text-white text-[var(--text-secondary)] transition-all flex items-center justify-center gap-2 font-black uppercase text-[9px] tracking-widest cursor-pointer border border-[var(--border-color)] hover:border-transparent"
                              >
                                <Plus size={14} /> Adicionar
                              </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
                
                {/* Botão Nova Coluna */}
                <button 
                    onClick={addColumn} 
                    className="w-[340px] shrink-0 h-[100px] rounded-[2rem] border-2 border-dashed border-[var(--border-color)] flex flex-col items-center justify-center gap-2 text-[var(--text-secondary)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] hover:bg-[var(--accent-color)]/5 transition-all bg-transparent cursor-pointer mt-10"
                >
                   <Plus size={20} />
                   <span className="text-[9px] font-black uppercase tracking-widest">Nova Coluna</span>
                </button>
              </main>
            )}
          </Droppable>
        </DragDropContext>

        {/* MODAL DE DETALHES DA TAREFA */}
        {isModalOpen && selectedTask && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
            <div className="relative bg-[var(--card-bg)] w-full max-w-2xl rounded-[3rem] border border-[var(--border-color)] shadow-2xl p-12 animate-in zoom-in-95 duration-200">
              
              <div className="flex justify-between items-start mb-8">
                <div className="space-y-2 w-full pr-8">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-color)]">Tarefa</span>
                  <input 
                    className="text-4xl font-black bg-transparent border-none outline-none w-full text-[var(--text-primary)] italic uppercase tracking-tighter placeholder:text-[var(--text-secondary)]/20"
                    value={selectedTask.content}
                    onChange={(e) => updateTaskDetails(selectedTask.id, { content: e.target.value })}
                  />
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-[var(--bg-app)] rounded-full text-[var(--text-secondary)] border-none bg-transparent shadow-none cursor-pointer transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Coluna Esquerda: Detalhes */}
                  <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-50 block mb-3 flex items-center gap-2">
                             <User size={12}/> Responsável
                        </label>
                        <div className="relative">
                            <select 
                                className="w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-2xl px-5 py-4 text-sm text-[var(--text-primary)] font-bold outline-none focus:border-[var(--accent-color)] cursor-pointer appearance-none hover:bg-[#151515] transition-colors"
                                value={selectedTask.assignedTo || ""}
                                onChange={(e) => updateTaskDetails(selectedTask.id, { assignedTo: e.target.value })}
                            >
                                <option value="">Não atribuído</option>
                                {usersList.map((u) => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">
                                <ArrowLeft size={14} className="-rotate-90"/>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-50 block mb-3 flex items-center gap-2">
                             <Calendar size={12}/> Data de Criação
                        </label>
                        <div className="bg-[var(--bg-app)] border border-[var(--border-color)] rounded-2xl px-5 py-4 text-xs font-mono text-[var(--text-secondary)] opacity-60">
                            {selectedTask.createdAt ? new Date(selectedTask.createdAt).toLocaleString() : "N/A"}
                        </div>
                    </div>
                  </div>

                  {/* Coluna Direita: Descrição */}
                  <div className="flex flex-col h-full">
                     <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-50 block mb-3 flex items-center gap-2">
                         <AlignLeft size={12}/> Descrição
                     </label>
                     <textarea 
                        className="flex-1 w-full bg-[var(--bg-app)] border border-[var(--border-color)] rounded-[2rem] p-6 text-sm text-[var(--text-primary)] font-medium outline-none focus:border-[var(--accent-color)] resize-none leading-relaxed min-h-[200px]"
                        placeholder="Adicione detalhes, notas ou checklists..."
                        value={selectedTask.description || ""}
                        onChange={(e) => updateTaskDetails(selectedTask.id, { description: e.target.value })}
                     />
                  </div>
              </div>

              <div className="flex gap-4 pt-8 mt-4 border-t border-[var(--border-color)]">
                <button 
                    onClick={() => deleteTask(selectedTask.id)} 
                    className="flex-1 py-4 bg-red-500/5 text-red-500 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-transparent hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} /> Excluir Tarefa
                </button>
                <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="flex-[2] py-4 bg-[var(--accent-color)] text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:brightness-110 transition-all border-none cursor-pointer hover:shadow-lg hover:shadow-[var(--accent-color)]/20"
                >
                  Salvar e Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}