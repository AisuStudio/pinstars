import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

// POST /api/games/[gameId]/reset
// Setzt den Fortschritt ALLER Teams des Spiels zurück (current_index = 0,
// current_player_idx = 0). Pins, Aufgaben, Mission und Ziel bleiben erhalten —
// so kann dasselbe Spiel beliebig oft neu gespielt werden.
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ gameId: string }> },
) {
  const { gameId } = await ctx.params;
  const db = getServiceClient();

  const { error } = await db
    .from("team")
    .update({ current_index: 0, current_player_idx: 0 })
    .eq("game_id", gameId); // scope → nur Teams dieses Spiels

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
