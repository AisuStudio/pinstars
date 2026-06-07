import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

// GET /api/games/[gameId] — full game state, scoped to the (unguessable) id.
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ gameId: string }> },
) {
  const { gameId } = await ctx.params;
  const db = getServiceClient();

  const { data: game, error } = await db
    .from("game")
    .select(
      "id,name,code,status,created_at," +
        "goal_lat,goal_lng,goal_radius_m,goal_hint,goal_question,goal_answers,goal_correct_idx," +
        "team(id,name,member_count,current_index,current_player_idx,mission," +
        "player(id,name,order_idx)," +
        "station(id,idx,lat,lng,radius_m,hint,task(id,question,answers,correct_idx)))",
    )
    .eq("id", gameId)
    .single();

  if (error || !game) {
    return NextResponse.json({ error: "Spiel nicht gefunden" }, { status: 404 });
  }
  return NextResponse.json({ game });
}
