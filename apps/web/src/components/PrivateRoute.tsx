import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";

export default function PrivateRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--bg-app)] overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--accent-color)] rounded-full blur-[100px] opacity-20 animate-pulse" />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col items-center gap-8"
        >
          <motion.div 
            animate={{ 
              boxShadow: ["0 0 0 rgba(255,106,0,0)", "0 0 40px rgba(255,106,0,0.5)", "0 0 0 rgba(255,106,0,0)"] 
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-color)] to-[#ff8c38] flex items-center justify-center text-white text-2xl font-black border border-white/20 shadow-2xl"
          >
            P
          </motion.div>

          <div className="flex flex-col items-center gap-3">
            <span className="text-[var(--text-primary)] font-black tracking-[0.2em] uppercase text-xs">
              Carregando...
            </span>
            
            <div className="w-32 h-1 bg-[var(--border-color)] rounded-full overflow-hidden relative">
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                className="absolute top-0 bottom-0 left-0 w-full bg-[var(--accent-color)] rounded-full"
              />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
}