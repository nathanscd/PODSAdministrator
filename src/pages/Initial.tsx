import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { usePages } from "../hooks/usePages";
import { useAuth } from "../contexts/AuthContext"; // Importe para saber quem cria
import { db } from "../firebase";
import { 
  collection, getCountFromServer, query, orderBy, limit, onSnapshot, 
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp, where 
} from "firebase/firestore";
import { 
  ArrowRight, Users, Plus, Bell, Activity, 
  FileSearch, Upload, Database, CheckCircle2, Search, TrendingUp, Trash2, X, Check,
  Clock, FileText, User, Shield, Zap
} from "lucide-react";
import PageTransition from "../components/PageTransition";
import { NotificationsModal, LogsModal } from "../components/Modals";
import { timeAgo, logAction } from "../utils/systemLogger";
import { sendNotification } from "../utils/notificationSystem";

export default function Initial() {
  const navigate = useNavigate();
  const { isAdmin, userDisplayName } = usePages();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  // --- GOALS COLETIVOS (FIRESTORE) ---
  const [goals, setGoals] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<{id: string, name: string}[]>([]);
  
  const [newGoalText, setNewGoalText] = useState("");
  const [selectedUserForGoal, setSelectedUserForGoal] = useState("");
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  // 1. Carregar Usuários para o Select
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (s) => {
      setUsersList(s.docs.map(d => ({ 
        id: d.id, 
        name: d.data().displayName || d.data().name || "Sem nome" 
      })));
    });
    return unsub;
  }, []);

  // 2. Carregar Metas em Tempo Real
  useEffect(() => {
    // Ordena por status (pendente primeiro) e depois por data
    const q = query(collection(db, "daily_goals"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Ordenação client-side para jogar completados para baixo
      const sorted = data.sort((a: any, b: any) => Number(a.completed) - Number(b.completed));
      setGoals(sorted);
    });
    return unsub;
  }, []);

  // Ações das Metas
  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;

    const assignedUser = usersList.find(u => u.id === selectedUserForGoal);

    try {
      await addDoc(collection(db, "daily_goals"), {
        text: newGoalText,
        completed: false,
        createdBy: user?.uid,
        createdByName: userDisplayName,
        assignedTo: selectedUserForGoal || null,
        assignedName: assignedUser?.name || null,
        createdAt: serverTimestamp()
      });

      // Notificação se atribuiu a alguém
      if (selectedUserForGoal && selectedUserForGoal !== user?.uid) {
         await sendNotification(
            selectedUserForGoal,
            "Nova Meta Diária",
            `${userDisplayName} adicionou uma meta rápida para você: "${newGoalText}"`,
            "assignment",
            "/" // Link para a home
         );
      }
      
      await logAction("Criou Meta", newGoalText);

      setNewGoalText("");
      setSelectedUserForGoal("");
      setIsAddingGoal(false);
    } catch (error) {
      console.error("Erro ao criar meta:", error);
    }
  };

  const toggleGoal = async (goal: any) => {
    const ref = doc(db, "daily_goals", goal.id);
    await updateDoc(ref, { completed: !goal.completed });
    if (!goal.completed) {
       await logAction("Concluiu Meta", goal.text);
    }
  };

  const deleteGoal = async (id: string, text: string) => {
    await deleteDoc(doc(db, "daily_goals", id));
    await logAction("Removeu Meta", text);
  };

  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  // --- ESTATÍSTICAS REAIS ---
  const [statsData, setStatsData] = useState({ opportunities: "...", users: "...", pages: "..." });

  useEffect(() => {
    async function fetchStats() {
      try {
        const oppSnap = await getCountFromServer(collection(db, "opportunities"));
        const userSnap = await getCountFromServer(collection(db, "users"));
        const pageSnap = await getCountFromServer(collection(db, "pages"));
        setStatsData({
            opportunities: oppSnap.data().count.toString(),
            users: userSnap.data().count.toString(),
            pages: pageSnap.data().count.toString()
        });
      } catch (error) {
        console.error(error);
      }
    }
    fetchStats();
  }, []);

  // --- TIMELINE AUTOMÁTICA ---
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "system_logs"), orderBy("createdAt", "desc"), limit(4));
    const unsub = onSnapshot(q, (snapshot) => {
        setRecentLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const getLogIcon = (action: string) => {
      const lower = action.toLowerCase();
      if (lower.includes("login") || lower.includes("acesso")) return <User size={10} />;
      if (lower.includes("meta") || lower.includes("tarefa")) return <CheckCircle2 size={10} />;
      if (lower.includes("coluna")) return <Activity size={10} />;
      if (lower.includes("página") || lower.includes("page")) return <FileText size={10} />;
      if (lower.includes("exclui")) return <Trash2 size={10} />;
      return <Shield size={10} />;
  };

  const stats = [
    { label: "Opportunities", val: statsData.opportunities, trend: "Active", icon: <Database size={20} />, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Pages", val: statsData.pages, trend: "On Going", icon: <FileSearch size={20} />, color: "text-[var(--accent-color)]", bg: "bg-[var(--accent-color)]/10" },
    { label: "Total Users", val: statsData.users, trend: "Registred", icon: <Users size={20} />, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "System Status", val: "100%", trend: "Operational", icon: <Activity size={20} />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <PageTransition>
      <div className="main !p-0 bg-[var(--bg-app)] min-h-screen relative overflow-x-hidden custom-scrollbar selection:bg-[var(--accent-color)] selection:text-white">
        
        {/* NAVBAR */}
        <nav className="sticky top-0 z-50 bg-[var(--bg-app)]/60 backdrop-blur-xl border-b border-[var(--border-color)] px-8 lg:px-20 py-4 flex items-center justify-between transition-all duration-300">
          <div className="flex items-center gap-4 bg-[var(--card-bg)] px-5 py-2.5 rounded-2xl border border-[var(--border-color)] w-full max-w-xl focus-within:border-[var(--accent-color)] focus-within:ring-1 focus-within:ring-[var(--accent-color)]/20 transition-all shadow-sm">
            <Search size={16} className="text-[var(--text-secondary)] opacity-40" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-widest w-full text-[var(--text-primary)] placeholder:opacity-30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2.5 text-[var(--text-primary)] border border-[var(--border-color)] bg-[var(--card-bg)] rounded-xl shadow-sm hover:border-[var(--accent-color)] transition-colors"
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--bg-app)] animate-pulse" />
            </motion.button>
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-tighter text-[var(--text-primary)]">{userDisplayName || "Usuário"}</span>
              <span className="text-[8px] font-bold uppercase text-[var(--accent-color)] opacity-70">{isAdmin ? "Administrador" : "Membro"}</span>
            </div>
          </div>
        </nav>

        <section className="pt-16 pb-12 px-8 lg:px-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-14">
             <h1 className="text-7xl font-black italic uppercase tracking-tighter text-[var(--text-primary)] leading-none flex flex-wrap items-baseline gap-x-4">
               PODS <span className="text-[var(--accent-color)] drop-shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]">Administrator</span>
             </h1>
             <div className="flex items-center gap-3 mt-4">
               <div className="h-[1px] w-12 bg-[var(--accent-color)] opacity-50" />
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)] opacity-60">v1.2.0 Beta</p>
             </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-14">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[var(--card-bg)] p-7 rounded-[2.5rem] border border-[var(--border-color)] group hover:border-[var(--accent-color)]/50 hover:shadow-xl hover:shadow-[var(--accent-color)]/5 transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--accent-color)]/5 rounded-full blur-3xl group-hover:bg-[var(--accent-color)]/10 transition-all" />
                <div className="flex justify-between items-start mb-6 relative z-10">
                   <div className={`${stat.color} p-3.5 ${stat.bg} rounded-2xl group-hover:scale-110 transition-transform duration-500`}>{stat.icon}</div>
                   {stat.trend && (
                     <span className={`text-[9px] font-black text-[var(--text-secondary)] bg-[var(--bg-app)] px-2.5 py-1 rounded-full border border-current/10`}>
                       {stat.trend}
                     </span>
                   )}
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40 mb-1">{stat.label}</p>
                <p className="text-4xl font-black text-[var(--text-primary)] tracking-tighter">{stat.val}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-24">
            {[
              { label: "Comparison", path: "/construction", icon: <Upload size={20} />, color: "bg-emerald-500", shadow: "shadow-emerald-500/20" },
              { label: "SharePoint", path: "https://hexingbrasil.sharepoint.com/sites/MSSD/TechSales", icon: <Database size={20} />, color: "bg-blue-600", shadow: "shadow-blue-600/20" },
              { label: "Task Boards", path: "/todo", icon: <Plus size={20} />, color: "bg-[var(--accent-color)]", shadow: "shadow-[var(--accent-rgb)]/20" },
              { label: "Changelog", path: "/changelog", icon: <FileSearch size={20} />, color: "bg-rose-500", shadow: "shadow-rose-500/20" },
            ].map((btn, i) => (
              <motion.button 
                key={i} 
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (btn.path.startsWith("http")) {
                    window.open(btn.path, "_blank", "noopener,noreferrer");
                  } else {
                    navigate(btn.path);
                  }
                }}
                className="flex items-center gap-5 p-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2rem] hover:border-transparent hover:shadow-2xl transition-all group relative overflow-hidden"
              >
                <div className={`${btn.color} p-4 rounded-2xl text-white group-hover:rotate-[15deg] transition-transform duration-500 shadow-lg ${btn.shadow}`}>
                  {btn.icon}
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-[var(--text-primary)] group-hover:text-[var(--accent-color)] transition-colors">
                  {btn.label}
                </span>
              </motion.button>
            ))}
          </div>
        </section>

        <section className="px-8 lg:px-20 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8 space-y-12">
            
            {/* --- LISTA DE TAREFAS COLETIVA --- */}
            <div className="bg-[var(--card-bg)] p-10 rounded-[3.5rem] border border-[var(--border-color)] shadow-sm hover:shadow-xl transition-shadow duration-500">
               <div className="flex justify-between items-center mb-10">
                 <div>
                   <h3 className="text-2xl font-black italic uppercase text-[var(--text-primary)] tracking-tighter">Daily Goals</h3>
                   <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                      <Zap size={10} className="text-[var(--accent-color)]"/> {today}
                   </p>
                 </div>
                 <motion.button 
                   whileHover={{ rotate: 90 }}
                   onClick={() => setIsAddingGoal(!isAddingGoal)}
                   className={`p-3 ${isAddingGoal ? 'bg-red-500' : 'bg-[var(--accent-color)]'} text-white rounded-full shadow-lg transition-colors`}
                 >
                   {isAddingGoal ? <X size={20}/> : <Plus size={20}/>}
                 </motion.button>
               </div>

               <AnimatePresence>
                 {isAddingGoal && (
                   <motion.form 
                     initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                     animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
                     exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                     onSubmit={addGoal}
                     className="overflow-hidden"
                   >
                     <div className="p-4 bg-[var(--bg-app)] rounded-[2rem] border border-[var(--accent-color)]/30 shadow-inner flex flex-col gap-3">
                       <input 
                         autoFocus
                         type="text" 
                         placeholder="Your task here..."
                         className="bg-transparent border-none outline-none w-full px-2 text-sm font-bold text-[var(--text-primary)] placeholder:opacity-40"
                         value={newGoalText}
                         onChange={(e) => setNewGoalText(e.target.value)}
                       />
                       <div className="flex items-center gap-2 border-t border-[var(--border-color)] pt-3">
                         <select 
                            value={selectedUserForGoal}
                            onChange={(e) => setSelectedUserForGoal(e.target.value)}
                            className="bg-transparent text-[10px] font-bold uppercase text-[var(--text-secondary)] outline-none cursor-pointer hover:text-[var(--accent-color)]"
                         >
                            <option value="">Para todos</option>
                            {usersList.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                         </select>
                         <div className="flex-1" />
                         <button type="submit" className="bg-[var(--accent-color)] text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-[var(--accent-color)]/20">
                            Publicar
                         </button>
                       </div>
                     </div>
                   </motion.form>
                 )}
               </AnimatePresence>

               <div className="space-y-3">
                  {goals.length === 0 ? (
                    <div className="py-12 text-center flex flex-col items-center justify-center opacity-30 gap-4">
                        <div className="w-16 h-16 rounded-full bg-[var(--accent-color)]/10 flex items-center justify-center">
                            <Check size={24} />
                        </div>
                        <span className="font-black uppercase tracking-widest text-xs">All done!</span>
                    </div>
                  ) : (
                    goals.map((goal) => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={goal.id} 
                        className={`relative flex items-center justify-between gap-4 p-5 rounded-3xl border transition-all group overflow-hidden ${
                            goal.completed 
                            ? 'bg-[var(--bg-app)]/30 border-transparent opacity-50' 
                            : 'bg-white/[0.03] border-white/5 hover:border-[var(--accent-color)]/30 hover:bg-white/[0.05]'
                        }`}
                      >
                          <div className="flex items-center gap-5 flex-1 min-w-0">
                            <div 
                              onClick={() => toggleGoal(goal)}
                              className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                                  goal.completed 
                                  ? 'bg-green-500 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' 
                                  : 'border-[var(--text-secondary)]/30 hover:border-[var(--accent-color)]'
                              }`}
                            >
                               <Check size={12} className={`stroke-[4px] ${goal.completed ? 'text-white' : 'opacity-0'}`} />
                            </div>
                            
                            <div className="flex flex-col">
                                <span className={`text-sm font-bold transition-all truncate ${goal.completed ? 'line-through text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
                                    {goal.text}
                                </span>
                                {goal.assignedName && (
                                    <span className="text-[9px] font-black uppercase tracking-wider text-[var(--accent-color)] flex items-center gap-1 mt-0.5">
                                        <User size={8} /> {goal.assignedName}
                                    </span>
                                )}
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => deleteGoal(goal.id, goal.text)}
                            className="p-2 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded-xl transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                      </motion.div>
                    ))
                  )}
               </div>
            </div>

            {/* CHART (Visual) */}
            <div className="bg-[var(--card-bg)] p-10 rounded-[3.5rem] border border-[var(--border-color)] shadow-sm">
               <div className="flex justify-between items-center mb-12">
                 <div>
                   <h3 className="text-2xl font-black italic uppercase text-[var(--text-primary)] tracking-tighter">Performance</h3>
                   <p className="text-[9px] font-black opacity-30 uppercase tracking-widest mt-1">Status Global</p>
                 </div>
                 <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full">
                   <TrendingUp size={16} />
                   <span className="text-[10px] font-black">Estável</span>
                 </div>
               </div>
               <div className="flex items-end gap-4 h-48 px-2">
                 {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                   <div key={i} className="flex-1 bg-[var(--accent-color)]/5 rounded-2xl relative group h-full">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 1, delay: i * 0.1, ease: "circOut" }}
                        className="absolute bottom-0 w-full bg-gradient-to-t from-[var(--accent-color)] to-[var(--accent-color)]/70 rounded-2xl group-hover:brightness-125 transition-all shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]"
                      />
                   </div>
                 ))}
               </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-12">
            
            {/* STATUS SISTEMA */}
            <div className="bg-[var(--card-bg)] p-9 rounded-[3rem] border border-[var(--border-color)] shadow-sm">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-8 opacity-40 flex items-center gap-2">
                <Activity size={14} className="text-[var(--accent-color)]" />
                Systems
              </h3>
              <div className="space-y-5">
                {[
                  { name: "SharePoint", status: "Operational", color: "text-green-500", dot: "bg-green-500" },
                  { name: "Comparison", status: "Construction", color: "text-orange-500", dot: "bg-orange-500" },
                  { name: "Firebase", status: "Connected", color: "text-green-500", dot: "bg-green-500" },
                  { name: "Auth", status: "Secure", color: "text-green-500", dot: "bg-green-500" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-[var(--bg-app)]/40 rounded-2xl border border-[var(--border-color)]/50">
                    <span className="text-[11px] font-bold text-[var(--text-primary)]">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-black uppercase ${item.color}`}>{item.status}</span>
                      <span className={`w-1.5 h-1.5 ${item.dot} rounded-full shadow-[0_0_8px_currentColor]`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TIMELINE */}
            <div className="bg-[var(--card-bg)] p-9 rounded-[3rem] border border-[var(--border-color)] shadow-sm">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-8 opacity-40 flex items-center gap-2">
                 <Clock size={14} className="text-[var(--accent-color)]"/> Recents
              </h3>
              
              <div className="space-y-8 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-[var(--accent-color)]/50 before:to-transparent">
                {recentLogs.length === 0 ? (
                    <div className="pl-10 py-4 opacity-40 text-[10px] uppercase font-bold">Nothing here.</div>
                ) : (
                    recentLogs.map((log) => (
                        <div key={log.id} className="relative pl-10 group">
                            <div className="absolute left-0 top-1 w-5 h-5 bg-[var(--bg-app)] border-2 border-[var(--accent-color)] rounded-full z-10 flex items-center justify-center text-[var(--accent-color)] group-hover:bg-[var(--accent-color)] group-hover:text-white transition-all duration-300">
                              {getLogIcon(log.action)}
                            </div>
                            <p className="text-[11px] font-bold text-[var(--text-primary)] leading-tight">
                              {log.user} <span className="opacity-40 font-medium truncate block max-w-[150px]">{log.action}</span>
                            </p>
                            <p className="text-[9px] opacity-30 font-black uppercase mt-1.5 tracking-tighter">
                                {timeAgo(log.createdAt)}
                            </p>
                        </div>
                    ))
                )}
              </div>
              
              <button 
                onClick={() => setIsLogsOpen(true)}
                className="w-full mt-8 py-3 text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors border-t border-[var(--border-color)] pt-6"
              >
                See history
              </button>
            </div>

          </div>
        </section>

        <NotificationsModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
        <LogsModal isOpen={isLogsOpen} onClose={() => setIsLogsOpen(false)} />
      </div>
    </PageTransition>
  );
}