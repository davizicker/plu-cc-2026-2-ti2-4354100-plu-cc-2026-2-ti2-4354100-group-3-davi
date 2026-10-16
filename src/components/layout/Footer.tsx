"use client";
import { Heart } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { PROFILE } from "@/data/social";

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="border-t border-line py-10">
      <div className="container-x flex flex-col items-center justify-between gap-3 text-sm text-muted sm:flex-row">
        <p className="flex items-center gap-1.5">{t.footer.made} <Heart size={14} className="fill-current text-red-400" /></p>
        <p>© {new Date().getFullYear()} {PROFILE.name}. {t.footer.rights}.</p>
      </div>
    </footer>
  );
}
