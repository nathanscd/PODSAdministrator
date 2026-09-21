import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, addDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Plus, ArrowRight, Layout, Calendar, User, Trash2, AlertTriangle, Globe, Lock, ShieldCheck, CheckSquare } from "lucide-react";
import PageTransition from "../components/PageTransition";
import { useAuth } from "../contexts/AuthContext";
import { Page, Task } from "../types";
import { useToast } from "../contexts/ToastContext";
import { useLang } from "../contexts/LangContext";
import { motion } from "framer-motion";
import { useTitle } from "../hooks/useTitle";
import { PageHero } from "../components/ui/page-hero";
import { DashboardWidget } from "../components/ui/dashboard-widget";
import { EmptyState } from "../components/ui/empty-state";
import { Button } from "../components/ui/button";
import { StatusBadge } from "../components/ui/status-badge";

export default function TodoDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { t } = useLang();
  useTitle(`${t.sidebar.tasks} - PODS Administrator`);
  
  const [pages, setPages] = useState<Page[]>([]);
  const [myAssignedTasks, setMyAssignedTasks] = useState<{task: Task, pageId: string, pageTitle: string}[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  
  const formatDate = (dateValue: any) => {
    if (!dateValue) return t.todoDashboard.unknownDate;
    if (dateValue.seconds) return new Date(dateValue.seconds * 1000).toLocaleDateString();
    if (typeof dateValue === 'string') return new Date(dateValue).toLocaleDateString();
    return t.todoDashboard.invalidDate;
  };

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const map: Record<string, string> = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        map[doc.id] = data.name || data.email || "Usuário";
      });
      setUsersMap(map);
    });
    return () => unsubUsers();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "pages")); 

    const unsub = onSnapshot(q, (snapshot) => {
      const loadedPages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Page));
      
      const boardPages = loadedPages.filter(p => {
        const isBoard = p.type === 'board' || p.type === 'kanban' || !p.type;
        const isMineOrPublic = p.ownerId === user.uid || p.isPublic;
        return isBoard && isMineOrPublic;
      });

      boardPages.sort((a, b) => {
        const dateA = a.updatedAt?.seconds || 0;
        const dateB = b.updatedAt?.seconds || 0;
        return dateB - dateA;
      });
      
      setPages(boardPages);

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
      setLoading(false);
    });
    
    return () => unsub();
  }, [user]);

  const createNewBoard = async () => {
    try {
      const docRef = await addDoc(collection(db, "pages"), {
        title: t.todoDashboard.newBoard, 
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
      addToast(t.todoDashboard.createSuccess, "success");
    } catch (error) {
      console.error("Erro ao criar quadro:", error);
      addToast(t.todoDashboard.createError, "error");
    }
  };

  const deleteBoard = async (e: React.MouseEvent, pageId: string, pageTitle: string) => {
    e.preventDefault(); 
    e.stopPropagation();

    const confirmMsg = t.todoDashboard.confirmDelete.replace("{title}", pageTitle);

    if (window.confirm(confirmMsg)) {
        try {
            await deleteDoc(doc(db, "pages", pageId));
            addToast(t.todoDashboard.deleteSuccess, "success");
        } catch (error) {
            console.error("Erro ao excluir:", error);
            addToast(t.todoDashboard.deleteError, "error");
        }
    }
  };

  const getCreatorName = (ownerId?: string) => {
    if (!ownerId) return "Sistema";
    if (ownerId === user?.uid) return "Você";
    return usersMap[ownerId] || "Usuário Desconhecido";
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHero
          title={t.todoDashboard.title}
          description={t.todoDashboard.subtitle}
          icon={<CheckSquare className="w-6 h-6 text-[var(--primary)]" />}
          actions={
            <Button onClick={createNewBoard} className="gap-2">
              <Plus className="w-4 h-4" />
              <span>{t.todoDashboard.newBoard}</span>
            </Button>
          }
        />

        {/* Assigned to Me Section */}
        <DashboardWidget
          title={t.todoDashboard.assignedToMe}
          subtitle={`Total de tarefas pendentes: ${myAssignedTasks.length}`}
          icon={<User className="w-4 h-4 text-[var(--primary)]" />}
        >
          {myAssignedTasks.length === 0 ? (
            <EmptyState
              icon={<CheckSquare className="w-8 h-8 text-[var(--muted-foreground)]" />}
              title={t.todoDashboard.noAssignedTasks}
              description="Você não possui nenhuma tarefa atribuída pendente nos quadros ativos."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myAssignedTasks.map(({ task, pageId, pageTitle }, idx) => (
                <Link 
                  to={`/todo/${pageId}`} 
                  key={`${task.id}-${idx}`}
                  className="group flex flex-col justify-between p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-subtle)] hover:border-[var(--primary)]/40 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-semibold text-[var(--muted-foreground)] bg-[var(--muted)] px-2.5 py-0.5 rounded-lg truncate max-w-[160px]">
                        {pageTitle}
                      </span>
                      <StatusBadge status="warning" label="Pendente" />
                    </div>

                    <h4 className="text-sm font-bold text-[var(--foreground)] line-clamp-2 leading-snug mb-1 group-hover:text-[var(--primary)] transition-colors">
                      {task.content}
                    </h4>

                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mb-4">
                      {task.description || t.todoDashboard.noDesc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs font-medium text-[var(--primary)]">
                    <span>Ver no quadro</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </DashboardWidget>

        {/* Task Boards Section */}
        <DashboardWidget
          title="Quadros de Tarefas"
          subtitle="Gerencie quadros Kanban pessoais e de equipe"
          icon={<Layout className="w-4 h-4 text-[var(--muted-foreground)]" />}
        >
          {loading ? (
            <div className="flex items-center justify-center p-12 text-xs font-semibold text-[var(--muted-foreground)]">
              Carregando quadros...
            </div>
          ) : pages.length === 0 ? (
            <EmptyState
              icon={<AlertTriangle className="w-8 h-8 text-[var(--muted-foreground)]" />}
              title={t.todoDashboard.noBoardsFound}
              description={t.todoDashboard.startPrompt}
              primaryActionLabel={t.todoDashboard.newBoard}
              onPrimaryAction={createNewBoard}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {pages.map((page, idx) => {
                const isOwner = page.ownerId === user?.uid;
                const creatorName = getCreatorName(page.ownerId);

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    key={page.id} 
                  >
                    <Link 
                      to={`/todo/${page.id}`}
                      className="group relative flex flex-col justify-between p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-subtle)] hover:border-[var(--primary)]/40 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-all duration-200 min-h-[220px]"
                    >
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-1.5">
                          {page.isPublic ? (
                            <StatusBadge status="success" label="Público" />
                          ) : (
                            <StatusBadge status="neutral" label="Privado" />
                          )}
                          {isOwner && <StatusBadge status="info" label="Meu Quadro" />}
                        </div>

                        {isOwner && (
                          <button 
                            onClick={(e) => deleteBoard(e, page.id, page.title)}
                            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="my-auto">
                        <h3 className="text-base font-bold text-[var(--foreground)] line-clamp-2 tracking-tight group-hover:text-[var(--primary)] transition-colors">
                          {page.title || t.todoDashboard.untitled}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between border-t border-[var(--border)] pt-3 mt-3 text-xs text-[var(--muted-foreground)]">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold text-[10px] flex items-center justify-center">
                            {creatorName[0]}
                          </div>
                          <span className="truncate max-w-[100px] font-medium">{creatorName}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(page.updatedAt)}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </DashboardWidget>
      </div>
    </PageTransition>
  );
}