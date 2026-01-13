import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, History, CheckCircle2, AlertCircle, Info, Clock, User, ArrowRight } from "lucide-react";

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
            className="relative w-full max-w-xl bg-gradient-to-b from-[var(--card-bg)] to-[var(--bg-app)] border border-white/10 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent-color)] to-transparent opacity-50" />
            
            <div className="p-10 flex items-start justify-between">
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
            </div>

            <div className="px-10 pb-10 max-h-[65vh] overflow-y-auto custom-scrollbar">
              {children}
            </div>

            <div className="px-10 py-6 bg-black/20 border-t border-white/5 flex justify-end">
              <button 
                onClick={onClose}
                className="px-8 py-3 bg-white/5 hover:bg-white/10 text-[var(--text-primary)] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
              >
                Fechar Painel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export const NotificationsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const notifications = [
    { id: 1, title: "Backup do Sistema", desc: "Sincronização com Azure Storage finalizada com sucesso.", time: "2 horas atrás", type: "success" },
    { id: 2, title: "Segurança", desc: "Nova chave de API gerada para o ambiente de produção.", time: "5 horas atrás", type: "warning" },
    { id: 3, title: "Atualização", desc: "Versão 2.4.0 disponível. Verifique o changelog.", time: "Ontem", type: "info" },
  ];

  const getTheme = (type: string) => {
    switch(type) {
      case 'success': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'warning': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Alertas" 
      subtitle="Centro de Mensagens"
      icon={<Bell size={24}/>}
    >
      <div className="space-y-4">
        {notifications.map((n) => (
          <div key={n.id} className="group relative p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] flex gap-5 hover:bg-white/[0.05] transition-all duration-500">
            <div className={`shrink-0 w-2 h-2 rounded-full mt-2 shadow-[0_0_12px_currentColor] ${getTheme(n.type)}`} />
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-bold text-[var(--text-primary)]">{n.title}</span>
                <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">{n.time}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] opacity-60 leading-relaxed font-medium">{n.desc}</p>
            </div>
            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all text-[var(--accent-color)] -translate-x-4 group-hover:translate-x-0" />
          </div>
        ))}
      </div>
    </BaseModal>
  );
};

export const LogsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const logs = [
    { id: 1, user: "Nathanael", action: "Exportou PDF", target: "Relatório Mensal", time: "14:20", date: "Hoje" },
    { id: 2, user: "Sistema", action: "Auto-limpeza", target: "Cache de Imagens", time: "04:00", date: "Hoje" },
    { id: 3, user: "Admin", action: "Aprovou Acesso", target: "Ligia Taniguchi", time: "18:45", date: "Ontem" },
  ];

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Atividade" 
      subtitle="Logs de Transação"
      icon={<History size={24}/>}
    >
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-[var(--accent-color)]/20 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/5 group-hover:border-[var(--accent-color)]/30 group-hover:text-[var(--accent-color)] transition-all">
                <Clock size={16} />
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
              <p className="text-[10px] font-black text-[var(--text-primary)] tracking-widest">{log.time}</p>
              <p className="text-[8px] font-black uppercase text-[var(--accent-color)] opacity-40 tracking-[0.2em]">{log.date}</p>
            </div>
          </div>
        ))}
      </div>
    </BaseModal>
  );
};