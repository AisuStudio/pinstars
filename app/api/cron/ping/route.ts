import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getServiceClient();
  const { error } = await db.from("game").select("id").limit(1);

  if (error) {
    console.error("[cron/ping] Supabase unreachable:", error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  console.log("[cron/ping] Supabase alive");
  return NextResponse.json({ ok: true });
}
