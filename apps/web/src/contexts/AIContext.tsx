import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AIContextType {
  isOpen: boolean;
  toggleAI: () => void;
  openAI: () => void;
  closeAI: () => void;
}

const AIContext = createContext<AIContextType>({} as AIContextType);

export function AIProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAI = () => setIsOpen(prev => !prev);
  const openAI = () => setIsOpen(true);
  const closeAI = () => setIsOpen(false);

  // Atalho: Ctrl + Espaço para abrir
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === "Space") {
        e.preventDefault();
        toggleAI();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <AIContext.Provider value={{ isOpen, toggleAI, openAI, closeAI }}>
      {children}
    </AIContext.Provider>
  );
}

export const useAI = () => useContext(AIContext);