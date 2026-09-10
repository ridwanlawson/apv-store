import { NextResponse } from "next/server";
import { products } from "@/lib/products";
import { saveOrder } from "@/lib/supabase";

// Mock checkout (payment HOLD). Hardened like production:
// harga dihitung server (client tidak dipercaya), validasi ketat,
// rate-limit per IP, idempotency key anti double-charge.
const hits = new Map<string, number[]>();
const seen = new Map<string, { orderId: string; total: number; at: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 10;
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const b = body as { email?: unknown; lane?: unknown; items?: unknown; idempotencyKey?: unknown };
  if (typeof b.email !== "string" || !EMAIL.test(b.email) || b.email.length > 254) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  const lane = b.lane === "express" ? "express" : "economy";
  if (!Array.isArray(b.items) || b.items.length === 0 || b.items.length > 20) {
    return NextResponse.json({ error: "1–20 items required" }, { status: 400 });
  }
  let subtotal = 0;
  for (const it of b.items) {
    const i = it as { slug?: unknown; qty?: unknown; size?: unknown; name?: unknown; price?: unknown };
    const slug = typeof i.slug === "string" ? i.slug.slice(0, 120) : "";
    const qty = i.qty as number;
    if (!slug) return NextResponse.json({ error: "Item slug required" }, { status: 400 });
    if (!Number.isInteger(qty) || qty < 1 || qty > 9) {
      return NextResponse.json({ error: `Qty 1–9 for ${slug}` }, { status: 400 });
    }
    const p = products.find((x) => x.slug === slug && x.published);
    if (p) {
      // Produk seed: harga + size otoritatif dari server.
      if (typeof i.size !== "string" || !p.sizes.includes(i.size)) {
        return NextResponse.json({ error: `Invalid size for ${p.slug}` }, { status: 400 });
      }
      if (p.type === "stock" && (p.stockQty ?? 0) < qty) {
        return NextResponse.json({ error: `Insufficient stock: ${p.name}` }, { status: 409 });
      }
      subtotal += p.priceUsd * qty;
    } else {
      // Produk custom dari /admin (mode lokal, pre-Supabase): trust-but-verify —
      // nama disanitasi, harga dijepit 1–999. Saat Supabase live, blok ini diganti lookup DB.
      const cname = typeof i.name === "string" ? i.name.replace(/[<>"']/g, "").slice(0, 80).trim() : "";
      const cprice = typeof i.price === "number" ? Math.round(i.price) : NaN;
      if (!cname || !Number.isFinite(cprice) || cprice < 1 || cprice > 999) {
        return NextResponse.json({ error: `Unknown product: ${slug}` }, { status: 400 });
      }
      subtotal += cprice * qty;
    }
  }

  const key = typeof b.idempotencyKey === "string" && b.idempotencyKey.length >= 8 ? b.idempotencyKey.slice(0, 128) : null;
  if (key) {
    const hit = seen.get(key);
    if (hit && Date.now() - hit.at < 10 * 60_000) {
      return NextResponse.json({ orderId: hit.orderId, total: hit.total, deduped: true });
    }
  }

  const ship = lane === "express" ? 32 : 14;
  const total = subtotal + ship;
  // Simpan ke Supabase bila terkonfigurasi (butuh patch-001). Gagal -> fallback lokal.
  let orderId = `MOCK-${Date.now().toString(36).toUpperCase()}`;
  try {
    orderId = await saveOrder({
      brand_id: "a-private-violence",
      email: b.email,
      items: b.items,
      total_usd: total,
      lane,
      provider: "mock",
      idempotency_key: key,
    });
  } catch (e) {
    console.error("[checkout:db] save failed, MOCK fallback:", e instanceof Error ? e.message : e);
    /* pre-Supabase / RLS belum patch -> order tetap jalan via MOCK + localStorage */
  }
  if (key) seen.set(key, { orderId, total, at: Date.now() });
  const wa = `https://wa.me/?text=${encodeURIComponent(`Order ${orderId} $${total} via ${lane} (${b.items.length} items)`)}`;
  return NextResponse.json({ orderId, total, url: `/success?order=${orderId}&wa=${encodeURIComponent(wa)}` });
}
