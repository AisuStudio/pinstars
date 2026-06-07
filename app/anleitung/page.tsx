"use client";

import Link from "next/link";
import { useT, LanguageSwitcher } from "@/lib/i18n";

export default function AnleitungPage() {
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
        <h1 className="bs-title text-4xl text-[color:var(--color-gold)]">
          {t("guide.title")}
        </h1>

        <div
          className="bs-panel p-5 flex flex-col gap-4 text-[15px] leading-relaxed text-white"
          style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
        >
          {(["s1", "s2", "s3", "s4"] as const).map((s) => (
            <section key={s} className="flex flex-col gap-1">
              <h2 className="font-bold text-[color:var(--color-cyan)] text-lg">
                {t(`guide.${s}.head`)}
              </h2>
              <p>{t(`guide.${s}.p`)}</p>
            </section>
          ))}

          <p className="text-[color:var(--color-muted)]">{t("guide.tip")}</p>
        </div>

        <Link href="/setup" className="bs-btn bs-btn--green text-xl">
          {t("nav.startNewGame")}
        </Link>
      </div>
    </main>
  );
}
