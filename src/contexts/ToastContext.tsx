import React, { createContext, useContext, useState, useCallback } from "react";
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
      <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              layout
              className={`min-w-[300px] p-4 rounded-2xl border backdrop-blur-md shadow-2xl flex items-center gap-3 ${
                toast.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-500" :
                toast.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-500" :
                "bg-blue-500/10 border-blue-500/20 text-blue-500"
              }`}
            >
              {toast.type === "success" && <CheckCircle2 size={20} />}
              {toast.type === "error" && <AlertCircle size={20} />}
              {toast.type === "info" && <Info size={20} />}
              <span className="text-xs font-bold uppercase tracking-wide flex-1">{toast.message}</span>
              <button onClick={() => removeToast(toast.id)} className="opacity-50 hover:opacity-100"><X size={14}/></button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);