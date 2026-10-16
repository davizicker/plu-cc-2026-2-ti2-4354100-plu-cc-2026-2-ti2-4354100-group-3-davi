"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Check, ExternalLink, X } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { useLang } from "@/context/LanguageContext";
import { projects } from "@/data/projects";
import type { Project } from "@/types";
import { SectionTitle } from "@/components/shared/SectionTitle";

export function Projects() {
  const { t, lang } = useLang();
  const p = t.projects;
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<Project | null>(null);
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 25 });

  const techs = useMemo(() => Array.from(new Set(projects.flatMap((x) => x.technologies))), []);
  const list = useMemo(() => [...projects].sort((a, b) => a.year - b.year).filter((x) => filter === "all" || x.technologies.includes(filter)), [filter]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <section id="projects" className="bg-surface/50 py-24">
      <div className="container-x">
        <SectionTitle kicker={p.kicker} title={p.title} subtitle={p.subtitle} />

        <div className="mb-12 flex flex-wrap gap-2" role="group" aria-label="Filtro">
          {["all", ...techs].map((x) => (
            <button key={x} onClick={() => setFilter(x)} aria-pressed={filter === x}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${filter === x ? "bg-brand text-bg dark:bg-accent dark:text-[#04101f]" : "border border-line bg-surface text-muted hover:border-brand2"}`}>
              {x === "all" ? p.all : x}
            </button>
          ))}
        </div>

        <ol ref={ref} className="relative">
          <span aria-hidden className="absolute bottom-0 left-4 top-0 w-0.5 bg-line md:left-1/2 md:-translate-x-1/2" />
          <motion.span aria-hidden style={{ scaleY }} className="absolute bottom-0 left-4 top-0 w-0.5 origin-top bg-gradient-to-b from-brand2 to-accent md:left-1/2 md:-translate-x-1/2" />
          <AnimatePresence mode="popLayout">
            {list.map((proj, i) => {
              const right = i % 2 === 1;
              return (
                <motion.li layout key={proj.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.55 }}
                  className={`relative mb-12 pl-12 md:w-1/2 md:pl-0 ${right ? "md:ml-auto md:pl-12" : "md:pr-12"}`}>
                  <span className={`absolute left-4 top-6 z-10 grid h-9 w-9 -translate-x-1/2 place-items-center rounded-full border-4 border-bg bg-brand2 text-[10px] font-bold text-white md:left-auto ${right ? "md:-left-0 md:-translate-x-1/2" : "md:right-0 md:translate-x-1/2"}`}>
                    {String(proj.year).slice(2)}
                  </span>
                  <article className="card group overflow-hidden transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
                    <button onClick={() => setOpen(proj)} className="relative block aspect-[16/10] w-full overflow-hidden bg-line" aria-label={`${p.details}: ${proj.name}`}>
                      <Image src={proj.media} alt={`Tela do projeto ${proj.name}`} fill sizes="(min-width:768px) 40vw, 90vw" className="object-cover object-top transition duration-500 group-hover:scale-105" unoptimized={/\.(svg|gif)$/.test(proj.media)} />
                      <span className="absolute inset-0 grid place-items-center bg-brand/60 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">{p.details}</span>
                    </button>
                    <div className="p-5">
                      <p className="text-xs font-bold text-accent">{proj.year}</p>
                      <h3 className="mt-1 font-display text-xl font-bold text-brand">{proj.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">{proj.description[lang]}</p>
                      <div className="mt-4 flex flex-wrap gap-1.5">{proj.technologies.map((x) => <span key={x} className="chip">{x}</span>)}</div>
                      <a href={proj.repoUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand2 hover:underline dark:text-accent"><FaGithub /> {p.repo}</a>
                    </div>
                  </article>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setOpen(null)} role="dialog" aria-modal="true" aria-label={open.name}>
            <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }} onClick={(e) => e.stopPropagation()} className="card max-h-[90vh] w-full max-w-2xl overflow-y-auto">
              <div className="relative aspect-[16/9] bg-line">
                <Image src={open.media} alt={`Tela do projeto ${open.name}`} fill sizes="672px" className="object-cover object-top" />
                <button onClick={() => setOpen(null)} aria-label={p.close} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white transition hover:bg-black"><X size={18} /></button>
              </div>
              <div className="p-6">
                <p className="text-xs font-bold text-accent">{open.year}</p>
                <h3 className="font-display text-2xl font-bold text-brand">{open.name}</h3>
                <p className="mt-3 text-muted">{open.description[lang]}</p>
                {open.highlights && (
                  <ul className="mt-4 space-y-2 text-sm text-muted">
                    {open.highlights.map((h) => <li key={h.pt} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-accent" />{h[lang]}</li>)}
                  </ul>
                )}
                <h4 className="mb-2 mt-5 text-sm font-bold">{p.tech}</h4>
                <div className="flex flex-wrap gap-1.5">{open.technologies.map((x) => <span key={x} className="chip">{x}</span>)}</div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href={open.repoUrl} target="_blank" rel="noopener noreferrer" className="btn-primary"><FaGithub /> {p.repo}</a>
                  {open.extraLinks?.map((l) => <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="btn-ghost"><FaGithub /> {l.label}</a>)}
                  {open.liveUrl && <a href={open.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost"><ExternalLink size={16} /> {p.live}</a>}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
