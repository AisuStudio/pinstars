"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { distanceM, heatFor } from "@/lib/geo";
import { unlockAudio, playArrived, playCorrect, playWrong } from "@/lib/sound";
import { useT, LanguageSwitcher } from "@/lib/i18n";

const HEAT_KEY: Record<string, string> = {
  weit: "heat.weit",
  nah: "heat.nah",
  "ganz nah": "heat.ganzNah",
  DA: "heat.da",
};

const PlayMap = dynamic(() => import("@/components/PlayMap"), { ssr: false });

type Task = { id: string; question: string; answers: string[]; correct_idx: number };
type Station = {
  id: string;
  idx: number;
  lat: number;
  lng: number;
  radius_m: number;
  hint: string | null;
  task: Task[];
  isGoal?: boolean;
};
type Player = { id: string; name: string | null; order_idx: number };
type Team = {
  id: string;
  name: string | null;
  member_count: number | null;
  current_index: number;
  current_player_idx: number;
  mission: string | null;
  player: Player[];
  station: Station[];
};
type Game = {
  id: string;
  name: string;
  code: string;
  team: Team[];
  goal_lat: number | null;
  goal_lng: number | null;
  goal_radius_m: number | null;
  goal_hint: string | null;
  goal_question: string | null;
  goal_answers: string[] | null;
  goal_correct_idx: number | null;
};

