import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import en from "../locales/en.json";
import pt from "../locales/pt.json";
import cn from "../locales/cn.json";
import es from "../locales/es.json";

const langs: any = { en, pt, cn, es };

interface LangContextType {
  lang: string;
  t: any;
  setLang: (lang: any) => void;
  toggleLang: () => void;
}

const LangContext = createContext<LangContextType | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const { language: authLang } = useAuth();
  const langOrder = ["pt", "en", "cn", "es"];
  const [lang, setLang] = useState("pt");

  useEffect(() => {
    if (authLang && langs[authLang]) {
      setLang(authLang);
    }
  }, [authLang]);

  const t = useMemo(() => langs[lang] || langs["pt"], [lang]);

  function toggleLang() {
    const currentIndex = langOrder.indexOf(lang);
    const nextIndex = (currentIndex + 1) % langOrder.length;
    setLang(langOrder[nextIndex]);
  }

  return (
    <LangContext.Provider value={{ lang, t, setLang, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => {
  const context = useContext(LangContext);
  if (!context) throw new Error("useLang error");
  return context;
};