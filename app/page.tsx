import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 gap-8">
      <div className="text-center flex flex-col gap-3">
        <h1 className="text-5xl font-black text-lime-300 tracking-tight">
          Pinstars
        </h1>
        <p className="text-zinc-400 max-w-xs">
          Die Geocaching-Schnitzeljagd für den Kindergeburtstag.
        </p>
      </div>

      <Link
        href="/setup"
        className="rounded-xl bg-lime-300 text-zinc-950 font-bold text-lg px-8 py-4 min-h-11"
      >
        Neues Spiel
      </Link>

      <p className="text-zinc-600 text-sm text-center max-w-xs">
        Ein Team hat schon einen Link? Einfach den geteilten Spiele-Link öffnen.
      </p>
    </main>
  );
}
