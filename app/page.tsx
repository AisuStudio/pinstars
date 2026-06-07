import Link from "next/link";

export default function Home() {
  return (
    <main className="hero-bg min-h-screen flex flex-col items-center justify-end p-6 pb-[10vh] gap-4">
      <Link href="/setup" className="bs-btn text-xl w-full max-w-xs">
        ⭐ Neues Spiel
      </Link>
      <p className="text-white/90 text-sm font-bold max-w-xs text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]">
        Schon einen Spiele-Link bekommen? Einfach den Link öffnen.
      </p>
    </main>
  );
}
