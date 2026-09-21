import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Bell, History, AlertCircle, 
  Clock, User, Rocket, Check 
} from "lucide-react";
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { timeAgo } from "../utils/systemLogger";
import { useAuth } from "../contexts/AuthContext";

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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6" data-lenis-prevent>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-3xl bg-[var(--bg-app)] border border-[var(--border-color)] rounded-md shadow-[0_32px_80px_-16px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[85vh] before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none"
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--accent-color)] to-transparent opacity-60" />
            
            <div className="p-8 sm:p-10 flex items-start justify-between shrink-0 relative z-10">
              <div className="flex items-center gap-6">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-[var(--accent-color)] blur-xl opacity-20 rounded-full" />
                  <div className="relative flex items-center justify-center w-14 h-14 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl text-[var(--accent-color)] shadow-lg">
                    {icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] leading-none">
                    {title}
                  </h3>
                  {subtitle && (
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)] mt-2 opacity-80">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 bg-[var(--card-bg)] hover:bg-[var(--accent-color)] hover:text-white border border-[var(--border-color)] hover:border-[var(--accent-color)] rounded-xl text-[var(--text-secondary)] transition-all duration-300 shadow-sm"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="px-8 sm:px-10 pb-10 overflow-y-auto custom-scrollbar flex-1 relative z-10">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export const NotificationsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [personalNotifs, setPersonalNotifs] = useState<any[]>([]);
  const [systemNotifs, setSystemNotifs] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen || !user) return;

    const qNotifs = query(
      collection(db, "notifications"), 
      where("recipientId", "==", user.uid),
      where("read", "==", false), 
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
       console.error(error);
    });

    return () => unsub();
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen) return;
    const qVersions = query(collection(db, "app_versions"), orderBy("releaseDate", "desc"), limit(1));
    const unsub = onSnapshot(qVersions, (snapshot) => {
      setSystemNotifs(snapshot.docs.map(d => ({ 
        id: d.id, 
        title: `System Update v${d.data().version}`,
        description: "A new version of the system has been deployed. Click to see the changelog.",
        type: 'version',
        link: '/changelog',
        createdAt: d.data().releaseDate, 
        origin: 'system'
      })));
    });
    return () => unsub();
  }, [isOpen]);

  const items = [...systemNotifs, ...personalNotifs];

  const handleClick = (item: any) => {
    onClose();
    if (item.link) navigate(item.link);
  };

  const markAsRead = async (e: React.MouseEvent, notifId: string) => {
    e.stopPropagation(); 
    try {
        const notifRef = doc(db, "notifications", notifId);
        await updateDoc(notifRef, { read: true });
    } catch (error) {
        console.error(error);
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'assignment': return <User size={18} strokeWidth={2.5} className="text-blue-500" />;
      case 'version': return <Rocket size={18} strokeWidth={2.5} className="text-emerald-500" />;
      default: return <AlertCircle size={18} strokeWidth={2.5} className="text-amber-500" />;
    }
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Notifications" 
      subtitle="Alert Center"
      icon={<Bell size={28} strokeWidth={2.5}/>}
    >
      <div className="space-y-4" data-lenis-prevent> 
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-[var(--border-color)] rounded-sm bg-[var(--card-bg)]">
             <Bell size={48} strokeWidth={1.5} className="text-[var(--text-secondary)] opacity-40 mb-4"/>
             <p className="text-sm font-bold text-[var(--text-primary)] opacity-60">You're all caught up</p>
          </div>
        )}

        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              key={item.id} 
              onClick={() => handleClick(item)}
              className="relative cursor-pointer p-5 bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[var(--accent-color)] rounded-sm flex gap-5 transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)]"
            >
              <div className="shrink-0 mt-0.5">
                 <div className="w-10 h-10 rounded-sm bg-[var(--bg-app)] flex items-center justify-center border border-[var(--border-color)] shadow-sm group-hover:scale-110 transition-transform duration-300">
                   {getIcon(item.type)}
                 </div>
              </div>

              <div className="flex-1 min-w-0 pr-10">
                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
                    <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">
                      {item.title}
                    </h4>
                    {item.createdAt && (
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap opacity-60">
                        {item.origin === 'system' ? 'New' : timeAgo(item.createdAt)}
                      </span>
                    )}
                 </div>
                 
                 <p className="text-xs text-[var(--text-secondary)] opacity-80 mt-1.5 leading-relaxed line-clamp-2 font-medium">
                   {item.description}
                 </p>
              </div>

              {item.origin === 'personal' && (
                  <button 
                      onClick={(e) => markAsRead(e, item.id)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 hover:text-emerald-500 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all duration-300 z-10 shadow-sm"
                  >
                      <Check size={16} strokeWidth={3} />
                  </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </BaseModal>
  );
};

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
      title="Activity Log" 
      subtitle="System History"
      icon={<History size={28} strokeWidth={2.5}/>}
    >
      <div className="space-y-4">
        {logs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-[var(--border-color)] rounded-3xl bg-[var(--card-bg)]">
                <History size={48} strokeWidth={1.5} className="text-[var(--text-secondary)] opacity-40 mb-4"/>
                <p className="text-sm font-bold text-[var(--text-primary)] opacity-60">No recent activity</p>
            </div>
        )}

        <AnimatePresence>
          {logs.map((log, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              key={log.id} 
              className="p-5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-[var(--accent-color)] transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-[var(--border-color)] bg-[var(--bg-app)] shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  {log.type === 'system' ? <AlertCircle size={18} className="text-amber-500" strokeWidth={2.5}/> : <Clock size={18} className="text-[var(--accent-color)]" strokeWidth={2.5}/>}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-[var(--text-primary)]">{log.user}</span>
                    <span className="text-[10px] text-[var(--text-secondary)] opacity-40">•</span>
                    <span className="text-xs font-semibold text-[var(--text-secondary)]">{log.action}</span>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-color)] opacity-80">{log.target}</p>
                </div>
              </div>
              <div className="text-left sm:text-right shrink-0 pl-14 sm:pl-0">
                <p className="text-[11px] font-black text-[var(--text-secondary)] tracking-widest uppercase opacity-70 bg-[var(--bg-app)] border border-[var(--border-color)] px-3 py-1.5 rounded-lg inline-block">
                  {timeAgo(log.createdAt)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </BaseModal>
  );
};