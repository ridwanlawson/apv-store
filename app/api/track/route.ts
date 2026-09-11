import { NextResponse } from "next/server";
import { supabaseConfigured } from "@/lib/supabase";

// Lacak order publik via track_token (uuid acak per order).
// Butuh SUPABASE_SERVICE_KEY di env server (Vercel). Tanpa itu -> 501,
// UI fallback ke order lokal browser. JANGAN expose service key ke client.
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token")?.trim() ?? "";
  if (token.length < 8 || token.length > 128 || /[<>"']/.test(token)) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const svc = process.env.SUPABASE_SERVICE_KEY ?? "";
  if (!supabaseConfigured() || !svc) {
    return NextResponse.json({ error: "Tracking unavailable" }, { status: 501 });
  }
  try {
    const res = await fetch(
      `${base}/rest/v1/orders?track_token=eq.${encodeURIComponent(token)}&select=id,items,total_usd,lane,status,tracking,created_at&limit=1`,
      {
        headers: { apikey: svc, Authorization: `Bearer ${svc}` },
        cache: "no-store",
      }
    );
    if (!res.ok) return NextResponse.json({ error: "Lookup failed" }, { status: 502 });
    const rows = (await res.json()) as Record<string, unknown>[];
    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch {
    return NextResponse.json({ error: "Lookup failed" }, { status: 502 });
  }
}
