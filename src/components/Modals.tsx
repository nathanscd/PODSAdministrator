import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Bell, History, CheckCircle2, AlertCircle, Info, 
  Clock, User, ArrowRight, Rocket 
} from "lucide-react";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import { timeAgo } from "../utils/systemLogger";

// --- BASE MODAL (Estrutura Visual) ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const BaseModal = ({ isOpen, onClose, title, subtitle, icon, children }: ModalProps) => {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[8px]"
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl bg-gradient-to-b from-[var(--card-bg)] to-[var(--bg-app)] border border-white/10 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Top Gradient Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent-color)] to-transparent opacity-50" />
            
            {/* Header */}
            <div className="p-10 flex items-start justify-between shrink-0">
              <div className="flex gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-[var(--accent-color)] blur-2xl opacity-20" />
                  <div className="relative p-4 bg-white/5 border border-white/10 rounded-2xl text-[var(--accent-color)] shadow-inner">
                    {icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-[var(--text-primary)] leading-none">
                    {title}
                  </h3>
                  {subtitle && (
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-color)] mt-2 opacity-70">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full text-[var(--text-secondary)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="px-10 pb-10 overflow-y-auto custom-scrollbar flex-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

// --- NOTIFICATIONS MODAL ---
export const NotificationsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen || !auth.currentUser) return;

    // 1. Busca Notificações Pessoais (Tarefas atribuídas, alertas, etc)
    const qNotifs = query(
      collection(db, "notifications"), 
      where("recipientId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc"), 
      limit(10)
    );

    // 2. Busca Última Versão do Sistema (Para avisar de updates)
    const qVersions = query(collection(db, "app_versions"), orderBy("releaseDate", "desc"), limit(1));

    // Listener principal
    const unsubNotifs = onSnapshot(qNotifs, (sNotifs) => {
      const personalNotifs = sNotifs.docs.map(d => ({ 
        id: d.id, 
        ...d.data(), 
        origin: 'personal' 
      }));
      
      // Listener secundário (nested para garantir merge correto no estado)
      onSnapshot(qVersions, (sVers) => {
        const systemNotifs = sVers.docs.map(d => ({ 
          id: d.id, 
          title: `Nova Versão v${d.data().version}`,
          description: "O sistema foi atualizado. Clique para ver as novidades.",
          type: 'version',
          link: '/changelog',
          createdAt: d.data().releaseDate, 
          origin: 'system'
        }));

        // Combina: Versão do sistema primeiro (fixada), depois as pessoais
        const combined = [...systemNotifs, ...personalNotifs]; 
        setItems(combined);
      });
    });

    return () => unsubNotifs();
  }, [isOpen]);

  const handleClick = (item: any) => {
    onClose();
    if (item.link) {
        navigate(item.link);
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'assignment': return <User size={18} className="text-blue-400" />;
      case 'version': return <Rocket size={18} className="text-green-400" />;
      default: return <AlertCircle size={18} className="text-amber-400" />;
    }
  };

  const getBorderColor = (type: string) => {
     if (type === 'version') return 'hover:border-green-500/50 hover:bg-green-500/5';
     if (type === 'assignment') return 'hover:border-blue-500/50 hover:bg-blue-500/5';
     return 'hover:border-white/20';
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Notificações" 
      subtitle="Central de Alertas"
      icon={<Bell size={24}/>}
    >
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="text-center py-10 opacity-30">
             <Bell size={40} className="mx-auto mb-2 opacity-50"/>
             <p className="text-xs font-bold uppercase">Tudo limpo por aqui</p>
          </div>
        )}

        {items.map((item) => (
          <div 
            key={item.id} 
            onClick={() => handleClick(item)}
            className={`cursor-pointer p-5 bg-white/[0.02] border border-white/5 rounded-3xl flex gap-4 transition-all duration-300 group ${getBorderColor(item.type)}`}
          >
            {/* Ícone Indicador */}
            <div className="shrink-0 mt-1">
               <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
                 {getIcon(item.type)}
               </div>
            </div>

            <div className="flex-1 min-w-0">
               <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] truncate pr-2">
                    {item.title}
                  </h4>
                  {item.createdAt && (
                    <span className="text-[9px] font-black opacity-30 uppercase tracking-widest whitespace-nowrap">
                      {item.origin === 'system' ? 'Novo' : timeAgo(item.createdAt)}
                    </span>
                  )}
               </div>
               
               <p className="text-xs text-[var(--text-secondary)] opacity-70 mt-1 leading-relaxed line-clamp-2">
                 {item.description}
               </p>
               
               {item.type === 'assignment' && (
                 <p className="text-[9px] mt-2 font-black uppercase tracking-wider text-[var(--accent-color)] opacity-60 group-hover:opacity-100 transition-opacity">
                   Ver Tarefa →
                 </p>
               )}
            </div>
          </div>
        ))}
      </div>
    </BaseModal>
  );
};

// --- LOGS MODAL ---
export const LogsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    // Busca os últimos 20 logs do sistema
    const q = query(collection(db, "system_logs"), orderBy("createdAt", "desc"), limit(20));
    const unsub = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [isOpen]);

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Atividade" 
      subtitle="Logs do Sistema"
      icon={<History size={24}/>}
    >
      <div className="space-y-3">
        {logs.length === 0 && (
            <div className="text-center py-10 opacity-30">
                <History size={40} className="mx-auto mb-2 opacity-50"/>
                <p className="text-xs font-bold uppercase">Nenhuma atividade recente</p>
            </div>
        )}

        {logs.map((log) => (
          <div key={log.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-[var(--accent-color)]/20 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 transition-all
                 ${log.type === 'system' ? 'bg-amber-500/10 text-amber-500' : 'bg-black/40 text-[var(--text-secondary)]'}
              `}>
                {log.type === 'system' ? <AlertCircle size={16} /> : <Clock size={16} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <User size={10} className="text-[var(--accent-color)]" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">{log.user}</span>
                  <span className="text-[10px] text-[var(--text-secondary)] opacity-40">•</span>
                  <span className="text-[10px] font-medium text-[var(--text-secondary)] opacity-70 italic">{log.action}</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-tighter opacity-30 mt-1">{log.target}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-[var(--text-primary)] tracking-widest">{timeAgo(log.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </BaseModal>
  );
};