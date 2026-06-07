"use client";

import { useState } from "react";
import Link from "next/link";
import { useT, LanguageSwitcher } from "@/lib/i18n";

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
  const t = useT();
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
      if (!res.ok) throw new Error(data.error ?? t("setup.err.save"));
      setGameId(data.gameId);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("setup.err.unknown"));
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
      <main className="min-h-screen flex flex-col items-center justify-center p-6 gap-6 text-center">
        <div className="text-5xl">🎉</div>
        <h1 className="bs-title text-4xl text-[color:var(--color-gold)]">
          {t("setup.success.title")}
        </h1>
        <p className="text-[color:var(--color-muted)] font-bold max-w-sm">
          {t("setup.success.share")}
        </p>
        <div className="bs-chip text-2xl px-5 py-2 font-display tracking-widest text-[color:var(--color-gold)]">
          {code}
        </div>
        <div className="w-full max-w-md flex gap-2 mt-2">
          <input readOnly value={gameLink} className="bs-input font-mono text-sm" />
          <button
            onClick={() => {
              navigator.clipboard.writeText(gameLink);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="bs-btn shrink-0"
          >
            {copied ? "✓" : t("setup.copy")}
          </button>
        </div>
        <Link href={`/setup/${gameId}`} className="bs-btn bs-btn--green text-lg mt-2">
          {t("setup.toPins")}
        </Link>
        <p className="text-[color:var(--color-muted)] text-xs font-semibold max-w-sm">
          {t("setup.toPins.hint")}
        </p>
        <Link href="/" className="text-[color:var(--color-muted)] font-bold text-sm">
          {t("setup.toHome")}
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-md mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-[color:var(--color-muted)] font-bold text-sm">
            {t("common.back")}
          </Link>
          <LanguageSwitcher />
        </div>
        <h1 className="bs-title text-4xl text-[color:var(--color-gold)]">
          {t("setup.title")}
        </h1>

        <label className="flex flex-col gap-2">
          <span className="font-extrabold text-sm text-[color:var(--color-muted)] uppercase tracking-wide">
            {t("setup.gameName")}
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("setup.gameName.ph")}
            className="bs-input"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-extrabold text-sm text-[color:var(--color-muted)] uppercase tracking-wide">
            {t("setup.code")}
          </span>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="bs-input font-display text-2xl tracking-[0.3em] text-[color:var(--color-gold)]"
            />
            <button
              type="button"
              onClick={() => setCode(randomCode())}
              className="bs-btn bs-btn--pink shrink-0 px-4 text-2xl"
            >
              🎲
            </button>
          </div>
        </label>

        <div className="flex flex-col gap-2">
          <span className="font-extrabold text-sm text-[color:var(--color-muted)] uppercase tracking-wide">
            {t("setup.teamCount")}
          </span>
          <div className="flex gap-3">
            {[1, 2].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setTeamCount(n as 1 | 2)}
                className={`flex-1 bs-btn ${teamCount === n ? "" : "bs-btn--ghost"}`}
              >
                {n === 1 ? t("setup.team.one", { n }) : t("setup.team.many", { n })}
              </button>
            ))}
          </div>
        </div>

        {activeTeams.map((team, ti) => {
          const count = team.players.filter((p) => p.trim()).length;
          return (
            <div key={ti} className="bs-panel p-4 flex flex-col gap-3">
              <input
                value={team.name}
                onChange={(e) => updateTeam(ti, { name: e.target.value })}
                className="bg-transparent text-xl font-display text-[color:var(--color-gold)] outline-none"
              />
              {team.players.map((p, pi) => (
                <div key={pi} className="flex gap-2">
                  <input
                    value={p}
                    onChange={(e) => updatePlayer(ti, pi, e.target.value)}
                    placeholder={t("setup.player.ph", { n: pi + 1 })}
                    className="bs-input"
                  />
                  <button
                    type="button"
                    onClick={() => removePlayer(ti, pi)}
                    className="bs-btn bs-btn--ghost shrink-0 px-3"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => addPlayer(ti)}
                  className="flex-1 bs-btn bs-btn--blue text-base"
                >
                  {t("setup.addPlayer")}
                </button>
                <button
                  type="button"
                  onClick={() => randomizeTeam(ti)}
                  className="flex-1 bs-btn bs-btn--pink text-base"
                >
                  {t("setup.randomNames")}
                </button>
              </div>
              <p className="text-xs text-[color:var(--color-muted)] font-bold">
                {t("setup.playersPins", { n: count })}
              </p>
            </div>
          );
        })}

        {error && (
          <p className="text-[color:var(--color-red)] text-sm font-bold">{error}</p>
        )}

        <button onClick={save} disabled={saving} className="bs-btn bs-btn--green text-xl">
          {saving ? t("setup.saving") : t("setup.create")}
        </button>
      </div>
    </main>
  );
}
