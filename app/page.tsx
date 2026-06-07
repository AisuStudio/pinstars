"use client";

import Link from "next/link";
import { useT, LanguageSwitcher } from "@/lib/i18n";

export default function Home() {
  const t = useT();
  return (
    <main className="hero-bg min-h-screen flex flex-col items-center justify-end p-6 pb-[8vh] gap-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Link href="/setup" className="bs-btn text-xl w-full max-w-xs">
        {t("nav.newGame")}
      </Link>
      <Link
        href="/anleitung"
        className="bs-btn bs-btn--ghost text-xl w-full max-w-xs"
      >
        {t("nav.guide")}
      </Link>
      <Link
        href="/about"
        className="font-display uppercase tracking-wide text-[color:var(--color-cyan)] text-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)]"
      >
        {t("nav.about")}
      </Link>
    </main>
  );
}
