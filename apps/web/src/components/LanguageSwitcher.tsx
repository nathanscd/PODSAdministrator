import { useLang } from "../contexts/LangContext";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  className?: string;
}

export default function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { lang, setLang } = useLang();
  const { setLanguage } = useAuth();

  const languages = [
    { id: "pt", label: "Português - Brasileiro", code: "01", flag: "🇧🇷" },
    { id: "en", label: "English - United States", code: "02", flag: "🇺🇸" },
    { id: "cn", label: "中文 - 中国", code: "03", flag: "🇨🇳" },
    { id: "es", label: "Español - España", code: "04", flag: "🇪🇸" },
  ] as const;

  const currentIndex = languages.findIndex((l) => l.id === lang);
  const nextIndex = (currentIndex + 1) % languages.length;
  const currentLang = languages[currentIndex];
  const nextLang = languages[nextIndex];

  const handleToggle = async () => {
    setLang(nextLang.id as "pt" | "en" | "cn" | "es");
    await setLanguage(nextLang.id as "pt" | "en" | "cn" | "es");
  };

  return (
    <a
      onClick={handleToggle}
      className={`group relative flex items-center gap-4 px-5 py-2 transition-all duration-500 skew-x-[-12deg] border border-[var(--border-color)] hover:border-[var(--accent-color)] bg-transparent overflow-hidden cursor-pointer ${className}`}
      
    >
      <div className="absolute inset-0 bg-[var(--accent-color)] translate-y-[102%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] pointer-events-none" />

      <div className="relative z-10 flex items-center gap-3 skew-x-[12deg]">
        <div className="relative flex items-center justify-center">
          <Globe
            size={13}
            className="text-[var(--accent-color)] group-hover:text-white transition-colors duration-300"
          />
          <motion.div
            animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-[var(--accent-color)] rounded-full -z-10 group-hover:bg-white"
          />
        </div>

        <div className="flex flex-col items-start leading-none border-l border-[var(--border-color)] group-hover:border-white/20 pl-3 transition-colors">
          <span className="font-mono text-[7px] text-[var(--text-secondary)] group-hover:text-white/60 tracking-[0.2em] uppercase mb-0.5">
            CH_{currentLang.code}
          </span>

          <AnimatePresence mode="wait">
            <motion.div
              key={lang}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -5, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5"
            >
              <span className="text-lg">{currentLang.flag}</span>
              <span className="text-[10px] font-black tracking-[0.25em] text-[var(--text-primary)] uppercase group-hover:text-white tracking-widest transition-colors">
                {currentLang.label}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-0.5 ml-1">
          {languages.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                backgroundColor:
                  i === currentIndex
                    ? "var(--accent-color)"
                    : "var(--border-color)",
                scale: i === currentIndex ? 1.1 : 1,
              }}
              transition={{ duration: 0.3 }}
              className="w-1 h-1 group-hover:bg-white/40 rounded-full transition-all duration-300"
            />
          ))}
        </div>
      </div>
    </a>
  );
}