export default function PlayPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const t = useT();
  const [game, setGame] = useState<Game | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [teamId, setTeamId] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);

  // live position
  const [me, setMe] = useState<[number, number] | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  // task answering
  const [taskOpen, setTaskOpen] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [replaying, setReplaying] = useState(false);

  const lsTeamKey = `pinstars:${gameId}:teamId`;
  const lsStartKey = `pinstars:${gameId}:started`;

  const load = useCallback(async () => {
    const res = await fetch(`/api/games/${gameId}`);
    const data = await res.json();
    if (!res.ok) return setLoadError(data.error ?? t("play.notFound"));
    const g: Game = data.game;
    g.team.forEach((t) => {
      t.station.sort((a, b) => a.idx - b.idx);
      t.player.sort((a, b) => a.order_idx - b.order_idx);
    });
    setGame(g);
  }, [gameId]);

  useEffect(() => {
    load();
    setTeamId(localStorage.getItem(lsTeamKey));
    setStarted(localStorage.getItem(lsStartKey) === "1");
  }, [load, lsTeamKey, lsStartKey]);

  const team = useMemo(
    () => game?.team.find((t) => t.id === teamId) ?? null,
    [game, teamId],
  );

  // Effective station list = the team's own pins + (optional) the shared goal
  // appended as a final pin for everyone.
  const hasGoal = game?.goal_lat != null && game?.goal_lng != null;
  const stations = useMemo<Station[]>(() => {
    if (!team) return [];
    const own = team.station;
    if (!game || game.goal_lat == null || game.goal_lng == null) return own;
    const goal: Station = {
      id: "goal",
      idx: own.length,
      lat: game.goal_lat,
      lng: game.goal_lng,
      radius_m: game.goal_radius_m ?? 18,
      hint: game.goal_hint,
      isGoal: true,
      task: game.goal_question
        ? [
            {
              id: "goal-task",
              question: game.goal_question,
              answers: game.goal_answers ?? [],
              correct_idx: game.goal_correct_idx ?? 0,
            },
          ]
        : [],
    };
    return [...own, goal];
  }, [team, game]);

  const ownTarget = team?.member_count ?? team?.station.length ?? 0;
  const target = ownTarget + (hasGoal ? 1 : 0);
  const done = !!team && team.current_index >= target;
  const station = stations[team?.current_index ?? -1] ?? null;
  const isGoalStation = !!station?.isGoal;

  // geolocation watch (only while actually playing)
  useEffect(() => {
    if (!started || !team || done) return;
    if (!("geolocation" in navigator)) {
      setGeoError(t("play.noGps"));
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setMe([pos.coords.latitude, pos.coords.longitude]);
        setAccuracy(pos.coords.accuracy);
        setGeoError(null);
      },
      (err) => {
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? t("play.geoPerm")
            : t("play.geoWeak"),
        );
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [started, team, done]);

  const dist =
    me && station ? distanceM(me[0], me[1], station.lat, station.lng) : null;
  const heat = dist != null && station ? heatFor(dist, station.radius_m) : null;
  const isDA = heat === "DA";

  // Voice line + chime the moment a pin is reached ("DA").
  const wasDA = useRef(false);
  useEffect(() => {
    if (isDA && !wasDA.current) playArrived();
    wasDA.current = isDA;
  }, [isDA]);

  function joinWithCode() {
    if (!game) return;
    if (codeInput.trim().toUpperCase() !== game.code.toUpperCase()) {
      setCodeError(t("play.wrongCode"));
      return;
    }
    setCodeError(null);
    if (game.team.length === 1) selectTeam(game.team[0].id);
  }
  function selectTeam(id: string) {
    unlockAudio();
    localStorage.setItem(lsTeamKey, id);
    setTeamId(id);
  }
  function startGame() {
    unlockAudio();
    localStorage.setItem(lsStartKey, "1");
    setStarted(true);
  }

  async function replay() {
    setReplaying(true);
    try {
      await fetch(`/api/games/${gameId}/reset`, { method: "POST" });
    } catch {
      /* ignore — local reset below still returns to lobby */
    }
    // Back to the lobby on this device (server reset all teams to index 0).
    localStorage.removeItem(lsStartKey);
    setStarted(false);
    setGame((g) =>
      g
        ? {
            ...g,
            team: g.team.map((tm) => ({
              ...tm,
              current_index: 0,
              current_player_idx: 0,
            })),
          }
        : g,
    );
    setReplaying(false);
  }

  async function answer() {
    if (picked == null || !station || !team) return;
    const correct = station.task[0]?.correct_idx;
    if (picked !== correct) {
      playWrong();
      setWrong(true);
      return;
    }
    // correct → advance
    playCorrect();
    setAdvancing(true);
    const newIndex = team.current_index + 1;
    try {
      await fetch(`/api/games/${gameId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: team.id, current_index: newIndex }),
      });
    } catch {
      /* keep going; server retry on next action */
    }
    setGame((g) =>
      g
        ? {
            ...g,
            team: g.team.map((t) =>
              t.id === team.id ? { ...t, current_index: newIndex } : t,
            ),
          }
        : g,
    );
    setTaskOpen(false);
    setPicked(null);
    setWrong(false);
    setAdvancing(false);
  }

  // ---------- render ----------
  if (loadError)
    return (
      <Center>
        <p className="text-[color:var(--color-red)] font-bold">{loadError}</p>
      </Center>
    );
  if (!game) return <Center><p className="text-[color:var(--color-muted)] font-bold">{t("play.loading")}</p></Center>;

  // JOIN: need code + team
  if (!team) {
    const codeOk = codeInput.trim().toUpperCase() === game.code.toUpperCase();
    return (
      <main className="hero-bg min-h-screen flex flex-col items-center justify-end p-6 pb-[8vh] gap-3">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        {game.team.length > 1 && codeOk ? (
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <p className="text-white font-bold text-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)]">
              {t("play.whichTeam")}
            </p>
            {game.team.map((t) => (
              <button key={t.id} onClick={() => selectTeam(t.id)} className="bs-btn bs-btn--blue">
                {t.name}
              </button>
            ))}
          </div>
        ) : (
          <>
            <input
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="CODE"
              className="bs-input font-display text-3xl tracking-[0.3em] text-center text-[color:var(--color-gold)] w-full max-w-xs"
            />
            {codeError && (
              <p className="text-white font-bold bg-[color:var(--color-red)] px-3 py-1 rounded-lg">
                {codeError}
              </p>
            )}
            <button onClick={joinWithCode} className="bs-btn text-xl w-full max-w-xs">
              {t("play.join")}
            </button>
          </>
        )}
      </main>
    );
  }

  // LOBBY
  if (!started && team.current_index === 0) {
    const players = team.player;
    const first = players[0];
    return (
      <Center>
        <div className="absolute top-4 right-4"><LanguageSwitcher /></div>
        <h1 className="bs-title text-4xl text-[color:var(--color-gold)]">{team.name}</h1>
        <p className="text-[color:var(--color-cyan-light)] font-bold">{t("play.lobby.meta", { pins: ownTarget, players: players.length })}</p>
        <div className="bs-panel p-4 flex flex-col gap-2 w-full max-w-xs">
          {players.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2 font-bold">
              <span className="bs-chip text-[color:var(--color-cyan)]">{i + 1}</span>
              <span>{p.name}</span>
            </div>
          ))}
        </div>
        {team.mission?.trim() && (
          <div className="bs-panel p-4 w-full max-w-xs flex flex-col gap-1 text-left">
            <span className="text-xs font-extrabold uppercase text-[color:var(--color-cyan-light)]">
              {t("play.lobby.mission")}
            </span>
            <p className="font-bold text-sm">{team.mission}</p>
          </div>
        )}
        {hasGoal && (
          <p className="text-[color:var(--color-muted)] font-bold text-sm">
            {t("play.lobby.goalNote")}
          </p>
        )}
        <p className="font-bold text-[color:var(--color-gold)]">
          {t("play.lobby.starts", { name: first?.name ?? "" })}
        </p>
        <button onClick={startGame} className="bs-btn bs-btn--green text-xl">{t("play.lobby.go")}</button>
      </Center>
    );
  }

  // DONE
  if (done) {
    return (
      <Center>
        <div className="text-6xl">🏆</div>
        <h1 className="bs-title text-4xl text-[color:var(--color-green)]">{t("play.done.title")}</h1>
        <p className="text-[color:var(--color-cyan-light)] font-bold max-w-xs">
          {t("play.done.text", { team: team.name ?? "", n: target })}
        </p>
        <button
          onClick={replay}
          disabled={replaying}
          className="bs-btn bs-btn--blue text-lg mt-2"
        >
          {replaying ? t("play.replayWait") : t("play.replay")}
        </button>
      </Center>
    );
  }

  // PLAY
  const currentPlayer = team.player[team.current_index % team.player.length];
  const turnName = isGoalStation ? t("play.allTogether") : currentPlayer?.name;
  return (
    <main className="min-h-screen flex flex-col">
      {/* top bar */}
      <div className="p-3 flex items-center justify-between gap-2">
        <div className="bs-stat">
          <div className="bs-stat__icon bg-[color:var(--color-pink)]">{isGoalStation ? "🏁" : "⭐"}</div>
          <div className="flex flex-col">
            <span className="bs-stat__label">{t("play.turn")}</span>
            <span className="bs-stat__value text-[color:var(--color-pink)]">{turnName}</span>
          </div>
        </div>
        <div className="bs-stat">
          <div className="bs-stat__icon bg-[color:var(--color-gold)]">{isGoalStation ? "🏁" : "📍"}</div>
          <div className="flex flex-col">
            <span className="bs-stat__label">{isGoalStation ? t("play.goal") : t("play.pin")}</span>
            <span className="bs-stat__value text-[color:var(--color-gold)]">
              {isGoalStation ? t("play.finale") : `${team.current_index + 1}/${target}`}
            </span>
          </div>
        </div>
      </div>

      {/* map */}
      <div className="flex-1 relative isolate mx-3 rounded-[16px] overflow-hidden border-[3px] border-black min-h-[40vh]">
        {station && (
          <PlayMap
            target={[station.lat, station.lng]}
            radiusM={station.radius_m}
            me={me}
            reveal={isDA}
          />
        )}
      </div>

      {/* status / DA */}
      <div className="p-3 flex flex-col gap-2">
        {geoError && <p className="text-center text-[color:var(--color-red)] font-bold text-sm">{geoError}</p>}
        {!isDA ? (
          <div className="bs-panel p-3 text-center flex flex-col gap-1">
            <span className="font-display text-3xl text-[color:var(--color-cyan)] uppercase">
              {heat ? t(HEAT_KEY[heat]) : t("play.searchGps")}
            </span>
            {dist != null && (
              <span className="text-[color:var(--color-muted)] font-bold text-sm">
                {t("play.distance", { d: Math.round(dist) })}
                {accuracy ? t("play.gpsAcc", { a: Math.round(accuracy) }) : ""}
              </span>
            )}
          </div>
        ) : (
          <div className="bs-panel p-3 text-center flex flex-col gap-2">
            <span className="font-display text-3xl text-[color:var(--color-green)]">
              {isGoalStation ? t("play.daGoal") : t("play.da")}
            </span>
            {station?.hint && (
              <span className="font-bold text-[color:var(--color-gold)]">💡 {station.hint}</span>
            )}
            <button
              onClick={() => { unlockAudio(); setTaskOpen(true); }}
              className="bs-btn bs-btn--green text-lg"
            >
              {isGoalStation ? t("play.solveLast") : t("play.solve")}
            </button>
          </div>
        )}
      </div>

      {/* task modal */}
      {taskOpen && station && (
        <div className="fixed inset-0 z-[2000] bg-black/60 flex items-end sm:items-center justify-center p-4">
          <div className="bs-panel p-5 w-full max-w-md flex flex-col gap-4">
            <p className="font-bold text-[color:var(--color-cyan-light)] text-sm">
              {t("play.turnOf", { name: turnName ?? "" })}
            </p>
            <h2 className="font-display text-2xl text-[color:var(--color-gold)]">
              {station.task[0]?.question}
            </h2>
            <div className="flex flex-col gap-2">
              {station.task[0]?.answers.map((a, i) => (
                <button
                  key={i}
                  onClick={() => { setPicked(i); setWrong(false); }}
                  className={`bs-btn ${picked === i ? "bs-btn--blue" : "bs-btn--ghost"} justify-start`}
                >
                  {String.fromCharCode(65 + i)}. {a}
                </button>
              ))}
            </div>
            {wrong && (
              <p className="text-center font-bold text-[color:var(--color-pink)]">
                {t("play.tryAgain")}
              </p>
            )}
            <button
              onClick={answer}
              disabled={picked == null || advancing}
              className="bs-btn bs-btn--green text-lg"
            >
              {advancing ? "…" : t("play.check")}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
      {children}
    </main>
  );
}
