"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";

const PinMap = dynamic(() => import("@/components/PinMap"), { ssr: false });

type Task = { id: string; question: string; answers: string[]; correct_idx: number };
type Station = {
  id: string;
  idx: number;
  lat: number | null;
  lng: number | null;
  radius_m: number;
  hint: string | null;
  task: Task[];
};
type Team = {
  id: string;
  name: string | null;
  member_count: number | null;
  station: Station[];
};
type Game = { id: string; name: string; code: string; team: Team[] };

type Capture = { lat: number; lng: number; accuracy: number };

export default function PinSetupPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTeam, setActiveTeam] = useState(0);

  // pin form
  const [capture, setCapture] = useState<Capture | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState(["", "", ""]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [hint, setHint] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/games/${gameId}`);
    const data = await res.json();
    if (!res.ok) {
      setLoadError(data.error ?? "Fehler");
      return;
    }
    // sort teams + stations stably
    const g: Game = data.game;
    g.team.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    g.team.forEach((t) => t.station.sort((a, b) => a.idx - b.idx));
    setGame(g);
  }, [gameId]);

  useEffect(() => {
    load();
  }, [load]);

  function resetForm() {
    setCapture(null);
    setQuestion("");
    setAnswers(["", "", ""]);
    setCorrectIdx(0);
    setHint("");
    setSaveError(null);
    setGeoError(null);
  }

  function locate() {
    setGeoError(null);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCapture({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setLocating(false);
      },
      (err) => {
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "Standort-Erlaubnis verweigert"
            : "Standort nicht verfügbar — kurz warten und nochmal",
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  async function saveStation() {
    if (!game || !capture) return;
    const team = game.team[activeTeam];
    setSaving(true);
    setSaveError(null);
    try {
      const nextIdx = team.station.length;
      const res = await fetch(`/api/games/${gameId}/stations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: team.id,
          idx: nextIdx,
          lat: capture.lat,
          lng: capture.lng,
          radius_m: 18,
          hint,
          question,
          answers,
          correct_idx: correctIdx,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fehler");
      resetForm();
      await load();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Fehler");
    } finally {
      setSaving(false);
    }
  }

  if (loadError) {
    return (
      <main className="min-h-screen grid place-items-center p-6 text-center">
        <p className="text-[color:var(--color-red)] font-bold">{loadError}</p>
      </main>
    );
  }
  if (!game) {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <p className="text-[color:var(--color-muted)] font-bold">Lädt…</p>
      </main>
    );
  }

  const team = game.team[activeTeam];
  const target = team.member_count ?? team.station.length;
  const done = team.station.length >= target;
  const allDone = game.team.every(
    (t) => t.station.length >= (t.member_count ?? 0),
  );
  const formValid =
    capture && question.trim() && answers.every((a) => a.trim());

  return (
    <main className="min-h-screen p-5 pb-24">
      <div className="max-w-md mx-auto flex flex-col gap-5">
        <Link href="/" className="text-[color:var(--color-muted)] font-bold text-sm">
          ← {game.name}
        </Link>
        <h1 className="bs-title text-3xl text-[color:var(--color-gold)]">
          PINS SETZEN
        </h1>

        {/* team switcher */}
        {game.team.length > 1 && (
          <div className="flex gap-2">
            {game.team.map((t, i) => {
              const c = t.station.length;
              const tgt = t.member_count ?? 0;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTeam(i);
                    resetForm();
                  }}
                  className={`flex-1 bs-btn text-base ${
                    i === activeTeam ? "" : "bs-btn--ghost"
                  }`}
                >
                  {t.name} {c}/{tgt}
                </button>
              );
            })}
          </div>
        )}

        {/* progress for current team */}
        <div className="bs-panel p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-display text-xl text-[color:var(--color-gold)]">
              {team.name}
            </span>
            <span className="bs-chip text-[color:var(--color-cyan)]">
              {team.station.length}/{target} Pins
            </span>
          </div>
          {team.station.length > 0 && (
            <ul className="flex flex-col gap-1 text-sm">
              {team.station.map((s) => (
                <li key={s.id} className="text-[color:var(--color-muted)] font-semibold">
                  📍 Pin {s.idx + 1}
                  {s.hint ? ` — „${s.hint}"` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>

        {done ? (
          <div className="bs-panel p-4 text-center flex flex-col gap-3">
            <p className="font-display text-2xl text-[color:var(--color-green)]">
              {team.name} fertig! ✓
            </p>
            {!allDone && game.team.length > 1 && (
              <button
                onClick={() => {
                  setActiveTeam((activeTeam + 1) % game.team.length);
                  resetForm();
                }}
                className="bs-btn bs-btn--blue"
              >
                Nächstes Team →
              </button>
            )}
            {allDone && (
              <>
                <p className="text-[color:var(--color-muted)] font-bold">
                  Alle Pins gesetzt — das Spiel ist startklar!
                </p>
                <div className="bs-chip text-xl px-4 py-2 mx-auto font-display text-[color:var(--color-gold)]">
                  Code: {game.code}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="bs-panel p-4 flex flex-col gap-4">
            <p className="font-display text-lg text-[color:var(--color-cyan)]">
              Pin {team.station.length + 1} von {target}
            </p>

            {/* GPS capture */}
            {!capture ? (
              <>
                <button
                  onClick={locate}
                  disabled={locating}
                  className="bs-btn bs-btn--pink text-lg"
                >
                  {locating ? "Suche Standort…" : "📍 Pin hier setzen"}
                </button>
                {geoError && (
                  <p className="text-[color:var(--color-red)] text-sm font-bold">
                    {geoError}
                  </p>
                )}
                <p className="text-[color:var(--color-muted)] text-xs font-semibold">
                  Geh zum Versteck und tippe „Pin hier setzen" — dein aktueller
                  GPS-Standort wird übernommen.
                </p>
              </>
            ) : (
              <>
                <div className="h-44 w-full overflow-hidden rounded-[14px] border-[3px] border-black">
                  <PinMap lat={capture.lat} lng={capture.lng} radiusM={18} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="bs-chip text-[color:var(--color-cyan)]">
                    Genauigkeit ±{Math.round(capture.accuracy)} m
                  </span>
                  <button
                    onClick={locate}
                    className="bs-btn bs-btn--ghost text-sm px-3 min-h-10"
                  >
                    Neu messen
                  </button>
                </div>

                {/* task */}
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-extrabold uppercase text-[color:var(--color-muted)]">
                    Frage
                  </span>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="z.B. Wie viele Beine hat eine Spinne?"
                    rows={2}
                    className="bs-input py-3 resize-none"
                  />
                </label>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-extrabold uppercase text-[color:var(--color-muted)]">
                    Antworten (richtige antippen)
                  </span>
                  {answers.map((a, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <button
                        type="button"
                        onClick={() => setCorrectIdx(i)}
                        className={`shrink-0 w-10 h-10 rounded-full border-[3px] border-black font-display ${
                          correctIdx === i
                            ? "bg-[color:var(--color-green)] text-white"
                            : "bg-white/10 text-[color:var(--color-muted)]"
                        }`}
                      >
                        {correctIdx === i ? "✓" : String.fromCharCode(65 + i)}
                      </button>
                      <input
                        value={a}
                        onChange={(e) =>
                          setAnswers((prev) =>
                            prev.map((x, j) => (j === i ? e.target.value : x)),
                          )
                        }
                        placeholder={`Antwort ${String.fromCharCode(65 + i)}`}
                        className="bs-input"
                      />
                    </div>
                  ))}
                </div>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-extrabold uppercase text-[color:var(--color-muted)]">
                    Hinweis bei „DA" (optional)
                  </span>
                  <input
                    value={hint}
                    onChange={(e) => setHint(e.target.value)}
                    placeholder="z.B. Schau am Zaun"
                    className="bs-input"
                  />
                </label>

                {saveError && (
                  <p className="text-[color:var(--color-red)] text-sm font-bold">
                    {saveError}
                  </p>
                )}
                <button
                  onClick={saveStation}
                  disabled={!formValid || saving}
                  className="bs-btn bs-btn--green text-lg"
                >
                  {saving ? "Speichern…" : "Pin speichern ✓"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
