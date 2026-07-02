"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useT, LanguageSwitcher } from "@/lib/i18n";

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
  mission: string | null;
  station: Station[];
};
type Game = {
  id: string;
  name: string;
  code: string;
  team: Team[];
  goal_lat: number | null;
  goal_lng: number | null;
};

type Capture = { lat: number; lng: number; accuracy: number };

export default function PinSetupPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const t = useT();
  const [game, setGame] = useState<Game | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTeam, setActiveTeam] = useState(0);

  // mission
  const [mission, setMission] = useState("");
  const [missionSaving, setMissionSaving] = useState(false);
  const [missionEditing, setMissionEditing] = useState(false);
  const [missionSkipped, setMissionSkipped] = useState<Set<string>>(new Set());

  // shared goal
  const [goalSkipped, setGoalSkipped] = useState(false);

  // pin / capture form (shared by pin + goal)
  const [capture, setCapture] = useState<Capture | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState(["", "", ""]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [hint, setHint] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/games/${gameId}`);
    const data = await res.json();
    if (!res.ok) {
      setLoadError(data.error ?? t("pinsetup.err"));
      return;
    }
    const g: Game = data.game;
    g.team.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    g.team.forEach((tm) => tm.station.sort((a, b) => a.idx - b.idx));
    setGame(g);
  }, [gameId, t]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const tm = game?.team[activeTeam];
    setMission(tm?.mission ?? "");
    setMissionEditing(false);
  }, [activeTeam, game]);

  function resetForm() {
    setCapture(null);
    setQuestion("");
    setAnswers(["", "", ""]);
    setCorrectIdx(0);
    setHint("");
    setSaveError(null);
    setGeoError(null);
  }

  function switchTeam(i: number) {
    setActiveTeam(i);
    resetForm();
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
            ? t("pinsetup.geo.denied")
            : t("pinsetup.geo.unavail"),
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  async function saveMission() {
    if (!game) return;
    const team = game.team[activeTeam];
    setMissionSaving(true);
    try {
      const res = await fetch(`/api/games/${gameId}/mission`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: team.id, mission }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? t("pinsetup.err"));
      }
      setMissionEditing(false);
      await load();
    } catch (e) {
      setGeoError(e instanceof Error ? e.message : t("pinsetup.err"));
    } finally {
      setMissionSaving(false);
    }
  }

  function skipMission() {
    if (!game) return;
    const id = game.team[activeTeam].id;
    setMissionSkipped((prev) => new Set(prev).add(id));
    setMissionEditing(false);
  }

  function editMission() {
    const tm = game?.team[activeTeam];
    setMission(tm?.mission ?? "");
    setMissionEditing(true);
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
      if (!res.ok) throw new Error(data.error ?? t("pinsetup.err"));
      resetForm();
      await load();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : t("pinsetup.err"));
    } finally {
      setSaving(false);
    }
  }

  async function saveGoal() {
    if (!game || !capture) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/games/${gameId}/goal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
      if (!res.ok) throw new Error(data.error ?? t("pinsetup.err"));
      resetForm();
      await load();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : t("pinsetup.err"));
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
        <p className="text-[color:var(--color-muted)] font-bold">{t("pinsetup.loading")}</p>
      </main>
    );
  }

  const team = game.team[activeTeam];
  const target = team.member_count ?? team.station.length;
  const done = team.station.length >= target;
  const allDone = game.team.every(
    (tm) => tm.station.length >= (tm.member_count ?? 0),
  );
  const goalSet = game.goal_lat != null && game.goal_lng != null;
  const missionDone =
    (!!team.mission?.trim() || missionSkipped.has(team.id)) && !missionEditing;
  const formValid =
    capture && question.trim() && answers.every((a) => a.trim());

  const captureFields = (
    <>
      {!capture ? (
        <>
          <button
            onClick={locate}
            disabled={locating}
            className="bs-btn bs-btn--pink text-lg"
          >
            {locating ? t("pinsetup.locating") : t("pinsetup.locate")}
          </button>
          {geoError && (
            <p className="text-[color:var(--color-red)] text-sm font-bold">
              {geoError}
            </p>
          )}
          <p className="text-[color:var(--color-muted)] text-xs font-semibold">
            {t("pinsetup.locate.hint")}
          </p>
        </>
      ) : (
        <>
          <div className="h-44 w-full overflow-hidden rounded-[14px] border-[3px] border-black">
            <PinMap lat={capture.lat} lng={capture.lng} radiusM={18} />
          </div>
          <div className="flex items-center justify-between">
            <span className="bs-chip text-[color:var(--color-cyan)]">
              {t("pinsetup.accuracy", { n: Math.round(capture.accuracy) })}
            </span>
            <button
              onClick={locate}
              className="bs-btn bs-btn--ghost text-sm px-3 min-h-10"
            >
              {t("pinsetup.remeasure")}
            </button>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-extrabold uppercase text-[color:var(--color-muted)]">
              {t("pinsetup.question")}
            </span>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t("pinsetup.question.ph")}
              rows={2}
              className="bs-input py-3 resize-none"
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-extrabold uppercase text-[color:var(--color-muted)]">
              {t("pinsetup.answers")}
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
                  placeholder={t("pinsetup.answer.ph", { letter: String.fromCharCode(65 + i) })}
                  className="bs-input"
                />
              </div>
            ))}
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-extrabold uppercase text-[color:var(--color-muted)]">
              {t("pinsetup.hint")}
            </span>
            <input
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder={t("pinsetup.hint.ph")}
              className="bs-input"
            />
          </label>

          {saveError && (
            <p className="text-[color:var(--color-red)] text-sm font-bold">
              {saveError}
            </p>
          )}
        </>
      )}
    </>
  );

  return (
    <main className="min-h-screen p-5 pb-24">
      <div className="max-w-md mx-auto flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-[color:var(--color-muted)] font-bold text-sm">
            ← {game.name}
          </Link>
          <LanguageSwitcher />
        </div>
        <h1 className="bs-title text-3xl text-[color:var(--color-gold)]">
          {t("pinsetup.title")}
        </h1>

        {/* share link + code */}
        <div className="bs-panel p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-[color:var(--color-muted)]">
              {t("pinsetup.shareLink")}
            </span>
            <span className="bs-chip font-display text-[color:var(--color-gold)]">
              {t("pinsetup.code", { code: game.code })}
            </span>
          </div>
          <div className="flex gap-2">
            <input
              readOnly
              value={
                typeof window !== "undefined"
                  ? `${window.location.origin}/app/${gameId}`
                  : ""
              }
              className="bs-input font-mono text-xs"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/app/${gameId}`,
                );
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="bs-btn shrink-0 px-4"
            >
              {copied ? "✓" : t("pinsetup.share")}
            </button>
          </div>
          <a
            href={`/app/${gameId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bs-btn bs-btn--green w-full"
          >
            {t("pinsetup.openGame")}
          </a>
          <button
            onClick={async () => {
              if (!confirm(t("pinsetup.reset.confirm"))) return;
              await fetch(`/api/games/${gameId}/reset`, { method: "POST" });
              await load();
              alert(t("pinsetup.reset.done"));
            }}
            className="bs-btn bs-btn--ghost w-full text-sm"
          >
            {t("pinsetup.reset")}
          </button>
        </div>

        {/* shared goal */}
        {allDone && !goalSet && !goalSkipped ? (
          <div className="bs-panel p-4 flex flex-col gap-4">
            <p className="font-display text-xl text-[color:var(--color-cyan)]">
              {t("pinsetup.goal.title")}
            </p>
            <p className="text-[color:var(--color-muted)] text-xs font-semibold">
              {t("pinsetup.goal.desc")}
            </p>
            {captureFields}
            <div className="flex gap-2">
              <button
                onClick={() => setGoalSkipped(true)}
                className="bs-btn bs-btn--ghost flex-1"
              >
                {t("pinsetup.skip")}
              </button>
              <button
                onClick={saveGoal}
                disabled={!formValid || saving}
                className="bs-btn bs-btn--green flex-1"
              >
                {saving ? "…" : t("pinsetup.save")}
              </button>
            </div>
          </div>
        ) : allDone ? (
          <div className="bs-panel p-4 text-center flex flex-col gap-3">
            <p className="font-display text-2xl text-[color:var(--color-green)]">
              {t("pinsetup.allReady")}
            </p>
            <p className="text-[color:var(--color-muted)] font-bold">
              {goalSet ? t("pinsetup.goal.set") : t("pinsetup.goal.skipped")}
            </p>
            {!goalSet && (
              <button
                onClick={() => setGoalSkipped(false)}
                className="bs-btn bs-btn--ghost text-base"
              >
                {t("pinsetup.goal.addLater")}
              </button>
            )}
            <div className="bs-chip text-xl px-4 py-2 mx-auto font-display text-[color:var(--color-gold)]">
              {t("pinsetup.code", { code: game.code })}
            </div>
          </div>
        ) : (
          <>
            {game.team.length > 1 && (
              <div className="flex gap-2">
                {game.team.map((tm, i) => {
                  const c = tm.station.length;
                  const tgt = tm.member_count ?? 0;
                  return (
                    <button
                      key={tm.id}
                      onClick={() => switchTeam(i)}
                      className={`flex-1 bs-btn text-base ${
                        i === activeTeam ? "" : "bs-btn--ghost"
                      }`}
                    >
                      {tm.name} {c}/{tgt}
                    </button>
                  );
                })}
              </div>
            )}

            {!missionDone ? (
              <div className="bs-panel p-4 flex flex-col gap-3">
                <p className="font-display text-lg text-[color:var(--color-cyan)]">
                  {t("pinsetup.mission.title", { name: team.name ?? "" })}
                </p>
                <p className="text-[color:var(--color-muted)] text-xs font-semibold">
                  {t("pinsetup.mission.desc")}
                </p>
                <textarea
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  placeholder={t("pinsetup.mission.ph")}
                  rows={6}
                  className="bs-input py-3 resize-none min-h-[9rem]"
                />
                <div className="flex gap-2">
                  <button onClick={skipMission} className="bs-btn bs-btn--ghost flex-1">
                    {t("pinsetup.skip")}
                  </button>
                  <button
                    onClick={saveMission}
                    disabled={missionSaving || !mission.trim()}
                    className="bs-btn bs-btn--green flex-1"
                  >
                    {missionSaving ? "…" : t("pinsetup.save")}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="bs-panel p-3 flex items-start gap-2">
                  <span className="text-lg">🎯</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-extrabold uppercase text-[color:var(--color-muted)]">
                      {t("pinsetup.mission.label", { name: team.name ?? "" })}
                    </span>
                    <p className="font-bold text-sm">
                      {team.mission?.trim() || (
                        <span className="text-[color:var(--color-muted)]">
                          {t("pinsetup.mission.skipped")}
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={editMission}
                    className="bs-btn bs-btn--ghost text-sm px-3 min-h-10 shrink-0"
                  >
                    ✏️
                  </button>
                </div>

                <div className="bs-panel p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xl text-[color:var(--color-gold)]">
                      {team.name}
                    </span>
                    <span className="bs-chip text-[color:var(--color-cyan)]">
                      {t("pinsetup.pins.progress", { n: team.station.length, total: target })}
                    </span>
                  </div>
                  {team.station.length > 0 && (
                    <ul className="flex flex-col gap-1 text-sm">
                      {team.station.map((s) => (
                        <li key={s.id} className="text-[color:var(--color-muted)] font-semibold">
                          {t("pinsetup.pin.item", { n: s.idx + 1 })}
                          {s.hint ? ` — „${s.hint}"` : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {done ? (
                  <div className="bs-panel p-4 text-center flex flex-col gap-3">
                    <p className="font-display text-2xl text-[color:var(--color-green)]">
                      {t("pinsetup.team.done", { name: team.name ?? "" })}
                    </p>
                    {game.team.length > 1 && (
                      <button
                        onClick={() => switchTeam((activeTeam + 1) % game.team.length)}
                        className="bs-btn bs-btn--blue"
                      >
                        {t("pinsetup.nextTeam")}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bs-panel p-4 flex flex-col gap-4">
                    <p className="font-display text-lg text-[color:var(--color-cyan)]">
                      {t("pinsetup.pin.of", { n: team.station.length + 1, total: target })}
                    </p>
                    {captureFields}
                    {capture && (
                      <button
                        onClick={saveStation}
                        disabled={!formValid || saving}
                        className="bs-btn bs-btn--green text-lg"
                      >
                        {saving ? t("pinsetup.saving") : t("pinsetup.pin.save")}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
