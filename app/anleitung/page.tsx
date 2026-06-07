import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anleitung · Pinstars",
};

export default function AnleitungPage() {
  return (
    <main className="min-h-screen p-6 pb-16">
      <div className="max-w-md mx-auto flex flex-col gap-6">
        <Link
          href="/"
          className="text-[color:var(--color-muted)] font-bold text-sm"
        >
          ← zurück
        </Link>
        <h1 className="bs-title text-4xl text-[color:var(--color-gold)]">
          ANLEITUNG
        </h1>

        {/* Fließtext bewusst in Arial */}
        <div
          className="bs-panel p-5 flex flex-col gap-4 text-[15px] leading-relaxed text-white"
          style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
        >
          <section className="flex flex-col gap-1">
            <h2 className="font-bold text-[color:var(--color-cyan)] text-lg">
              Worum geht’s?
            </h2>
            <p>
              Pinstars ist eine Schnitzeljagd fürs Smartphone. Ein oder zwei
              Teams suchen nacheinander versteckte „Pins“ auf einer Karte –
              echte Orte in eurer Umgebung. Jedes Team sucht so viele Pins, wie
              es Mitspielerinnen und Mitspieler hat.
            </p>
          </section>

          <section className="flex flex-col gap-1">
            <h2 className="font-bold text-[color:var(--color-cyan)] text-lg">
              Vorbereiten
            </h2>
            <p>
              Eine erwachsene Person legt vorab ein Spiel an: Name, geheimer
              Code, Teams und Spielernamen. Danach geht sie zu jedem Versteck,
              tippt „Pin hier setzen“ und gibt eine Quiz-Frage mit drei
              Antworten dazu ein. Optional bekommt jedes Team eine kleine
              Mission und es gibt ein gemeinsames Ziel als großes Finale.
            </p>
          </section>

          <section className="flex flex-col gap-1">
            <h2 className="font-bold text-[color:var(--color-cyan)] text-lg">
              Spielen
            </h2>
            <p>
              Jedes Team öffnet den Spiele-Link und gibt den Code ein. Die App
              wählt aus, wer anfängt. Ein Peilkompass zeigt mit „weit – nah –
              ganz nah – DA“, wie nah ihr dem Pin seid. Bei „DA“ ist der Pin
              gefunden!
            </p>
          </section>

          <section className="flex flex-col gap-1">
            <h2 className="font-bold text-[color:var(--color-cyan)] text-lg">
              Aufgaben lösen
            </h2>
            <p>
              An jedem gefundenen Pin löst die Person, die gerade dran ist, eine
              Quiz-Frage. Ist die Antwort richtig, wird der nächste Pin
              freigeschaltet und die nächste Person ist dran. Wer alle Pins
              gefunden hat, läuft zum gemeinsamen Ziel – und gewinnt!
            </p>
          </section>

          <p className="text-[color:var(--color-muted)]">
            Tipp: Lasst die Standort-Erlaubnis im Browser zu, sonst kann die App
            den Pin nicht anpeilen.
          </p>
        </div>

        <Link href="/setup" className="bs-btn bs-btn--green text-xl">
          ⭐ Neues Spiel starten
        </Link>
      </div>
    </main>
  );
}
