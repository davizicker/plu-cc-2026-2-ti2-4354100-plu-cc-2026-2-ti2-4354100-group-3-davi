"use client";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Send, TriangleAlert } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { contactSchema, type ContactValues } from "@/lib/validators";
import { emailConfigured, sendContactEmail } from "@/lib/emailjs";
import { PROFILE } from "@/data/social";
import { Reveal } from "@/components/shared/Reveal";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { CopyEmail, SocialLinks } from "@/components/shared/SocialLinks";

type Status = "idle" | "sending" | "ok" | "error" | "wait" | "config";
const COOLDOWN = 30_000;

export function Contact() {
  const { t } = useLang();
  const c = t.contact, f = c.form;
  const [status, setStatus] = useState<Status>("idle");
  const schema = useMemo(() => contactSchema(f.errors), [f.errors]);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactValues>({ resolver: zodResolver(schema), mode: "onTouched" });

  const onSubmit = async (v: ContactValues) => {
    if (v.website) return; // honeypot: bots preenchem
    try {
      const last = Number(localStorage.getItem("lastSend") || 0);
      if (Date.now() - last < COOLDOWN) return setStatus("wait");
    } catch {}
    if (!emailConfigured) return setStatus("config");
    setStatus("sending");
    try {
      await sendContactEmail(v);
      try { localStorage.setItem("lastSend", String(Date.now())); } catch {}
      setStatus("ok"); reset();
    } catch { setStatus("error"); }
  };

  const msg: Record<Exclude<Status, "idle" | "sending">, string> = { ok: f.ok, error: f.fail, wait: f.wait, config: f.notConfigured };

  return (
    <section id="contact" className="relative overflow-hidden bg-surface/50 py-24">
      <div className="container-x">
        <SectionTitle kicker={c.kicker} title={c.title} subtitle={c.subtitle} />
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal className="space-y-6">
            <div className="card p-6">
              <h3 className="mb-4 font-display text-lg font-bold text-brand">{c.channels}</h3>
              <SocialLinks />
              <dl className="mt-6 space-y-2 text-sm">
                <div className="flex gap-2"><dt className="font-semibold">E-mail:</dt><dd className="text-muted break-all">{PROFILE.email}</dd></div>
                <div className="flex gap-2"><dt className="font-semibold">WhatsApp:</dt><dd className="text-muted">{PROFILE.phoneDisplay}</dd></div>
                <div className="flex gap-2"><dt className="font-semibold">BH, MG</dt><dd className="text-muted">· {t.hero.available}</dd></div>
              </dl>
              <div className="mt-5"><CopyEmail /></div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="card space-y-5 p-6 sm:p-8">
              <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" {...register("website")} />
              {([["name", f.name, "text"], ["email", f.email, "email"]] as const).map(([k, label, type]) => (
                <div key={k}>
                  <label htmlFor={k} className="mb-1.5 block text-sm font-medium">{label}</label>
                  <input id={k} type={type} autoComplete={k} className="input" aria-invalid={!!errors[k]} {...register(k)} />
                  {errors[k] && <p role="alert" className="mt-1 text-xs text-red-500">{errors[k]?.message}</p>}
                </div>
              ))}
              <div>
                <label htmlFor="message" className="mb-1.5 block text-sm font-medium">{f.message}</label>
                <textarea id="message" rows={5} className="input resize-none" aria-invalid={!!errors.message} {...register("message")} />
                {errors.message && <p role="alert" className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
              </div>
              <button type="submit" disabled={isSubmitting || status === "sending"} className="btn-primary w-full">
                {status === "sending" ? <><Loader2 size={16} className="animate-spin" /> {f.sending}</> : <><Send size={16} /> {f.send}</>}
              </button>
              <AnimatePresence>
                {status !== "idle" && status !== "sending" && (
                  <motion.p key={status} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status"
                    className={`flex items-start gap-2 rounded-xl p-3 text-sm ${status === "ok" ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400"}`}>
                    {status === "ok" ? <CheckCircle2 size={18} className="shrink-0" /> : <TriangleAlert size={18} className="shrink-0" />}
                    {msg[status]}
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
