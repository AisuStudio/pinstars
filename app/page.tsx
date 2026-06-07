import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 gap-10 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="text-6xl drop-shadow-[0_4px_0_rgba(26,18,48,0.4)]">⭐</div>
        <h1 className="bs-title text-6xl sm:text-7xl text-[color:var(--color-gold)]">
          PINSTARS
        </h1>
        <p className="text-[color:var(--color-muted)] font-bold max-w-xs">
          Die Geocaching-Schnitzeljagd für den Kindergeburtstag.
        </p>
      </div>

      <Link href="/setup" className="bs-btn text-xl">
        ⭐ Neues Spiel
      </Link>

      <p className="text-[color:var(--color-muted)]/70 text-sm font-semibold max-w-xs">
        Schon einen Spiele-Link bekommen? Einfach den Link öffnen und mit eurem
        geheimen Code starten.
      </p>
    </main>
  );
}
