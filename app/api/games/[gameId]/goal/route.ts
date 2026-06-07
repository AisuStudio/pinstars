import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

type GoalPayload = {
  lat: number;
  lng: number;
  radius_m?: number;
  hint?: string;
  question: string;
  answers: string[];
  correct_idx: number;
};

// POST /api/games/[gameId]/goal — gemeinsames Ziel (finaler Pin für ALLE
// Teams) inkl. Aufgabe setzen. Wird direkt am Spiel gespeichert.
export async function POST(
  req: Request,
  ctx: { params: Promise<{ gameId: string }> },
) {
  const { gameId } = await ctx.params;
  let body: GoalPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { lat, lng, question, answers, correct_idx } = body;
  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "lat/lng fehlt" }, { status: 400 });
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
  const { error } = await db
    .from("game")
    .update({
      goal_lat: lat,
      goal_lng: lng,
      goal_radius_m: body.radius_m ?? 18,
      goal_hint: body.hint?.trim() || null,
      goal_question: question.trim(),
      goal_answers: cleanAnswers,
      goal_correct_idx: correct_idx,
    })
    .eq("id", gameId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
