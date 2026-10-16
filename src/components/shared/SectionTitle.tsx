import { Reveal } from "./Reveal";

export function SectionTitle({ kicker, title, subtitle }: { kicker: string; title: string; subtitle?: string }) {
  return (
    <Reveal className="mb-12 max-w-2xl">
      <p className="mb-3 inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.2em] text-brand2 dark:text-accent">
        <span className="h-px w-8 bg-current" /> {kicker}
      </p>
      <h2 className="font-display text-3xl font-bold leading-tight text-brand sm:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-muted">{subtitle}</p>}
    </Reveal>
  );
}
