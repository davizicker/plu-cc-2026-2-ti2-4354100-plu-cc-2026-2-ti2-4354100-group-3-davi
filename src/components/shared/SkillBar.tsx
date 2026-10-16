"use client";
import { motion } from "framer-motion";

export function SkillBar({ name, level, delay = 0 }: { name: string; level: number; delay?: number }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm font-medium"><span>{name}</span><span className="mono text-xs text-muted">LVL {Math.round(level / 10)}</span></div>
      <div className="flex gap-1" role="progressbar" aria-valuenow={level} aria-valuemin={0} aria-valuemax={100} aria-label={name}>
        {Array.from({ length: 10 }, (_, i) => (
          <motion.span key={i} initial={{ opacity: 0.15 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: delay + i * 0.07 }}
            className={`h-2 flex-1 rounded-[2px] ${i < Math.round(level / 10) ? "bg-accent shadow-[0_0_8px_rgb(var(--accent)/0.5)]" : "bg-line"}`} />
        ))}
      </div>
    </div>
  );
}
