import React, { createContext, useContext, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { toast as sonnerToast, Toaster } from "sonner";

type ToastType = "success" | "error" | "info";

interface ToastContextData {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const icon = 
      type === "success" ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> :
      type === "error" ? <AlertCircle size={16} className="text-rose-500 shrink-0" /> :
      <Info size={16} className="text-blue-500 shrink-0" />;

    sonnerToast(message, {
      icon,
      className: "ios-toast",
    });
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {typeof document !== "undefined" && createPortal(
        <Toaster
          position="top-center"
          expand={false}
          toastOptions={{
            classNames: {
              toast: "group relative flex items-center gap-3 w-[360px] mx-auto px-4 py-3.5 rounded-[24px] bg-background/75 backdrop-blur-2xl border border-border/40 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] text-foreground font-sans transition-all duration-300",
              description: "text-xs font-semibold tracking-tight text-foreground/90 leading-snug",
              actionButton: "bg-primary text-primary-foreground font-semibold rounded-full text-xs",
            },
          }}
        />,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);