"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Download, MessageCircle } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { PROFILE } from "@/data/social";

function useTypewriter(words: string[]) {
  const [text, setText] = useState("");
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setText(words[0]); return; }
    let w = 0, i = 0, del = false, timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const word = words[w];
      i += del ? -1 : 1;
      setText(word.slice(0, i));
      let wait = del ? 35 : 70;
      if (!del && i === word.length) { del = true; wait = 1600; }
      else if (del && i === 0) { del = false; w = (w + 1) % words.length; wait = 400; }
      timer = setTimeout(tick, wait);
    };
    tick();
    return () => clearTimeout(timer);
  }, [words]);
  return text;
}

export function Hero() {
  const { t } = useLang();
  const typed = useTypewriter(t.hero.roles);

  return (
    <section id="home" className="relative flex min-h-screen items-center overflow-hidden pb-16 pt-28">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-20 h-96 w-96 animate-float rounded-full bg-brand2/20 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-[28rem] w-[28rem] animate-float rounded-full bg-accent/20 blur-3xl [animation-delay:2s]" />
        <div className="absolute inset-0 opacity-[0.35] [background-image:radial-gradient(rgb(var(--line))_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      </div>

      <div className="container-x grid items-center gap-12 md:grid-cols-[1.15fr_0.85fr]">
        <div className="order-2 md:order-1">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-medium text-muted">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" /></span>
            {t.hero.available}
          </motion.span>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-display text-5xl font-bold leading-[1.05] text-brand sm:text-6xl lg:text-7xl">
            {t.hero.hello} <span className="bg-gradient-to-r from-brand2 to-accent bg-clip-text text-transparent">Davi</span>
            <span className="ml-2 inline-block origin-[70%_70%] animate-wave" aria-hidden>👋</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mt-5 h-9 font-display text-xl font-medium text-ink sm:text-2xl" aria-live="off">
            {typed}<span className="ml-0.5 inline-block h-6 w-0.5 translate-y-1 animate-blink bg-accent" />
          </motion.p>

          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
            {t.hero.tagline}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mt-8 flex flex-wrap gap-3">
            <a href="#projects" className="btn-primary">{t.hero.seeProjects} <ArrowDown size={16} /></a>
            <a href={PROFILE.resume} download className="btn-ghost"><Download size={16} /> {t.hero.resume}</a>
            <a href="#contact" className="btn-ghost"><MessageCircle size={16} /> {t.hero.talk}</a>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.7 }} className="order-1 mx-auto w-64 sm:w-80 md:order-2 md:w-full md:max-w-sm">
          <div className="relative animate-float">
            <div className="absolute -inset-3 rotate-3 rounded-[2rem] bg-gradient-to-br from-brand2 to-accent opacity-60 blur-sm" />
            <div className="absolute -inset-3 -rotate-3 rounded-[2rem] border-2 border-dashed border-brand2/40" />
            <Image src="/images/davi.jpg" alt="Foto de Davi Zicker sorrindo, de camisa preta e blazer" width={310} height={372} priority className="relative aspect-[5/6] w-full rounded-[1.75rem] bg-white object-cover object-top shadow-2xl" />
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1, type: "spring" }} className="absolute -bottom-4 -left-4 rounded-2xl bg-warm px-4 py-2 font-display text-sm font-bold text-[#3a2300] shadow-lg">BH · MG 📍</motion.span>
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2, type: "spring" }} className="absolute -right-3 top-6 rounded-2xl bg-surface px-3 py-2 text-sm font-semibold text-brand shadow-lg dark:text-ink">PUC Minas 🎓</motion.span>
          </div>
        </motion.div>
      </div>

      <a href="#about" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs text-muted md:flex" aria-label={t.hero.scroll}>
        {t.hero.scroll}
        <span className="grid h-8 w-5 place-items-start justify-center rounded-full border border-muted/50 pt-1.5"><span className="h-1.5 w-1 animate-bounce rounded-full bg-muted" /></span>
      </a>
    </section>
  );
}
