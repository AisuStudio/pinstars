"use client";

import Link from "next/link";
import { useT, LanguageSwitcher } from "@/lib/i18n";

export default function AboutPage() {
  const t = useT();
  return (
    <main className="min-h-screen p-6 pb-16">
      <div className="max-w-md mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-[color:var(--color-muted)] font-bold text-sm"
          >
            {t("common.back")}
          </Link>
          <LanguageSwitcher />
        </div>
        <h1 className="bs-title text-3xl text-[color:var(--color-gold)]">
          {t("about.title")}
        </h1>

        <section className="bs-panel p-5 flex flex-col gap-2">
          <h2 className="font-display text-xl text-[color:var(--color-cyan)]">
            {t("about.q.head")}
          </h2>
          <p className="font-bold text-sm leading-relaxed">{t("about.q.p1")}</p>
          <p className="font-bold text-sm leading-relaxed">{t("about.q.p2")}</p>
          <p className="font-bold text-sm leading-relaxed text-[color:var(--color-muted)]">
            {t("about.q.p3")}
          </p>
        </section>

        <section className="bs-panel p-5 flex flex-col gap-2">
          <h2 className="font-display text-xl text-[color:var(--color-green)]">
            {t("about.sec.head")}
          </h2>
          <p
            className="font-bold text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: t("about.sec.p1") }}
          />
          <p className="font-bold text-sm leading-relaxed">{t("about.sec.p2")}</p>
        </section>

        <section className="bs-panel p-5 flex flex-col gap-3">
          <h2 className="font-display text-xl text-[color:var(--color-pink)]">
            {t("about.contact.head")}
          </h2>
          <a
            href="mailto:aisustudio.berlin@gmail.com"
            className="bs-btn bs-btn--blue text-base"
          >
            ✉️ aisustudio.berlin@gmail.com
          </a>
          <a
            href="https://github.com/AisuStudio/pinstars"
            target="_blank"
            rel="noopener noreferrer"
            className="bs-btn bs-btn--ghost text-base"
          >
            {t("about.github")}
          </a>
        </section>

        <p className="text-center text-[color:var(--color-muted)] text-xs font-bold">
          {t("about.footer")}
        </p>
      </div>
    </main>
  );
}
