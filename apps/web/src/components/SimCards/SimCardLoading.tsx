import { motion } from "framer-motion";
import { WifiZero, WifiLow, WifiHigh } from "lucide-react";

interface SimCardLoadingProps {
  title?: string;
  subtitle?: string;
}

const signalTransition = {
  duration: 2.1,
  ease: "linear" as const,
  repeat: Infinity,
  times: [0, 0.25, 0.32, 0.57, 0.64, 0.89, 1],
};

export function SimCardLoading({
  title = "Buscando chips disponíveis...",
  subtitle = "Sincronizando inventário e informações de conectividade.",
}: SimCardLoadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-20 px-6 rounded-[2rem] border border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-xl"
      role="status"
      aria-live="polite"
    >
      {/* Animação de busca de sinal */}
      <div className="relative mb-3 flex h-24 w-24 items-center justify-center">

        {/* Base do ícone */}
        <div className="relative flex h-16 w-16 items-center justify-center">
          {/* Sinal inexistente */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              opacity: [1, 1, 0, 0, 0, 0, 1],
              scale: [1, 1, 0.9, 0.9, 0.9, 0.9, 1],
            }}
            transition={signalTransition}
          >
            <WifiZero
              size={34}
              strokeWidth={1.8}
              className="text-[var(--text-primary)]"
            />
          </motion.div>

          {/* Sinal fraco */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              opacity: [0, 0, 1, 1, 0, 0, 0],
              scale: [0.9, 0.9, 1, 1, 0.9, 0.9, 0.9],
            }}
            transition={signalTransition}
          >
            <WifiLow
              size={34}
              strokeWidth={1.8}
              className="text-[var(--text-primary)]"
            />
          </motion.div>

          {/* Sinal forte */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              opacity: [0, 0, 0, 0, 1, 1, 0],
              scale: [0.9, 0.9, 0.9, 0.9, 1.08, 1.08, 0.9],
            }}
            transition={signalTransition}
          >
            <WifiHigh
              size={34}
              strokeWidth={1.8}
              className="text-[var(--text-primary)]"
            />
          </motion.div>
        </div>
      </div>

      {/* Textos originais */}
      <motion.p
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{
          duration: 2.1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="text-lg font-black text-[var(--text-primary)] tracking-tight m-0 text-center"
      >
        {title}
      </motion.p>

      <p className="text-sm text-[var(--text-secondary)] opacity-75 mt-2 mb-0 text-center max-w-md">
        {subtitle}
      </p>
    </motion.div>
  );
}