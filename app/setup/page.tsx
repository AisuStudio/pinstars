"use client";

import { useState } from "react";
import Link from "next/link";

const RANDOM_NAMES = [
  "Fuchs", "Igel", "Luchs", "Dachs", "Otter", "Biber", "Falke", "Eule",
  "Wiesel", "Reh", "Specht", "Marder", "Hirsch", "Hase", "Kauz", "Star",
];

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function pickRandomNames(n: number) {
  const pool = [...RANDOM_NAMES];
  const out: string[] = [];
  for (let i = 0; i < n && pool.length; i++) {
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return out;
}

type TeamForm = { name: string; players: string[] };

export default function SetupPage() {
  const [name, setName] = useState("");
  const [code, setCode] = useState(randomCode());
  const [teamCount, setTeamCount] = useState<1 | 2>(2);
  const [teams, setTeams] = useState<TeamForm[]>([
    { name: "Team 1", players: ["", ""] },
    { name: "Team 2", players: ["", ""] },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const activeTeams = teams.slice(0, teamCount);

  function updateTeam(ti: number, patch: Partial<TeamForm>) {
    setTeams((prev) => prev.map((t, i) => (i === ti ? { ...t, ...patch } : t)));
  }
  function updatePlayer(ti: number, pi: number, value: string) {
    setTeams((prev) =>
      prev.map((t, i) =>
        i === ti
          ? { ...t, players: t.players.map((p, j) => (j === pi ? value : p)) }
          : t,
      ),
    );
  }
  function addPlayer(ti: number) {
    setTeams((prev) =>
      prev.map((t, i) => (i === ti ? { ...t, players: [...t.players, ""] } : t)),
    );
  }
  function removePlayer(ti: number, pi: number) {
    setTeams((prev) =>
      prev.map((t, i) =>
        i === ti && t.players.length > 1
          ? { ...t, players: t.players.filter((_, j) => j !== pi) }
          : t,
      ),
    );
  }
  function randomizeTeam(ti: number) {
    const count = teams[ti].players.length;
    updateTeam(ti, { players: pickRandomNames(count) });
  }

  async function save() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          code,
          teams: activeTeams.map((t) => ({
            name: t.name,
            players: t.players.map((p) => p.trim()).filter(Boolean),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fehler beim Speichern");
      setGameId(data.gameId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setSaving(false);
    }
  }

  const gameLink =
    gameId && typeof window !== "undefined"
      ? `${window.location.origin}/app/${gameId}`
      : "";

  if (gameId) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 gap-6">
        <h1 className="text-2xl font-bold text-lime-300">Spiel angelegt! 🎉</h1>
        <p className="text-zinc-400 text-center max-w-sm">
          Teile diesen Link mit den Teams. Der geheime Code zum Starten:{" "}
          <span className="font-mono text-lime-300 text-lg">{code}</span>
        </p>
        <div className="w-full max-w-md flex gap-2">
          <input
            readOnly
            value={gameLink}
            className="flex-1 rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-3 font-mono text-sm"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(gameLink);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="rounded-lg bg-lime-300 text-zinc-950 font-semibold px-4 min-h-11"
          >
            {copied ? "✓" : "Kopieren"}
          </button>
        </div>
        <p className="text-amber-400/80 text-sm text-center max-w-sm">
          Nächster Schritt (kommt noch): Pins vor Ort setzen + Aufgaben eingeben.
        </p>
        <Link href="/" className="text-zinc-500 underline text-sm">
          Zurück
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-md mx-auto flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-lime-300">Neues Spiel</h1>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-400">Spielname</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z.B. Lottas Geburtstag"
            className="rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-3 min-h-11"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-zinc-400">Geheimer Code</span>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="flex-1 rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-3 font-mono text-lg tracking-widest min-h-11"
            />
            <button
              type="button"
              onClick={() => setCode(randomCode())}
              className="rounded-lg border border-zinc-700 px-4 min-h-11"
            >
              🎲
            </button>
          </div>
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-zinc-400">Anzahl Teams</span>
          <div className="flex gap-2">
            {[1, 2].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setTeamCount(n as 1 | 2)}
                className={`flex-1 rounded-lg py-3 min-h-11 font-semibold ${
                  teamCount === n
                    ? "bg-lime-300 text-zinc-950"
                    : "border border-zinc-700 text-zinc-300"
                }`}
              >
                {n} Team{n > 1 ? "s" : ""}
              </button>
            ))}
          </div>
        </div>

        {activeTeams.map((team, ti) => (
          <div
            key={ti}
            className="rounded-xl border border-zinc-800 p-4 flex flex-col gap-3"
          >
            <input
              value={team.name}
              onChange={(e) => updateTeam(ti, { name: e.target.value })}
              className="bg-transparent text-lg font-semibold text-lime-300 outline-none"
            />
            {team.players.map((p, pi) => (
              <div key={pi} className="flex gap-2">
                <input
                  value={p}
                  onChange={(e) => updatePlayer(ti, pi, e.target.value)}
                  placeholder={`Spieler ${pi + 1}`}
                  className="flex-1 rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2.5 min-h-11"
                />
                <button
                  type="button"
                  onClick={() => removePlayer(ti, pi)}
                  className="rounded-lg border border-zinc-700 px-3 min-h-11 text-zinc-500"
                >
                  ✕
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => addPlayer(ti)}
                className="flex-1 rounded-lg border border-zinc-700 py-2.5 min-h-11 text-sm"
              >
                + Spieler
              </button>
              <button
                type="button"
                onClick={() => randomizeTeam(ti)}
                className="flex-1 rounded-lg border border-zinc-700 py-2.5 min-h-11 text-sm"
              >
                🎲 Random Namen
              </button>
            </div>
            <p className="text-xs text-zinc-500">
              {team.players.filter((p) => p.trim()).length} Spieler ={" "}
              {team.players.filter((p) => p.trim()).length} Pins zu suchen
            </p>
          </div>
        ))}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-lime-300 text-zinc-950 font-bold py-4 min-h-11 disabled:opacity-50"
        >
          {saving ? "Speichern…" : "Spiel anlegen →"}
        </button>
      </div>
    </main>
  );
}
