"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { pt, type Dict } from "@/i18n/pt";
import { en } from "@/i18n/en";
import type { Lang } from "@/types";

interface Ctx { lang: Lang; t: Dict; setLang: (l: Lang) => void; toggle: () => void }
const LanguageContext = createContext<Ctx | null>(null);
const dicts: Record<Lang, Dict> = { pt, en };

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang") as Lang | null;
      if (saved === "pt" || saved === "en") setLangState(saved);
      else if (navigator.language.toLowerCase().startsWith("en")) setLangState("en");
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
    document.title = dicts[lang].meta.title;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("lang", l); } catch {}
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, t: dicts[lang], setLang, toggle: () => setLang(lang === "pt" ? "en" : "pt") }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const c = useContext(LanguageContext);
  if (!c) throw new Error("useLang must be used within LanguageProvider");
  return c;
}
