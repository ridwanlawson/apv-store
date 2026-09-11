import { NextResponse } from "next/server";
import { products } from "@/lib/products";
import { saveOrder, decrementStock, supabaseConfigured } from "@/lib/supabase";

// Mock checkout (payment HOLD). Hardened like production:
// harga dihitung server, validasi ketat, rate-limit per IP,
// idempotencyKey (uuid) = orderId deterministik -> retry aman lintas instance.
// Stok: decrement atomik di DB DULU (patch-003), baru order dicatat.
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
const UUID = /^[0-9a-f-]{36}$/i;

interface ValidItem { slug: string; qty: number; size: string; price: number; stockSlug: string | null }

async function dbStockRow(slug: string): Promise<{ type: string; stock_qty: number } | null> {
  // Read publik (policy published=true). Gagal/offline -> null = skip decrement.
  if (!supabaseConfigured()) return null;
  try {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    const res = await fetch(
      `${base}/rest/v1/products?slug=eq.${encodeURIComponent(slug)}&select=type,stock_qty&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as { type: string; stock_qty: number }[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

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

  // orderId deterministik dari key (retry lintas instance aman).
  const key = typeof b.idempotencyKey === "string" && b.idempotencyKey.length >= 8 ? b.idempotencyKey.slice(0, 128) : null;
  const orderId = key && UUID.test(key)
    ? key
    : typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `MOCK-${Date.now().toString(36).toUpperCase()}`;
  const memHit = key ? seen.get(key) : undefined;
  if (memHit && Date.now() - memHit.at < 10 * 60_000) {
    return NextResponse.json({ orderId: memHit.orderId, total: memHit.total, deduped: true });
  }

  // 1. Validasi + harga server. compareAt TIDAK dipakai (display saja).
  let subtotal = 0;
  const valid: ValidItem[] = [];
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
      if (typeof i.size !== "string" || !p.sizes.includes(i.size)) {
        return NextResponse.json({ error: `Invalid size for ${p.slug}` }, { status: 400 });
      }
      if (p.type === "stock" && (p.stockQty ?? 0) < qty) {
        return NextResponse.json({ error: `Insufficient stock: ${p.name}` }, { status: 409 });
      }
      subtotal += p.priceUsd * qty;
      valid.push({ slug, qty, size: i.size, price: p.priceUsd, stockSlug: p.type === "stock" ? p.slug : null });
    } else {
      // Produk custom admin: nama disanitasi, harga dijepit. Tanpa cek stok DB (POD/lokal).
      const cname = typeof i.name === "string" ? i.name.replace(/[<>"']/g, "").slice(0, 80).trim() : "";
      const cprice = typeof i.price === "number" ? Math.round(i.price) : NaN;
      if (!cname || !Number.isFinite(cprice) || cprice < 1 || cprice > 999) {
        return NextResponse.json({ error: `Unknown product: ${slug}` }, { status: 400 });
      }
      const csize = typeof i.size === "string" ? i.size.slice(0, 10) : "M";
      subtotal += cprice * qty;
      valid.push({ slug, qty, size: csize, price: cprice, stockSlug: null });
    }
  }

  // 2. Decrement stok DB dulu (atomik). Gagal stok -> 409, order BELUM dibuat.
  for (const v of valid) {
    if (!v.stockSlug) continue;
    const row = await dbStockRow(v.stockSlug);
    if (!row || row.type !== "stock") continue; // tidak dikelola DB -> skip
    try {
      await decrementStock("a-private-violence", v.stockSlug, v.qty);
    } catch (e) {
      if ((e as Error & { stock?: boolean }).stock) {
        return NextResponse.json({ error: `Insufficient stock: ${v.slug}` }, { status: 409 });
      }
      // Gangguan DB non-stok -> lanjut (order tercatat, stok diverifikasi manual).
      console.error("[checkout:stock]", v.slug, e instanceof Error ? e.message : e);
    }
  }

  // 3. Catat order (idempotency_key unik di DB -> duplikat = dedupe).
  const ship = lane === "express" ? 32 : 14;
  const total = subtotal + ship;
  let finalId = orderId;
  try {
    finalId = await saveOrder(
      {
        brand_id: "a-private-violence",
        email: b.email,
        items: valid,
        total_usd: total,
        lane,
        provider: "mock",
        idempotency_key: key,
      },
      orderId.startsWith("MOCK-") ? undefined : orderId
    );
  } catch (e) {
    // Duplikat key = retry setelah sukses -> respons dedupe dengan total hitung-ulang.
    if ((e as Error & { status?: number }).status === 409) {
      if (key) seen.set(key, { orderId, total, at: Date.now() });
      const wa = `https://wa.me/?text=${encodeURIComponent(`Order ${orderId} $${total} via ${lane}`)}`;
      return NextResponse.json({ orderId, total, deduped: true, url: `/success?order=${orderId}&wa=${encodeURIComponent(wa)}` });
    }
    console.error("[checkout:db] save failed, MOCK fallback:", e instanceof Error ? e.message : e);
    finalId = `MOCK-${Date.now().toString(36).toUpperCase()}`;
  }
  if (key) seen.set(key, { orderId: finalId, total, at: Date.now() });
  const wa = `https://wa.me/?text=${encodeURIComponent(`Order ${finalId} $${total} via ${lane} (${valid.length} items)`)}`;
  return NextResponse.json({ orderId: finalId, total, url: `/success?order=${finalId}&wa=${encodeURIComponent(wa)}` });
}
