"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, GraduationCap, Target } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { education, skills } from "@/data/skills";
import { Reveal } from "@/components/shared/Reveal";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { SkillBar } from "@/components/shared/SkillBar";
import { TiltCard } from "@/components/shared/TiltCard";

export function About() {
  const { t, lang } = useLang();
  const a = t.about;
  const groups = ["dev", "office", "design"] as const;
  const [group, setGroup] = useState<(typeof groups)[number]>("dev");

  return (
    <section id="about" className="py-24">
      <div className="container-x">
        <SectionTitle kicker={a.kicker} title={a.title} />

        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div key={lang} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="space-y-4 text-lg leading-relaxed text-muted">
                <p>{a.p1}</p>
                <p>{a.p2}</p>
              </motion.div>
            </AnimatePresence>

            <Reveal>
              <div className="card hud flex gap-4 border-l-4 border-l-accent p-6">
                <Target className="mt-1 shrink-0 text-accent" />
                <div><h3 className="font-display text-lg font-bold text-ink">{a.goalTitle}</h3><p className="mt-1 text-muted">{a.goal}</p></div>
              </div>
            </Reveal>

            <Reveal className="grid grid-cols-3 gap-3">
              {a.facts.map((f) => (
                <TiltCard key={f.l} className="card hud p-4 text-center">
                  <div className="font-display text-4xl font-bold text-accent">{f.v}</div>
                  <div className="mt-1 text-xs text-muted">{f.l}</div>
                </TiltCard>
              ))}
            </Reveal>

            <Reveal>
              <h3 className="mb-3 font-display text-lg font-bold text-ink">{a.hobbiesTitle}</h3>
              <div className="flex flex-wrap gap-2">{a.hobbies.map((h) => <span key={h} className="chip bg-surface text-sm transition hover:-translate-y-0.5 hover:border-accent">{h}</span>)}</div>
            </Reveal>

            <Reveal>
              <h3 className="mb-3 font-display text-lg font-bold text-ink">{a.competencies}</h3>
              <ul className="space-y-2">
                {a.competenciesList.map((c) => (
                  <li key={c} className="flex gap-3 text-muted"><Check size={18} className="mt-0.5 shrink-0 text-accent" />{c}</li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div className="space-y-6">
            <Reveal className="card hud p-6">
              <h3 className="mb-5 flex items-center gap-2 font-display text-lg font-bold text-ink"><GraduationCap size={20} className="text-accent" />{a.educationTitle}</h3>
              <ol className="relative space-y-5 border-l-2 border-line pl-6">
                {education.map((e) => (
                  <li key={e.title + e.year} className="relative">
                    <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-bg" />
                    <p className="text-xs font-semibold text-accent">{e.year}</p>
                    <p className="font-semibold">{lang === "pt" ? e.title : e.en}</p>
                    <p className="text-sm text-muted">{e.place}</p>
                  </li>
                ))}
              </ol>
            </Reveal>

            <Reveal className="card hud p-6">
              <h3 className="mb-4 font-display text-lg font-bold text-ink">{a.skillsTitle}</h3>
              <div className="mb-5 flex flex-wrap gap-2" role="tablist">
                {groups.map((g) => (
                  <button key={g} role="tab" aria-selected={group === g} onClick={() => setGroup(g)}
                    className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${group === g ? "bg-accent text-[#0c0d10]" : "border border-line text-muted hover:border-brand2"}`}>
                    {a.groups[g]}
                  </button>
                ))}
              </div>
              <div key={group} className="space-y-4">
                {skills.filter((s) => s.group === group).map((s, i) => <SkillBar key={s.name} name={s.name} level={s.level} delay={i * 0.1} />)}
              </div>
            </Reveal>

            <Reveal className="card hud p-6">
              <h3 className="mb-4 font-display text-lg font-bold text-ink">{a.languagesTitle}</h3>
              <div className="space-y-4">
                {a.languages.map((l, i) => (
                  <div key={l.n}>
                    <div className="mb-1.5 flex justify-between text-sm"><span className="font-medium">{l.n}</span><span className="text-muted">{l.l}</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-line"><motion.div initial={{ width: 0 }} whileInView={{ width: `${l.p}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.12 }} className="h-full rounded-full bg-warm" /></div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal className="mt-10">
          <h3 className="mb-3 font-display text-lg font-bold text-ink">{a.courses}</h3>
          <div className="flex flex-wrap gap-2">{a.coursesList.map((c) => <span key={c} className="chip transition hover:-translate-y-0.5 hover:border-accent">{c}</span>)}</div>
        </Reveal>
      </div>
    </section>
  );
}
