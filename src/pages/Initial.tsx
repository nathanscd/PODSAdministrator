import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { usePages } from "../hooks/usePages";
import { 
  ArrowRight, Users, Filter, Plus, Bell, Activity, 
  FileSearch, Upload, Database, AlertCircle, CheckCircle2, Search, TrendingUp
} from "lucide-react";
import PageTransition from "../components/PageTransition";

export default function Initial() {
  const navigate = useNavigate();
  const { pages, isAdmin, userDisplayName, createPage } = usePages();
  const [searchQuery, setSearchQuery] = useState("");
  
  const [goals, setGoals] = useState<any[]>([]);
  const today = new Date().toISOString().split('T')[0];

  return (
    <PageTransition>
      <div className="main ml-10 -mr-10 -mt-10 !p-0 bg-[var(--bg-app)] min-h-screen relative overflow-x-hidden custom-scrollbar">
        
        <nav className="sticky top-0 z-50 bg-[var(--bg-app)]/80 backdrop-blur-md border-b border-[var(--border-color)] px-8 lg:px-20 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 bg-[var(--card-bg)] px-4 py-2 rounded-2xl border border-[var(--border-color)] w-full max-w-xl">
            <Search size={16} className="text-[var(--text-secondary)] opacity-40" />
            <input 
              type="text" 
              placeholder="BUSCAR ARQUIVOS, COMPARAÇÕES, LOGS..." 
              className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest w-full text-[var(--text-primary)]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-[var(--text-primary)] border-none bg-transparent shadow-none">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--bg-app)]" />
            </button>
          </div>
        </nav>

        <section className="pt-12 pb-12 px-8 lg:px-20">
          <div className="mb-12">
             <h1 className="text-6xl font-black italic uppercase tracking-tighter text-[var(--text-primary)] leading-none">
               PODS <span className="text-[var(--accent-color)]">Administrator</span>
             </h1>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)] mt-2">Operação em Tempo Real</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { label: "Arquivos Processados", val: "842", trend: "+12%", icon: <Database />, color: "text-blue-500" },
              { label: "Comparações Realizadas", val: "156", trend: "+5%", icon: <FileSearch />, color: "text-[var(--accent-color)]" },
              { label: "Usuários Ativos", val: "12", trend: "Estável", icon: <Users />, color: "text-green-500" },
              { label: "Divergências Críticas", val: "03", trend: "-2%", icon: <AlertCircle />, color: "text-red-500" },
            ].map((stat, i) => (
              <div key={i} className="bg-[var(--card-bg)] p-6 rounded-[2.5rem] border border-[var(--border-color)] group hover:border-[var(--accent-color)] transition-all">
                <div className="flex justify-between items-start mb-4">
                   <div className={`${stat.color} p-3 bg-[var(--bg-app)] rounded-2xl`}>{stat.icon}</div>
                   <span className="text-[8px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-full">{stat.trend}</span>
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40">{stat.label}</p>
                <p className="text-3xl font-black text-[var(--text-primary)]">{stat.val}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
            {[
              { label: "Upload Excel", path: "/planilhas", icon: <Upload size={18} />, color: "bg-green-500" },
              { label: "SharePoint", path: "https://hexing.sharepoint.com", icon: <Database size={18} />, color: "bg-blue-600" },
              { label: "Criar Board", path: "/todo", icon: <Plus size={18} />, color: "bg-[var(--accent-color)]" },
              { label: "Comparar PDF", path: "/comparador-pdf", icon: <FileSearch size={18} />, color: "bg-red-500" },
            ].map((btn, i) => (
              <button 
                key={i} 
                onClick={() => {
                  if (btn.path.startsWith("http")) {
                    window.open(btn.path, "_blank", "noopener,noreferrer");
                  } else {
                    navigate(btn.path);
                  }
                }}
                className="flex items-center gap-4 p-5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl hover:scale-[1.02] transition-all group border-none shadow-none"
              >
                <div className={`${btn.color} p-3 rounded-2xl text-white group-hover:rotate-12 transition-transform`}>
                  {btn.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]">
                  {btn.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* DASHBOARD GRID */}
        <section className="px-8 lg:px-20 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* COLUNA ESQUERDA: METAS E PRODUTIVIDADE */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* METAS DIÁRIAS */}
            <div className="bg-[var(--card-bg)] p-10 rounded-[3rem] border border-[var(--border-color)]">
               <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-black italic uppercase text-[var(--text-primary)] tracking-tighter">Metas do Dia</h3>
                    <p className="text-[9px] font-black opacity-30 uppercase tracking-widest">{today}</p>
                  </div>
                  <button className="p-2 bg-[var(--accent-color)] text-white rounded-full border-none shadow-none"><Plus size={16}/></button>
               </div>
               <div className="space-y-3">
                  {["Concluir comparação de ativos TI", "Revisar logs do SharePoint", "Atualizar board de infra"].map((goal, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-color)] group">
                       <div className="w-5 h-5 rounded-full border-2 border-[var(--accent-color)] flex items-center justify-center cursor-pointer group-hover:bg-[var(--accent-color)]/20">
                          <CheckCircle2 size={12} className="opacity-0 group-hover:opacity-100 text-[var(--accent-color)]" />
                       </div>
                       <span className="text-xs font-bold text-[var(--text-primary)]">{goal}</span>
                    </div>
                  ))}
               </div>
            </div>

            {/* GRÁFICO DE CARGA (SIMULADO) */}
            <div className="bg-[var(--card-bg)] p-10 rounded-[3rem] border border-[var(--border-color)]">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-black italic uppercase text-[var(--text-primary)] tracking-tighter">Volume de Trabalho</h3>
                  <TrendingUp className="text-green-500" size={20} />
               </div>
               <div className="flex items-end gap-3 h-40">
                  {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                    <div key={i} className="flex-1 bg-[var(--accent-color)]/10 rounded-t-xl relative group">
                       <div 
                         style={{ height: `${h}%` }} 
                         className="absolute bottom-0 w-full bg-[var(--accent-color)] rounded-t-xl group-hover:brightness-125 transition-all"
                       />
                    </div>
                  ))}
               </div>
               <div className="flex justify-between mt-4 text-[8px] font-black uppercase opacity-30">
                  <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sab</span><span>Dom</span>
               </div>
            </div>
          </div>

          {/* COLUNA DIREITA: FEED E STATUS INTEGRAÇÕES */}
          <div className="lg:col-span-4 space-y-10">
            
            {/* STATUS INTEGRAÇÕES */}
            <div className="bg-[var(--card-bg)] p-8 rounded-[2.5rem] border border-[var(--border-color)]">
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 opacity-40">Integrações</h3>
              <div className="space-y-4">
                {[
                  { name: "SharePoint", status: "OK", color: "bg-green-500" },
                  { name: "Notion API", status: "ATENÇÃO", color: "bg-orange-500" },
                  { name: "Azure Storage", status: "OK", color: "bg-green-500" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[var(--text-primary)]">{item.name}</span>
                    <span className={`${item.color} text-white text-[8px] font-black px-2 py-0.5 rounded-full`}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ATIVIDADE RECENTE */}
            <div className="bg-[var(--card-bg)] p-8 rounded-[2.5rem] border border-[var(--border-color)]">
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 opacity-40">Atividade</h3>
              <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-[var(--border-color)]">
                {[
                  { user: "Nathanael", action: "Processou PDF", time: "12m atrás" },
                  { user: "Admin", action: "Criou Novo Board", time: "45m atrás" },
                  { user: "Sistema", action: "Backup Concluído", time: "1h atrás" },
                ].map((act, i) => (
                  <div key={i} className="relative pl-6">
                    <div className="absolute left-[5px] top-1.5 w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full" />
                    <p className="text-[10px] font-bold text-[var(--text-primary)] leading-tight">{act.user} <span className="opacity-50 font-medium">{act.action}</span></p>
                    <p className="text-[8px] opacity-30 font-black uppercase mt-1">{act.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}