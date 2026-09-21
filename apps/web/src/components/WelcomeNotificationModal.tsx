import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, ArrowRight, Sparkles, Database, Layers, Zap } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, query, where, limit, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

interface WelcomeNotificationModalProps {
  onOpenNotifications: () => void;
}

const CURRENT_VERSION = "1.2.6";

export default function WelcomeNotificationModal({ onOpenNotifications }: WelcomeNotificationModalProps) {
  const [showUpdate, setShowUpdate] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // 1. Verifica Atualizações (Prioridade Máxima)
  useEffect(() => {
    const lastSeenVersion = localStorage.getItem("lastSeenVersion");
    if (lastSeenVersion !== CURRENT_VERSION) {
      const timer = setTimeout(() => setShowUpdate(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // 2. Verifica Notificações (Prioridade Secundária)
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", user.uid),
      where("read", "==", false),
      limit(5)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const count = snapshot.docs.length;
      setUnreadCount(count);

      if (count > 0) {
        const today = new Date().toDateString();
        const lastShown = localStorage.getItem("lastNotificationPopupDate");

        if (lastShown !== today) {
          setShowNotification(true);
        }
      }
    });

    return () => unsub();
  }, [user]);

  // Controles de Fechamento e Navegação
  const handleCloseUpdate = () => {
    localStorage.setItem("lastSeenVersion", CURRENT_VERSION);
    setShowUpdate(false);
  };

  const handleGoToChangelog = () => {
    handleCloseUpdate();
    navigate("/changelog");
  };

  const handleCloseNotification = () => {
    localStorage.setItem("lastNotificationPopupDate", new Date().toDateString());
    setShowNotification(false);
  };

  const handleGoToNotifications = () => {
    handleCloseNotification();
    onOpenNotifications();
  };

  if (typeof document === "undefined") return null;

  const isAnyOpen = showUpdate || showNotification;

  return createPortal(
    <AnimatePresence>
      {isAnyOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6" data-lenis-prevent>
          {/* Fundo Desfocado (Compartilhado) */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => showUpdate ? handleCloseUpdate() : handleCloseNotification()}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <AnimatePresence mode="wait">
            {/* --- MODAL 1: ATUALIZAÇÃO DO SISTEMA --- */}
            {showUpdate && (
              <motion.div
                key="update-modal"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-md bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden font-sans z-10"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent-color)] to-purple-500" />
                
                <button
                  onClick={handleCloseUpdate}
                  className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-app)] p-1.5 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>

                <div className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--accent-color)]/10 text-[var(--accent-color)] flex items-center justify-center mb-6 shadow-inner">
                    <Sparkles size={32} />
                  </div>

                  <div className="inline-block px-3 py-1 rounded-full bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 text-[var(--accent-color)] text-[10px] font-black uppercase tracking-widest mb-4">
                    Version {CURRENT_VERSION}
                  </div>

                  <h2 className="text-2xl font-black text-[var(--text-primary)] mb-3 tracking-tight">
                   System Updated!
                  </h2>
                  
                  <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
                    I've got some exciting news for you! We've just rolled out a new update packed with features and improvements to make your experience even better. Here's a quick overview of what's new:
                  </p>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm font-bold text-[var(--text-primary)] bg-[var(--bg-app)] p-3 rounded-xl border border-[var(--border-color)]">
                      <Database size={16} className="text-purple-500" /> Integrated ETL Engine

                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-[var(--text-primary)] bg-[var(--bg-app)] p-3 rounded-xl border border-[var(--border-color)]">
                      <Layers size={16} className="text-emerald-500" /> Data Compare Tool
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-[var(--text-primary)] bg-[var(--bg-app)] p-3 rounded-xl border border-[var(--border-color)]">
                      <Zap size={16} className="text-blue-500" /> New Digital Testbook
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleGoToChangelog}
                      className="w-full bg-[var(--accent-color)] text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(255,106,0,0.3)] hover:-translate-y-0.5 transition-all"
                    >
                      View Update Notes <ArrowRight size={16} />
                    </button>
                    <button
                      onClick={handleCloseUpdate}
                      className="w-full bg-transparent text-[var(--text-secondary)] px-6 py-3 rounded-xl font-bold text-xs hover:text-[var(--text-primary)] transition-colors"
                    >
                      Ignore for now
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* --- MODAL 2: NOTIFICAÇÕES (APARECE SE NÃO HOUVER ATUALIZAÇÃO OU SE ELA FOR FECHADA) --- */}
            {!showUpdate && showNotification && (
              <motion.div
                key="notification-modal"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-sm bg-[var(--bg-app)] border border-[var(--border-color)] rounded-[2rem] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col items-center text-center p-8 z-10"
              >
                <button 
                  onClick={handleCloseNotification}
                  className="absolute top-4 right-4 p-2 bg-[var(--card-bg)] hover:bg-[var(--accent-color)] hover:text-white border border-[var(--border-color)] rounded-full text-[var(--text-secondary)] transition-all duration-300"
                >
                  <X size={16} strokeWidth={3} />
                </button>

                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-[var(--accent-color)] blur-xl opacity-30 rounded-full animate-pulse" />
                  <div className="relative flex items-center justify-center w-20 h-20 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-full text-[var(--accent-color)] shadow-lg">
                    <Bell size={36} strokeWidth={2.5} className="animate-bounce" style={{ animationDuration: '2s' }} />
                    <div className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full border-4 border-[var(--bg-app)] flex items-center justify-center">
                      <span className="text-white text-[10px] font-black">{unreadCount}</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-black tracking-tight text-[var(--text-primary)] mb-2">
                  Novidades para você!
                </h3>
                
                <p className="text-sm font-medium text-[var(--text-secondary)] opacity-80 mb-8 leading-relaxed">
                  Você tem novas notificações aguardando sua leitura. Fique por dentro das atualizações e tarefas.
                </p>

                <motion.button 
                  onClick={handleGoToNotifications}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-[var(--accent-color)] text-white px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(255,106,0,0.3)] hover:shadow-[0_12px_25px_rgba(255,106,0,0.4)] transition-all uppercase tracking-widest text-xs"
                >
                  <span>Ver notificações</span>
                  <ArrowRight size={16} strokeWidth={3} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}