"use client";
import { motion } from "framer-motion";

export function SkillBar({ name, level, delay = 0 }: { name: string; level: number; delay?: number }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm font-medium"><span>{name}</span><span className="text-muted">{level}%</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={level} aria-valuemin={0} aria-valuemax={100} aria-label={name}>
        <motion.div initial={{ width: 0 }} whileInView={{ width: `${level}%` }} viewport={{ once: true }} transition={{ duration: 1, delay, ease: "easeOut" }} className="h-full rounded-full bg-gradient-to-r from-brand2 to-accent" />
      </div>
    </div>
  );
}
