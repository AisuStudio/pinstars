import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

type StationPayload = {
  teamId: string;
  idx: number;
  lat: number;
  lng: number;
  radius_m?: number;
  hint?: string;
  question: string;
  answers: string[];
  correct_idx: number;
};

// POST /api/games/[gameId]/stations — create one station + its task.
// Verifies the team belongs to this game (scoping → no cross-game writes).
export async function POST(
  req: Request,
  ctx: { params: Promise<{ gameId: string }> },
) {
  const { gameId } = await ctx.params;
  let body: StationPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { teamId, idx, lat, lng, question, answers, correct_idx } = body;
  if (!teamId || typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "teamId/lat/lng fehlt" }, { status: 400 });
  }
  if (!question?.trim()) {
    return NextResponse.json({ error: "Frage fehlt" }, { status: 400 });
  }
  const cleanAnswers = (answers ?? []).map((a) => a.trim());
  if (cleanAnswers.length !== 3 || cleanAnswers.some((a) => !a)) {
    return NextResponse.json({ error: "Genau 3 Antworten nötig" }, { status: 400 });
  }
  if (correct_idx < 0 || correct_idx > 2) {
    return NextResponse.json({ error: "Richtige Antwort wählen" }, { status: 400 });
  }

  const db = getServiceClient();

  // Scope check: team must belong to this game.
  const { data: team } = await db
    .from("team")
    .select("id")
    .eq("id", teamId)
    .eq("game_id", gameId)
    .single();
  if (!team) {
    return NextResponse.json({ error: "Team gehört nicht zum Spiel" }, { status: 403 });
  }

  const { data: station, error: sErr } = await db
    .from("station")
    .insert({
      team_id: teamId,
      idx,
      lat,
      lng,
      radius_m: body.radius_m ?? 18,
      hint: body.hint?.trim() || null,
    })
    .select("id")
    .single();
  if (sErr || !station) {
    return NextResponse.json(
      { error: sErr?.message ?? "Station konnte nicht gespeichert werden" },
      { status: 500 },
    );
  }

  const { error: tErr } = await db.from("task").insert({
    station_id: station.id,
    question: question.trim(),
    answers: cleanAnswers,
    correct_idx,
  });
  if (tErr) {
    return NextResponse.json({ error: tErr.message }, { status: 500 });
  }

  return NextResponse.json({ stationId: station.id });
}
