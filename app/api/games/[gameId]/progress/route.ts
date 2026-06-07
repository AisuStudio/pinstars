import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

// POST /api/games/[gameId]/progress
// Body: { teamId, current_index, current_player_idx? }
// Persists a team's play progress (so reload/lock resumes exactly).
export async function POST(
  req: Request,
  ctx: { params: Promise<{ gameId: string }> },
) {
  const { gameId } = await ctx.params;
  let body: {
    teamId?: string;
    current_index?: number;
    current_player_idx?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { teamId, current_index, current_player_idx } = body;
  if (!teamId || typeof current_index !== "number") {
    return NextResponse.json({ error: "teamId/current_index fehlt" }, { status: 400 });
  }

  const db = getServiceClient();
  const patch: Record<string, number> = { current_index };
  if (typeof current_player_idx === "number") {
    patch.current_player_idx = current_player_idx;
  }

  const { error } = await db
    .from("team")
    .update(patch)
    .eq("id", teamId)
    .eq("game_id", gameId); // scope → only own game's team
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
