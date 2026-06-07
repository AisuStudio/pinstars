import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

// POST /api/games/[gameId]/mission
// Body: { teamId, mission }
// Speichert die Mission eines Teams. Scope: Team muss zum Spiel gehören.
export async function POST(
  req: Request,
  ctx: { params: Promise<{ gameId: string }> },
) {
  const { gameId } = await ctx.params;
  let body: { teamId?: string; mission?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { teamId } = body;
  if (!teamId) {
    return NextResponse.json({ error: "teamId fehlt" }, { status: 400 });
  }
  const mission = (body.mission ?? "").trim() || null;

  const db = getServiceClient();
  const { error } = await db
    .from("team")
    .update({ mission })
    .eq("id", teamId)
    .eq("game_id", gameId); // scope → nur Team aus diesem Spiel
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
