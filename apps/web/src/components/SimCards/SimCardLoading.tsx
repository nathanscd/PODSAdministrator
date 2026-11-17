import { motion } from "framer-motion";
import { RadioTower } from "lucide-react";

interface SimCardLoadingProps {
  title?: string;
  subtitle?: string;
}

export function SimCardLoading({
  title = "Buscando chips disponíveis...",
  subtitle = "Sincronizando inventário e informações de conectividade.",
}: SimCardLoadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 rounded-[2rem] border border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-xl"
      role="status"
      aria-live="polite"
    >
      <div className="relative mb-7">
        <div className="absolute inset-0 rounded-full bg-[var(--accent-color)] blur-2xl opacity-20" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
          className="relative w-16 h-16 rounded-full border-2 border-[var(--border-color)] border-t-[var(--accent-color)] flex items-center justify-center"
        >
          <RadioTower size={22} className="text-[var(--accent-color)]" />
        </motion.div>
      </div>
      <p className="text-lg font-black text-[var(--text-primary)] tracking-tight m-0 text-center">{title}</p>
      <p className="text-sm text-[var(--text-secondary)] opacity-75 mt-2 mb-0 text-center max-w-md">{subtitle}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-10">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-32 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-app)]/60 animate-pulse"
          />
        ))}
      </div>
    </motion.div>
  );
}
