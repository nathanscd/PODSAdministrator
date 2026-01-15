import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Bell, History, CheckCircle2, AlertCircle, Info, 
  Clock, User, ArrowRight, Rocket, Check 
} from "lucide-react";
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { timeAgo } from "../utils/systemLogger";
import { useAuth } from "../contexts/AuthContext";

// --- BASE MODAL ---
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[8px]"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl bg-gradient-to-b from-[var(--card-bg)] to-[var(--bg-app)] border border-white/10 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent-color)] to-transparent opacity-50" />
            
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
  const { user } = useAuth();
  const [personalNotifs, setPersonalNotifs] = useState<any[]>([]);
  const [systemNotifs, setSystemNotifs] = useState<any[]>([]);

  // Effect 1: Notificações Pessoais (COM FILTRO DE NÃO LIDAS)
  useEffect(() => {
    if (!isOpen || !user) return;

    const qNotifs = query(
      collection(db, "notifications"), 
      where("recipientId", "==", user.uid),
      where("read", "==", false), // <--- FILTRO ADICIONADO: Só busca as não lidas
      orderBy("createdAt", "desc"), 
      limit(20)
    );

    const unsub = onSnapshot(qNotifs, (snapshot) => {
      setPersonalNotifs(snapshot.docs.map(d => ({ 
        id: d.id, 
        ...d.data(), 
        origin: 'personal' 
      })));
    }, (error) => {
       console.error("Erro nas notificações:", error);
       // Se der erro de índice, o console do navegador mostrará o link para criar
    });

    return () => unsub();
  }, [isOpen, user]);

  // Effect 2: Notificações do Sistema
  useEffect(() => {
    if (!isOpen) return;
    const qVersions = query(collection(db, "app_versions"), orderBy("releaseDate", "desc"), limit(1));
    const unsub = onSnapshot(qVersions, (snapshot) => {
      setSystemNotifs(snapshot.docs.map(d => ({ 
        id: d.id, 
        title: `Nova Versão v${d.data().version}`,
        description: "O sistema foi atualizado. Clique para ver as novidades.",
        type: 'version',
        link: '/changelog',
        createdAt: d.data().releaseDate, 
        origin: 'system'
      })));
    });
    return () => unsub();
  }, [isOpen]);

  const items = [...systemNotifs, ...personalNotifs];

  // Ação de Clique no Card (Navegação)
  const handleClick = (item: any) => {
    onClose();
    if (item.link) navigate(item.link);
  };

  // Ação de Marcar como Lida
  const markAsRead = async (e: React.MouseEvent, notifId: string) => {
    e.stopPropagation(); // Impede que o clique no botão dispare a navegação do card
    try {
        const notifRef = doc(db, "notifications", notifId);
        await updateDoc(notifRef, { read: true });
        // O onSnapshot removerá o item da lista automaticamente
    } catch (error) {
        console.error("Erro ao marcar como lida:", error);
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
            className={`relative cursor-pointer p-5 bg-white/[0.02] border border-white/5 rounded-3xl flex gap-4 transition-all duration-300 group ${getBorderColor(item.type)}`}
          >
            <div className="shrink-0 mt-1">
               <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
                 {getIcon(item.type)}
               </div>
            </div>

            <div className="flex-1 min-w-0 pr-8">
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

            {/* Botão de Marcar como Lida (Só aparece para notificações pessoais) */}
            {item.origin === 'personal' && (
                <button 
                    onClick={(e) => markAsRead(e, item.id)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 hover:text-green-500 hover:border-green-500 transition-all z-10"
                    title="Marcar como lida"
                >
                    <Check size={14} />
                </button>
            )}
          </div>
        ))}
      </div>
    </BaseModal>
  );
};

// --- LOGS MODAL (Mantido igual) ---
export const LogsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;
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