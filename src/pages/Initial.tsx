import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { usePages } from "../hooks/usePages";
import { 
  ArrowRight, Users, Filter, Plus, Bell, Activity, 
  FileSearch, Upload, Database, AlertCircle, CheckCircle2, Search, TrendingUp, Trash2, X, Edit3, Check
} from "lucide-react";
import PageTransition from "../components/PageTransition";
import { NotificationsModal, LogsModal } from "../components/Modals";


export default function Initial() {
  const navigate = useNavigate();
  const { pages, isAdmin, userDisplayName, createPage } = usePages();
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  const [goals, setGoals] = useState<{id: string, text: string, completed: boolean}[]>(() => {
    const saved = localStorage.getItem("user_goals");
    return saved ? JSON.parse(saved) : [
      { id: "1", text: "Concluir comparação de ativos TI", completed: false },
      { id: "2", text: "Revisar logs do SharePoint", completed: true },
      { id: "3", text: "Atualizar board de infra", completed: false }
    ];
  });
  
  const [newGoal, setNewGoal] = useState("");
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    localStorage.setItem("user_goals", JSON.stringify(goals));
  }, [goals]);

  const toggleGoal = (id: string) => {
    setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const addGoal = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newGoal.trim()) {
      setGoals([...goals, { id: Date.now().toString(), text: newGoal, completed: false }]);
      setNewGoal("");
      setIsAddingGoal(false);
    }
  };

  const startEditing = (e: React.MouseEvent, id: string, text: string) => {
    e.stopPropagation();
    setEditingGoalId(id);
    setEditingText(text);
  };

  const saveEdit = (e?: React.FormEvent | React.FocusEvent) => {
    e?.preventDefault();
    if (editingGoalId) {
      if (editingText.trim()) {
        setGoals(goals.map(g => g.id === editingGoalId ? { ...g, text: editingText } : g));
      }
      setEditingGoalId(null);
      setEditingText("");
    }
  };

  const removeGoal = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setGoals(goals.filter(g => g.id !== id));
  };

  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const stats = [
    { label: "Oportunidades criadas", val: "24", trend: "+12%", icon: <Database size={20} />, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Comparações Realizadas", val: "12", trend: "+5%", icon: <FileSearch size={20} />, color: "text-[var(--accent-color)]", bg: "bg-[var(--accent-color)]/10" },
    { label: "Usuários Ativos", val: "8", trend: "Estável", icon: <Users size={20} />, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Divergências Críticas", val: "2", trend: "-10%", icon: <AlertCircle size={20} />, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  return (
    <PageTransition>
      <div className="main ml-10 -mr-10 -mt-10 !p-0 bg-[var(--bg-app)] min-h-screen relative overflow-x-hidden custom-scrollbar selection:bg-[var(--accent-color)] selection:text-white">
        
        <nav className="sticky top-0 z-50 bg-[var(--bg-app)]/60 backdrop-blur-xl border-b border-[var(--border-color)] px-8 lg:px-20 py-4 flex items-center justify-between transition-all duration-300">
          <div className="flex items-center gap-4 bg-[var(--card-bg)] px-5 py-2.5 rounded-2xl border border-[var(--border-color)] w-full max-w-xl focus-within:border-[var(--accent-color)] focus-within:ring-1 focus-within:ring-[var(--accent-color)]/20 transition-all shadow-sm">
            <Search size={16} className="text-[var(--text-secondary)] opacity-40" />
            <input 
              type="text" 
              placeholder="BUSCAR ARQUIVOS, COMPARAÇÕES, LOGS..." 
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
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-14"
          >
             <h1 className="text-7xl font-black italic uppercase tracking-tighter text-[var(--text-primary)] leading-none flex flex-wrap items-baseline gap-x-4">
               PODS <span className="text-[var(--accent-color)] drop-shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]">Administrator</span>
             </h1>
             <div className="flex items-center gap-3 mt-4">
               <div className="h-[1px] w-12 bg-[var(--accent-color)] opacity-50" />
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-secondary)] opacity-60">v1 alpha</p>
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
                     <span className={`text-[9px] font-black ${stat.trend.startsWith('-') ? 'text-red-500 bg-red-500/10' : 'text-green-500 bg-green-500/10'} px-2.5 py-1 rounded-full border border-current/10`}>
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
              { label: "Upload Excel", path: "/planilhas", icon: <Upload size={20} />, color: "bg-emerald-500", shadow: "shadow-emerald-500/20" },
              { label: "SharePoint", path: "https://hexingbrasil.sharepoint.com/sites/MSSD/TechSales", icon: <Database size={20} />, color: "bg-blue-600", shadow: "shadow-blue-600/20" },
              { label: "Criar Board", path: "/todo", icon: <Plus size={20} />, color: "bg-[var(--accent-color)]", shadow: "shadow-[var(--accent-rgb)]/20" },
              { label: "Comparar PDF", path: "/comparador-pdf", icon: <FileSearch size={20} />, color: "bg-rose-500", shadow: "shadow-rose-500/20" },
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
            
            <div className="bg-[var(--card-bg)] p-10 rounded-[3.5rem] border border-[var(--border-color)] shadow-sm hover:shadow-xl transition-shadow duration-500">
               <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-2xl font-black italic uppercase text-[var(--text-primary)] tracking-tighter">Metas do Dia</h3>
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mt-1">{today}</p>
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
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0 }}
                     onSubmit={addGoal}
                     className="mb-8 overflow-hidden"
                   >
                     <div className="flex gap-3 p-2 bg-[var(--bg-app)] rounded-2xl border border-[var(--accent-color)]/30">
                       <input 
                         autoFocus
                         type="text" 
                         placeholder="O que precisa ser feito hoje?"
                         className="bg-transparent border-none outline-none flex-1 px-4 text-sm font-bold text-[var(--text-primary)]"
                         value={newGoal}
                         onChange={(e) => setNewGoal(e.target.value)}
                       />
                       <button type="submit" className="bg-[var(--accent-color)] text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all">Adicionar</button>
                     </div>
                   </motion.form>
                 )}
               </AnimatePresence>

               <div className="space-y-4">
                  {goals.length === 0 ? (
                    <div className="py-10 text-center opacity-20 font-black uppercase tracking-widest text-xs">Nenhuma meta definida</div>
                  ) : (
                    goals.map((goal) => (
                      <motion.div 
                        layout
                        key={goal.id} 
                        className={`flex items-center justify-between gap-4 p-5 rounded-2xl border transition-all group ${goal.completed ? 'bg-[var(--bg-app)]/50 border-transparent opacity-60' : 'bg-[var(--bg-app)] border-[var(--border-color)] hover:border-[var(--accent-color)]/30'}`}
                      >
                         <div className="flex items-center gap-5 flex-1">
                           <div 
                             onClick={() => toggleGoal(goal.id)}
                             className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${goal.completed ? 'bg-green-500 border-green-500' : 'border-[var(--accent-color)] hover:bg-[var(--accent-color)]/10'}`}
                           >
                              <CheckCircle2 size={14} className={`${goal.completed ? 'text-white opacity-100' : 'opacity-0 text-[var(--accent-color)]'}`} />
                           </div>
                           
                           {editingGoalId === goal.id ? (
                             <form onSubmit={saveEdit} className="flex-1 flex gap-2">
                               <input 
                                 autoFocus
                                 className="bg-transparent border-b border-[var(--accent-color)] outline-none flex-1 text-sm font-bold text-[var(--text-primary)]"
                                 value={editingText}
                                 onChange={(e) => setEditingText(e.target.value)}
                                 onBlur={saveEdit}
                               />
                               <button type="submit" className="text-green-500"><Check size={16}/></button>
                             </form>
                           ) : (
                             <span className={`text-sm font-bold transition-all ${goal.completed ? 'line-through text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
                               {goal.text}
                             </span>
                           )}
                         </div>
                         
                         <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                           <button 
                             onClick={(e) => startEditing(e, goal.id, goal.text)}
                             className="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-app)] rounded-xl transition-all"
                           >
                             <Edit3 size={16} />
                           </button>
                           <button 
                             onClick={(e) => removeGoal(e, goal.id)}
                             className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                           >
                             <Trash2 size={16} />
                           </button>
                         </div>
                      </motion.div>
                    ))
                  )}
               </div>
            </div>

            <div className="bg-[var(--card-bg)] p-10 rounded-[3.5rem] border border-[var(--border-color)] shadow-sm">
               <div className="flex justify-between items-center mb-12">
                  <div>
                    <h3 className="text-2xl font-black italic uppercase text-[var(--text-primary)] tracking-tighter">Volume de Trabalho</h3>
                    <p className="text-[9px] font-black opacity-30 uppercase tracking-widest mt-1">Média Semanal: 65%</p>
                  </div>
                  <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full">
                    <TrendingUp size={16} />
                    <span className="text-[10px] font-black">+8.4%</span>
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
                       <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--text-primary)] text-[var(--bg-app)] text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                         {h}%
                       </div>
                    </div>
                  ))}
               </div>
               <div className="flex justify-between mt-6 px-2 text-[9px] font-black uppercase opacity-30 tracking-widest">
                  <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sab</span><span>Dom</span>
               </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-12">
            
            <div className="bg-[var(--card-bg)] p-9 rounded-[3rem] border border-[var(--border-color)] shadow-sm">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-8 opacity-40 flex items-center gap-2">
                <Activity size={14} className="text-[var(--accent-color)]" />
                Sistemas
              </h3>
              <div className="space-y-5">
                {[
                  { name: "SharePoint", status: "Operacional", color: "text-green-500", dot: "bg-green-500" },
                  { name: "Notion API", status: "Instável", color: "text-orange-500", dot: "bg-orange-500" },
                  { name: "Azure Storage", status: "Operacional", color: "text-green-500", dot: "bg-green-500" },
                  { name: "Auth Service", status: "Operacional", color: "text-green-500", dot: "bg-green-500" },
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

            <div className="bg-[var(--card-bg)] p-9 rounded-[3rem] border border-[var(--border-color)] shadow-sm">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-8 opacity-40">Timeline</h3>
              <div className="space-y-8 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-[var(--accent-color)]/50 before:to-transparent">
                {[
                  { user: "Nathanael", action: "Processou PDF", time: "12m atrás", icon: <FileSearch size={10}/> },
                  { user: "Admin", action: "Criou Novo Board", time: "45m atrás", icon: <Plus size={10}/> },
                  { user: "Sistema", action: "Backup Concluído", time: "1h atrás", icon: <Database size={10}/> },
                  { user: "Sistema", action: "Logs Limpos", time: "3h atrás", icon: <Trash2 size={10}/> },
                ].map((act, i) => (
                  <div key={i} className="relative pl-10 group">
                    <div className="absolute left-0 top-1 w-5 h-5 bg-[var(--bg-app)] border-2 border-[var(--accent-color)] rounded-full z-10 flex items-center justify-center text-[var(--accent-color)] group-hover:bg-[var(--accent-color)] group-hover:text-white transition-all duration-300">
                      {act.icon}
                    </div>
                    <p className="text-[11px] font-bold text-[var(--text-primary)] leading-tight">
                      {act.user} <span className="opacity-40 font-medium">{act.action}</span>
                    </p>
                    <p className="text-[9px] opacity-30 font-black uppercase mt-1.5 tracking-tighter">{act.time}</p>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setIsLogsOpen(true)}
                className="w-full mt-8 py-3 text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors border-t border-[var(--border-color)] pt-6"
              >
                Ver Todo Histórico
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
