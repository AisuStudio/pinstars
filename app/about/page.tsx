import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Über dieses Spiel · Pinstars",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen p-6 pb-16">
      <div className="max-w-md mx-auto flex flex-col gap-6">
        <Link
          href="/"
          className="text-[color:var(--color-muted)] font-bold text-sm"
        >
          ← zurück
        </Link>
        <h1 className="bs-title text-3xl text-[color:var(--color-gold)]">
          ÜBER DIESES SPIEL
        </h1>

        <section className="bs-panel p-5 flex flex-col gap-2">
          <h2 className="font-display text-xl text-[color:var(--color-cyan)]">
            Wofür ist Pinstars?
          </h2>
          <p className="font-bold text-sm leading-relaxed">
            Pinstars ist eine kleine Geocaching-Schnitzeljagd – gemacht für
            Kindergeburtstage und Ausflüge. Versteckt Pins in eurer Umgebung,
            denkt euch Quizfragen aus, und lasst die Teams losziehen. Ganz ohne
            Anmeldung, einfach per Link.
          </p>
        </section>

        <section className="bs-panel p-5 flex flex-col gap-2">
          <h2 className="font-display text-xl text-[color:var(--color-green)]">
            Datensicherheit
          </h2>
          <p className="font-bold text-sm leading-relaxed">
            Es werden <strong>keine personenbezogenen Daten erhoben</strong>.
            Kein Login, kein Tracking, keine Werbung. Spielernamen und Pins, die
            ihr eingebt, dienen nur dem Spiel und sind über den geheimen
            Spiel-Link erreichbar – teilt ihn also nur mit euren Teams.
          </p>
          <p className="font-bold text-sm leading-relaxed">
            Euer GPS-Standort wird ausschließlich im Browser verwendet, um die
            Entfernung zum nächsten Pin anzuzeigen. Er wird nicht gespeichert
            und nicht weitergegeben.
          </p>
        </section>

        <section className="bs-panel p-5 flex flex-col gap-3">
          <h2 className="font-display text-xl text-[color:var(--color-pink)]">
            Kontakt
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
            ⭐ Projekt auf GitHub
          </a>
        </section>

        <p className="text-center text-[color:var(--color-muted)] text-xs font-bold">
          Anton’s 10 · Pinstars — mit ♥ gebaut
        </p>
      </div>
    </main>
  );
}
