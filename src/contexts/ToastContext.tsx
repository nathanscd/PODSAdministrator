import React, { createContext, useContext, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextData {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now().toString();
    setToasts((state) => [...state, { id, message, type }]);
    setTimeout(() => setToasts((state) => state.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((state) => state.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {typeof document !== "undefined" && createPortal(
        <div className="fixed bottom-8 right-8 z-[99999] flex flex-col gap-3 pointer-events-none">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                layout
                className={`min-w-[320px] p-4 rounded-2xl border backdrop-blur-md shadow-2xl flex items-center gap-3 pointer-events-auto cursor-pointer transition-all ${
                  toast.type === "success" ? "bg-[#0a0a0a]/90 border-green-500/30 text-green-400" :
                  toast.type === "error" ? "bg-[#0a0a0a]/90 border-red-500/30 text-red-400" :
                  "bg-[#0a0a0a]/90 border-blue-500/30 text-blue-400"
                }`}
                onClick={() => removeToast(toast.id)}
              >
                <div className={`p-2 rounded-full bg-white/5 border border-white/5`}>
                   {toast.type === "success" && <CheckCircle2 size={16} />}
                   {toast.type === "error" && <AlertCircle size={16} />}
                   {toast.type === "info" && <Info size={16} />}
                </div>
                <div className="flex flex-col flex-1">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Sistema</span>
                    <span className="text-xs font-bold leading-tight">{toast.message}</span>
                </div>
                <button className="opacity-50 hover:opacity-100 p-1"><X size={14}/></button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);