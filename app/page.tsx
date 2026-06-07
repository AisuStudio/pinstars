import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 gap-10 text-center">
      <Image
        src="/ps-logo.svg"
        alt="Anton's 10 — Pinstars"
        width={638}
        height={349}
        priority
        className="w-[88vw] max-w-sm h-auto drop-shadow-[0_6px_0_rgba(0,0,0,0.35)]"
      />

      <p className="text-[color:var(--color-cyan-light)] font-bold max-w-xs -mt-2">
        Die Geocaching-Schnitzeljagd für den Geburtstag.
      </p>

      <Link href="/setup" className="bs-btn text-xl">
        ⭐ Neues Spiel
      </Link>

      <p className="text-[color:var(--color-muted)]/80 text-sm font-semibold max-w-xs">
        Schon einen Spiele-Link bekommen? Einfach den Link öffnen und mit eurem
        geheimen Code starten.
      </p>
    </main>
  );
}
