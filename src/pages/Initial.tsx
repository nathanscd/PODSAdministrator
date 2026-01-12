import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { usePages } from "../hooks/usePages";
import { 
  ArrowRight, Users, 
  Filter, Plus, Bell, Activity 
} from "lucide-react";
import PageTransition from "../components/PageTransition";

export default function Initial() {
  const navigate = useNavigate();
  const { pages, isAdmin, userDisplayName, createPage } = usePages();
  const [filterOwner, setFilterOwner] = useState<string>("all");

  const filteredPages = useMemo(() => {
    if (filterOwner === "all") return pages.slice(0, 6);
    return pages.filter(p => p.ownerId === filterOwner).slice(0, 6);
  }, [pages, filterOwner]);

  // Lista única de membros para o filtro do Admin
  const teamMembers = useMemo(() => {
    const members = pages.map(p => ({ id: p.ownerId, name: (p as any).ownerName || "Membro" }));
    return Array.from(new Map(members.map(m => [m.id, m])).values());
  }, [pages]);

  return (
    <PageTransition>
      <div className="main ml-10 -mr-10 -mt-10 !p-0 bg-[var(--bg-app)] min-h-screen relative overflow-x-hidden custom-scrollbar">
        
        {/* Glow Effects Base */}
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[var(--accent-color)] opacity-[0.03] blur-[150px] rounded-full" />

        {/* Hero Section */}
        <section className="pt-24 pb-12 px-8 lg:px-20 relative z-10">
          <div className="flex justify-between items-start mb-16">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center gap-3 text-[var(--accent-color)] mb-4">
                <div className="h-[1px] w-8 bg-[var(--accent-color)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">V1 - Alpha</span>
              </div>
              <h1 className="text-7xl lg:text-9xl font-black italic uppercase tracking-tighter text-[var(--text-primary)] leading-[0.8] mb-6">
                PODS <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-orange-400">administrator</span>
              </h1>
              <p className="text-[var(--text-secondary)] text-lg opacity-60 max-w-md font-medium">
                Conectado como <span className="text-[var(--text-primary)]">{userDisplayName}</span>. 
                {isAdmin && <span className="ml-2 px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] rounded-full border border-red-500/20">ADMIN</span>}
              </p>
            </motion.div>

            <div className="flex gap-3">
              <button className="p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-all">
                <Bell size={20} />
              </button>
              <button onClick={() => createPage("Novo Documento", "document")} className="p-4 bg-[var(--accent-color)] text-white rounded-2xl shadow-xl shadow-orange-500/20 hover:scale-105 transition-all">
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Widgets de Status da Equipe */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {[
              { label: "Ativos Monitorados", val: "1,284", icon: <Activity size={18} />, color: "text-blue-400" },
              { label: "Membros Ativos", val: teamMembers.length.toString(), icon: <Users size={18} />, color: "text-green-400" },
              { label: "Alertas Pendentes", val: "3", icon: <Bell size={18} />, color: "text-red-400" },
            ].map((stat, i) => (
              <div key={i} className="bg-[var(--card-bg)] p-6 rounded-[2rem] border border-[var(--border-color)] flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40 mb-1">{stat.label}</p>
                  <p className="text-2xl font-black text-[var(--text-primary)]">{stat.val}</p>
                </div>
                <div className={`${stat.color} opacity-80`}>{stat.icon}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Workspaces & Admin Filters */}
        <section className="px-8 lg:px-20 pb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">Workspaces</h2>
              <p className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest mt-2 opacity-40">Projetos e documentações compartilhadas</p>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-4 bg-[var(--card-bg)] p-2 rounded-2xl border border-[var(--border-color)]">
                <Filter size={14} className="ml-3 text-[var(--text-secondary)]" />
                <select 
                  value={filterOwner} 
                  onChange={(e) => setFilterOwner(e.target.value)}
                  className="bg-transparent border-none text-[var(--text-primary)] text-xs font-bold uppercase tracking-widest outline-none pr-8 cursor-pointer"
                >
                  <option value="all" className="bg-[var(--bg-app)]">Todos os Membros</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id} className="bg-[var(--bg-app)]">{member.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredPages.map((page) => (
                <motion.div 
                  key={page.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => navigate(page.type === 'board' ? `/todo/${page.id}` : `/page/${page.id}`)}
                  className="group bg-[var(--card-bg)] p-8 rounded-[2.5rem] border border-[var(--border-color)] hover:border-[var(--accent-color)] transition-all duration-500 cursor-pointer relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-8">
                    <span className="text-4xl transform group-hover:scale-110 transition-transform">
                      {page.type === 'board' ? '📊' : '📄'}
                    </span>
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-color)]">
                        {page.type === 'board' ? 'Kanban' : 'Doc'}
                      </p>
                      {isAdmin && (
                        <p className="text-[9px] font-bold text-[var(--text-secondary)] opacity-40 mt-1 uppercase">
                          Prop: {(page as any).ownerName || "Membro"}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <h4 className="font-bold text-[var(--text-primary)] text-xl mb-4 truncate group-hover:text-[var(--accent-color)] transition-colors">
                    {page.title || "Untitled Project"}
                  </h4>
                  
                  <div className="flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-black uppercase tracking-widest">Acessar</span>
                    <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <motion.div 
              onClick={() => navigate("/paginas")}
              className="border-2 border-dashed border-[var(--border-color)] p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 opacity-30 hover:opacity-100 hover:border-[var(--accent-color)] transition-all cursor-pointer group"
            >
              <div className="p-4 bg-[var(--card-bg)] rounded-full group-hover:bg-[var(--accent-color)] group-hover:text-white transition-all">
                <Plus />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">Ver Todas as Páginas</span>
            </motion.div>
          </motion.div>
        </section>

        {/* Footer Minimalista */}
        <footer className="py-12 px-8 lg:px-20 border-t border-[var(--border-color)] flex justify-between items-center opacity-20">
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">pods administrator v1 aplha</p>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
            <span>Status: Online</span>
            <span>V1.0.0</span>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}