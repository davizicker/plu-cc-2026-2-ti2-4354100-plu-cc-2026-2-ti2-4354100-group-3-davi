import { Reveal } from "./Reveal";

export function SectionTitle({ kicker, title, subtitle }: { kicker: string; title: string; subtitle?: string }) {
  return (
    <Reveal className="mb-12 max-w-2xl">
      <p className="mono mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        <span aria-hidden>{"//"}</span> {kicker}
      </p>
      <h2 className="font-display text-3xl font-bold leading-tight text-ink sm:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-muted">{subtitle}</p>}
    </Reveal>
  );
}
