"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useLang } from "@/context/LanguageContext";
import { useScrollSpy } from "@/hooks/useScrollSpy";

const ids = ["home", "about", "projects", "experiences", "contact"] as const;

export function Header() {
  const { t, lang, toggle } = useLang();
  const { resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const active = useScrollSpy([...ids]);

  useEffect(() => {
    setMounted(true);
    const on = () => setScrolled(window.scrollY > 20);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const labels: Record<(typeof ids)[number], string> = { home: t.nav.home, about: t.nav.about, projects: t.nav.projects, experiences: t.nav.experiences, contact: t.nav.contact };
  const dark = resolvedTheme === "dark";

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-line bg-bg/75 py-2 backdrop-blur-xl" : "py-4"}`}>
      <div className="container-x flex items-center justify-between">
        <a href="#home" className="group flex items-center gap-2 font-display text-lg font-bold text-ink" aria-label="Davi Zicker">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-accent/60 bg-surface font-mono text-sm text-accent transition group-hover:shadow-[0_0_14px_rgb(var(--accent)/0.5)]">DZ</span>
          <span className="hidden sm:inline">Davi Zicker</span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {ids.map((id) => (
            <a key={id} href={`#${id}`} className={`relative rounded-md px-4 py-2 text-sm font-medium transition ${active === id ? "text-accent" : "text-muted hover:text-ink"}`}>
              {active === id && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-md bg-accent/10" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              {labels[id]}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={toggle} aria-label={t.lang} className="grid h-10 min-w-10 place-items-center rounded-lg border border-line bg-surface px-3 text-xs font-bold transition hover:border-brand2">
            {lang === "pt" ? "EN" : "PT"}
          </button>
          <button onClick={() => setTheme(dark ? "light" : "dark")} aria-label={t.theme} className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-surface transition hover:border-brand2">
            {mounted && (dark ? <Sun size={17} /> : <Moon size={17} />)}
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-surface md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="container-x md:hidden">
            <div className="card mt-3 flex flex-col p-2">
              {ids.map((id) => (
                <a key={id} href={`#${id}`} onClick={() => setOpen(false)} className={`rounded-xl px-4 py-3 font-medium ${active === id ? "bg-accent/10 text-accent" : "text-muted"}`}>
                  {labels[id]}
                </a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
