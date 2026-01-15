import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Plus, ArrowRight, Layout, Trash2, Calendar, User, CheckCircle2 } from "lucide-react";
import PageTransition from "../components/PageTransition";
import { useAuth } from "../contexts/AuthContext";
import { Page, Task } from "../types";

export default function TodoDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [myAssignedTasks, setMyAssignedTasks] = useState<{task: Task, pageId: string, pageTitle: string}[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrega páginas e filtra tarefas atribuídas
  useEffect(() => {
    const q = query(collection(db, "pages"), where("type", "==", "kanban")); // Assume que 'kanban' ou 'board' identifica quadros
    const unsub = onSnapshot(q, (snapshot) => {
      const loadedPages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Page));
      setPages(loadedPages);

      // Filtra tarefas atribuídas ao usuário logado
      if (user) {
        const tasks: {task: Task, pageId: string, pageTitle: string}[] = [];
        loadedPages.forEach(page => {
          if (page.tasks) {
            Object.values(page.tasks).forEach(task => {
              if (task.assignedTo === user.uid && task.status !== 'done') { // Opcional: filtrar concluidas
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
        type: "kanban",
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
    } catch (error) {
      console.error("Erro ao criar quadro:", error);
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
            className="bg-[var(--accent-color)] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:brightness-110 transition-all shadow-lg flex items-center gap-2"
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
                            className="bg-[var(--card-bg)] p-6 rounded-[2rem] border border-[var(--border-color)] hover:border-[var(--accent-color)] transition-all group block"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[9px] font-black uppercase tracking-widest bg-[var(--bg-app)] px-2 py-1 rounded-lg text-[var(--text-secondary)] truncate max-w-[150px]">
                                    {pageTitle}
                                </span>
                                <div className="w-2 h-2 rounded-full bg-[var(--accent-color)] shadow-[0_0_10px_currentColor] animate-pulse"/>
                            </div>
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 line-clamp-2">
                                {task.content}
                            </h3>
                            <p className="text-[10px] text-[var(--text-secondary)] mb-4 line-clamp-2 h-8">
                                {task.description || "Sem descrição..."}
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pages.map((page) => (
                <Link 
                key={page.id} 
                to={`/todo/${page.id}`}
                className="group relative bg-[var(--card-bg)] p-8 rounded-[2.5rem] border border-[var(--border-color)] hover:border-[var(--accent-color)] hover:shadow-2xl transition-all duration-300 flex flex-col min-h-[220px]"
                >
                <div className="absolute top-8 right-8 p-3 bg-[var(--bg-app)] rounded-2xl text-[var(--text-secondary)] group-hover:text-[var(--accent-color)] transition-colors border border-[var(--border-color)]">
                    <Layout size={20} />
                </div>

                <div className="mt-auto">
                    <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2 leading-tight group-hover:translate-x-1 transition-transform">
                    {page.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-4 opacity-60">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-[var(--bg-app)] px-3 py-1 rounded-lg">
                        {new Date(page.updatedAt?.seconds * 1000).toLocaleDateString()}
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