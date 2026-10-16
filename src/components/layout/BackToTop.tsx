"use client";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

export function BackToTop() {
  const [show, setShow] = useState(false);
  const { t } = useLang();
  useEffect(() => {
    const on = () => setShow(window.scrollY > 700);
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <a href="#home" aria-label={t.footer.top} className={`fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-lg border border-accent/50 bg-surface text-accent shadow-lg hover:shadow-[0_0_18px_rgb(var(--accent)/0.5)] transition duration-300 hover:-translate-y-1  ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}>
      <ArrowUp size={20} />
    </a>
  );
}
