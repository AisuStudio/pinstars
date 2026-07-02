import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import type { CreateGamePayload } from "@/lib/types";

// POST /api/games — create a game with teams + players.
// Returns { gameId }. Pins/tasks are added in a later step.
export async function POST(req: Request) {
  let body: CreateGamePayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const code = (body.code ?? "").trim();
  const teams = Array.isArray(body.teams) ? body.teams : [];

  if (!name) return NextResponse.json({ error: "Name fehlt" }, { status: 400 });
  if (!code) return NextResponse.json({ error: "Code fehlt" }, { status: 400 });
  if (teams.length < 1 || teams.length > 2) {
    return NextResponse.json({ error: "1 oder 2 Teams nötig" }, { status: 400 });
  }
  for (const t of teams) {
    const players = (t.players ?? []).map((p) => p.trim()).filter(Boolean);
    if (players.length < 1) {
      return NextResponse.json(
        { error: "Jedes Team braucht mindestens 1 Spieler" },
        { status: 400 },
      );
    }
  }

  let db: ReturnType<typeof getServiceClient>;
  try {
    db = getServiceClient();
  } catch {
    return NextResponse.json(
      { error: "Serverkonfiguration fehlerhaft – bitte Admin kontaktieren" },
      { status: 500 },
    );
  }

  function dbError(raw: string | undefined, fallback: string): string {
    if (!raw) return fallback;
    if (raw.includes("fetch failed") || raw.includes("ENOTFOUND") || raw.includes("ECONNREFUSED")) {
      return "Datenbankverbindung fehlgeschlagen – bitte kurz warten und erneut versuchen";
    }
    return fallback;
  }

  const { data: game, error: gErr } = await db
    .from("game")
    .insert({ name, code, status: "setup" })
    .select("id")
    .single();
  if (gErr || !game) {
    return NextResponse.json(
      { error: dbError(gErr?.message, "Spiel konnte nicht angelegt werden") },
      { status: 500 },
    );
  }

  for (const t of teams) {
    const players = (t.players ?? []).map((p) => p.trim()).filter(Boolean);
    const { data: team, error: tErr } = await db
      .from("team")
      .insert({
        game_id: game.id,
        name: t.name?.trim() || null,
        member_count: players.length,
      })
      .select("id")
      .single();
    if (tErr || !team) {
      return NextResponse.json(
        { error: dbError(tErr?.message, "Team konnte nicht angelegt werden") },
        { status: 500 },
      );
    }
    const rows = players.map((name, i) => ({
      team_id: team.id,
      name,
      order_idx: i,
    }));
    const { error: pErr } = await db.from("player").insert(rows);
    if (pErr) {
      return NextResponse.json(
        { error: dbError(pErr.message, "Spieler konnten nicht gespeichert werden") },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ gameId: game.id });
}
