import Link from "next/link";

export default function Home() {
  return (
    <main className="hero-bg min-h-screen flex flex-col items-center justify-end p-6 pb-[8vh] gap-4">
      <Link href="/setup" className="bs-btn text-xl w-full max-w-xs">
        Neues Spiel
      </Link>
      <Link
        href="/anleitung"
        className="bs-btn bs-btn--ghost text-xl w-full max-w-xs"
      >
        Anleitung
      </Link>
      <Link
        href="/about"
        className="font-display uppercase tracking-wide text-[color:var(--color-cyan)] text-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)]"
      >
        Über dieses Spiel
      </Link>
    </main>
  );
}
