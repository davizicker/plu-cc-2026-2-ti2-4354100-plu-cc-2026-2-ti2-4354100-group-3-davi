"use client";
import { useState } from "react";
import { FaGithub, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { Check, Copy } from "lucide-react";
import { PROFILE } from "@/data/social";
import { useLang } from "@/context/LanguageContext";

export function SocialLinks({ size = "md" }: { size?: "sm" | "md" }) {
  const links = [
    { label: "E-mail", href: `mailto:${PROFILE.email}`, icon: MdEmail, color: "hover:bg-red-500" },
    { label: "WhatsApp", href: PROFILE.whatsapp, icon: FaWhatsapp, color: "hover:bg-green-500" },
    { label: "LinkedIn", href: PROFILE.linkedin, icon: FaLinkedinIn, color: "hover:bg-[#0A66C2]" },
    { label: "GitHub", href: PROFILE.github, icon: FaGithub, color: "hover:bg-[#24292f]" },
  ];
  const dim = size === "sm" ? "h-11 w-11" : "h-14 w-14";
  return (
    <ul className="flex flex-wrap gap-3">
      {links.map(({ label, href, icon: Icon, color }) => (
        <li key={label}>
          <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" aria-label={label} title={label}
            className={`${dim} grid place-items-center rounded-2xl border border-line bg-surface text-xl text-brand transition duration-200 hover:-translate-y-1.5 hover:rotate-3 hover:border-transparent hover:text-white hover:shadow-lg dark:text-ink ${color}`}>
            <Icon />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function CopyEmail() {
  const { t } = useLang();
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(PROFILE.email); } catch {}
    setDone(true); setTimeout(() => setDone(false), 2000);
  };
  return (
    <button onClick={copy} className="btn-ghost" aria-live="polite">
      {done ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
      {done ? t.contact.copied : t.contact.copy}
    </button>
  );
}
