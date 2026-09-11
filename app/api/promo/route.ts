import { NextResponse } from "next/server";
import { fetchPromo } from "@/lib/supabase";

// Validasi kode promo live (untuk tampilan cart sebelum checkout).
export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code")?.trim() ?? "";
  if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });
  const promo = await fetchPromo(code);
  if (!promo) return NextResponse.json({ error: "Invalid or expired code." }, { status: 404 });
  return NextResponse.json({ code: promo.code, percent: promo.percent });
}
