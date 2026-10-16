"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, CalendarDays, Calendar, GraduationCap, GitBranch, Laptop, ChevronDown } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { experiences } from "@/data/experiences";
import type { ExperienceType } from "@/types";
import { SectionTitle } from "@/components/shared/SectionTitle";

const icons: Record<ExperienceType, typeof Briefcase> = { academico: GraduationCap, estagio: Briefcase, freela: Laptop, opensource: GitBranch, evento: CalendarDays };

export function Experiences() {
  const { t, lang } = useLang();
  const e = t.experiences;
  const [filter, setFilter] = useState<"all" | ExperienceType>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const types = Array.from(new Set(experiences.map((x) => x.type)));
  const list = experiences.filter((x) => filter === "all" || x.type === filter);

  return (
    <section id="experiences" className="py-24">
      <div className="container-x">
        <SectionTitle kicker={e.kicker} title={e.title} subtitle={e.subtitle} />
        <div className="mb-10 flex flex-wrap gap-2">
          {(["all", ...types] as const).map((x) => (
            <button key={x} onClick={() => setFilter(x)} aria-pressed={filter === x}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${filter === x ? "bg-brand text-bg dark:bg-accent dark:text-[#04101f]" : "border border-line bg-surface text-muted hover:border-brand2"}`}>
              {x === "all" ? e.all : e.types[x]}
            </button>
          ))}
        </div>

        <motion.ul layout className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((x) => {
              const Icon = icons[x.type];
              const isOpen = openId === x.id;
              return (
                <motion.li layout key={x.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="card flex flex-col p-6 transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand2 dark:bg-accent/15 dark:text-accent"><Icon size={20} /></span>
                    <span className="chip">{e.types[x.type]}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-brand">{x.institution}</h3>
                  <p className="font-medium">{x.role[lang]}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted"><Calendar size={13} /> {x.period[lang]}</p>
                  <p className={`mt-3 text-sm leading-relaxed text-muted ${isOpen ? "" : "line-clamp-2"}`}>{x.description[lang]}</p>
                  <button onClick={() => setOpenId(isOpen ? null : x.id)} aria-expanded={isOpen} className="mt-auto flex items-center gap-1 pt-4 text-sm font-semibold text-brand2 dark:text-accent">
                    {isOpen ? e.less : e.more} <ChevronDown size={16} className={`transition ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      </div>
    </section>
  );
}
