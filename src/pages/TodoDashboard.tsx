import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, addDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Plus, ArrowRight, Layout, Calendar, User, Trash2, AlertTriangle } from "lucide-react";
import PageTransition from "../components/PageTransition";
import { useAuth } from "../contexts/AuthContext";
import { Page, Task } from "../types";
import { useToast } from "../contexts/ToastContext";

export default function TodoDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [pages, setPages] = useState<Page[]>([]);
  const [myAssignedTasks, setMyAssignedTasks] = useState<{task: Task, pageId: string, pageTitle: string}[]>([]);
  const [loading, setLoading] = useState(true);
  
  const formatDate = (dateValue: any) => {
    if (!dateValue) return "Data desconhecida";
    if (dateValue.seconds) return new Date(dateValue.seconds * 1000).toLocaleDateString();
    if (typeof dateValue === 'string') return new Date(dateValue).toLocaleDateString();
    return "Data inválida";
  };

  useEffect(() => {
    const q = query(collection(db, "pages")); 

    const unsub = onSnapshot(q, (snapshot) => {
      const loadedPages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Page));
      
      const boardPages = loadedPages.filter(p => p.type === 'board' || p.type === 'kanban' || !p.type);

      boardPages.sort((a, b) => {
        const dateA = a.updatedAt?.seconds || 0;
        const dateB = b.updatedAt?.seconds || 0;
        return dateB - dateA;
      });
      
      setPages(boardPages);

      if (user) {
        const tasks: {task: Task, pageId: string, pageTitle: string}[] = [];
        boardPages.forEach(page => {
          if (page.tasks) {
            Object.values(page.tasks).forEach(task => {
              if (task && task.assignedTo === user.uid && task.status !== 'done') {
                tasks.push({
                  task: task,
                  pageId: page.id,
                  pageTitle: page.title
                });
              }
            });
          }
        });
        setMyAssignedTasks(tasks);
      }
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const createNewBoard = async () => {
    try {
      const docRef = await addDoc(collection(db, "pages"), {
        title: "Novo Quadro",
        type: "board",
        ownerId: auth.currentUser?.uid,
        isPublic: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        tasks: {},
        columns: {
          "col-1": { id: "col-1", title: "A Fazer", taskIds: [] },
          "col-2": { id: "col-2", title: "Em Progresso", taskIds: [] },
          "col-3": { id: "col-3", title: "Concluído", taskIds: [] }
        },
        columnOrder: ["col-1", "col-2", "col-3"]
      });
      navigate(`/todo/${docRef.id}`);
      addToast("Quadro criado com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao criar quadro:", error);
      addToast("Erro ao criar quadro.", "error");
    }
  };

  const deleteBoard = async (e: React.MouseEvent, pageId: string, pageTitle: string) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (window.confirm(`Tem certeza que deseja excluir o quadro "${pageTitle}"? Essa ação não pode ser desfeita.`)) {
        try {
            await deleteDoc(doc(db, "pages", pageId));
            addToast("Quadro excluído.", "success");
        } catch (error) {
            console.error("Erro ao excluir:", error);
            addToast("Sem permissão para excluir.", "error");
        }
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen p-8 lg:p-20 bg-[var(--bg-app)]">
        
        <div className="flex justify-between items-end mb-16">
          <div>
             <h1 className="text-6xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">
               Workflows
             </h1>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-color)] mt-2">
               Gerenciamento de Quadros
             </p>
          </div>
          <button 
            onClick={createNewBoard}
            className="bg-[var(--accent-color)] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:brightness-110 transition-all shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Novo Quadro
          </button>
        </div>

        {/* --- SEÇÃO DE TAREFAS ATRIBUÍDAS --- */}
        <div className="mb-20">
            <h2 className="text-2xl font-black italic uppercase text-[var(--text-primary)] mb-8 flex items-center gap-3">
                <User className="text-[var(--accent-color)]" size={24}/>
                Atribuídas a Mim
                <span className="text-sm not-italic font-bold bg-[var(--card-bg)] px-3 py-1 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)]">
                    {myAssignedTasks.length}
                </span>
            </h2>

            {myAssignedTasks.length === 0 ? (
                <div className="p-10 border border-dashed border-[var(--border-color)] rounded-[2rem] text-center opacity-40">
                    <p className="text-xs font-black uppercase tracking-widest">Nenhuma tarefa pendente atribuída a você.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myAssignedTasks.map(({task, pageId, pageTitle}, idx) => (
                        <Link 
                            to={`/todo/${pageId}`} 
                            key={`${task.id}-${idx}`}
                            className="bg-[var(--card-bg)] p-6 rounded-[2rem] border border-[var(--border-color)] hover:border-[var(--accent-color)] transition-all group block relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--accent-color)]/5 rounded-full -mr-10 -mt-10 blur-xl"/>
                            
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <span className="text-[9px] font-black uppercase tracking-widest bg-[var(--bg-app)] px-2 py-1 rounded-lg text-[var(--text-secondary)] truncate max-w-[150px] border border-[var(--border-color)]">
                                    {pageTitle}
                                </span>
                                <div className="w-2 h-2 rounded-full bg-[var(--accent-color)] shadow-[0_0_10px_currentColor] animate-pulse"/>
                            </div>
                            
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 line-clamp-2 leading-tight">
                                {task.content}
                            </h3>
                            
                            <p className="text-[10px] text-[var(--text-secondary)] mb-6 line-clamp-2 h-8 leading-relaxed opacity-70">
                                {task.description || "Sem descrição disponível para esta tarefa..."}
                            </p>
                            
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--border-color)]">
                                <div className="flex items-center gap-2 text-[var(--accent-color)] text-[10px] font-black uppercase">
                                    <User size={12} /> Você
                                </div>
                                <span className="text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                                    <ArrowRight size={16} />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>

        {/* --- LISTA DE QUADROS --- */}
        <div>
            <h2 className="text-2xl font-black italic uppercase text-[var(--text-primary)] mb-8 flex items-center gap-3">
                <Layout className="text-[var(--accent-color)]" size={24}/>
                Todos os Quadros
            </h2>
            
            {loading && <p className="opacity-50 text-xs uppercase tracking-widest ml-1">Carregando...</p>}
            
            {!loading && pages.length === 0 && (
                <div className="text-center py-20 opacity-30 border border-dashed border-[var(--border-color)] rounded-[3rem]">
                    <AlertTriangle size={48} className="mx-auto mb-4 opacity-50"/>
                    <p className="text-xs font-black uppercase tracking-widest">Nenhum quadro encontrado.</p>
                    <p className="text-[10px] mt-2">Clique em "+ Novo Quadro" para começar.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pages.map((page) => (
                <Link 
                key={page.id} 
                to={`/todo/${page.id}`}
                className="group relative bg-[var(--card-bg)] p-8 rounded-[2.5rem] border border-[var(--border-color)] hover:border-[var(--accent-color)] hover:shadow-2xl transition-all duration-300 flex flex-col min-h-[220px]"
                >
                <div className="absolute top-8 right-8 flex gap-2">
                     {/* BOTÃO DELETAR */}
                    <button 
                        onClick={(e) => deleteBoard(e, page.id, page.title)}
                        className="p-3 bg-[var(--bg-app)] rounded-2xl text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 transition-colors border border-[var(--border-color)] z-20"
                    >
                        <Trash2 size={18} />
                    </button>
                    <div className="p-3 bg-[var(--bg-app)] rounded-2xl text-[var(--text-secondary)] group-hover:text-[var(--accent-color)] transition-colors border border-[var(--border-color)]">
                        <Layout size={20} />
                    </div>
                </div>

                <div className="mt-auto">
                    <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2 leading-tight group-hover:translate-x-1 transition-transform pr-16 break-words">
                    {page.title || "Sem Título"}
                    </h3>
                    <div className="flex items-center gap-3 mt-4 opacity-60">
                     <Calendar size={12}/>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-[var(--bg-app)] px-3 py-1 rounded-lg">
                        {formatDate(page.updatedAt)}
                    </span>
                    </div>
                </div>
                </Link>
            ))}
            </div>
        </div>
      </div>
    </PageTransition>
  );
}