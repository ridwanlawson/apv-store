// Supabase backend: publik baca katalog + checkout tulis order (anon),
// admin tulis/baca penuh via sesi Supabase Auth (patch-002).
// Tanpa env/sesi: fallback lokal (seed + localStorage).
import type { Product } from "./products";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const SESSION_KEY = "apv-session-v1";

export const supabaseConfigured = () => URL.startsWith("http") && KEY.length > 20;

interface Session { access: string; refresh?: string | null; email: string }

export function getSession(): Session | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function setSession(s: Session | null) {
  try {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* abaikan */
  }
}

function decodeExp(token: string): number {
  try {
    const p = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof p.exp === "number" ? p.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

/** Access token segar (refresh otomatis bila <60 detik). Null = anonim. */
async function freshAccess(): Promise<string | null> {
  const s = getSession();
  if (!s?.access) return null;
  if (decodeExp(s.access) > Date.now() + 60_000) return s.access;
  if (!s.refresh) return s.access; // kedaluwarsa tanpa refresh -> coba apa adanya
  try {
    const res = await fetch(`${URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: s.refresh }),
    });
    if (!res.ok) return s.access;
    const j = await res.json();
    const next: Session = { access: j.access_token, refresh: j.refresh_token ?? s.refresh, email: s.email };
    setSession(next);
    return next.access;
  } catch {
    return s.access;
  }
}

async function rest(path: string, init?: RequestInit, auth = true): Promise<Response> {
  const token = auth ? await freshAccess() : null;
  return fetch(`${URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${token ?? KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}

async function readJson<T>(path: string): Promise<T> {
  const res = await rest(path);
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  return res.json() as Promise<T>;
}

/* ---------- katalog publik ---------- */

/** Ambil produk published sebuah brand. Fallback: null -> pakai lokal. */
export async function fetchProducts(brandId: string): Promise<Record<string, unknown>[] | null> {
  if (!supabaseConfigured()) return null;
  try {
    return await readJson(
      `products?brand_id=eq.${encodeURIComponent(brandId)}&published=eq.true&select=*&order=name`
    );
  } catch {
    return null;
  }
}

/* ---------- checkout (anon) ---------- */

/** Simpan order. Return id. Fallback: id lokal.
 * return=minimal + id client: SELECT pasca-insert ditolak RLS (PII). */
export async function saveOrder(row: Record<string, unknown>): Promise<string> {
  if (!supabaseConfigured()) return `LOCAL-${Date.now().toString(36).toUpperCase()}`;
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `LOCAL-${Date.now().toString(36).toUpperCase()}`;
  const res = await fetch(`${URL}/rest/v1/orders`, {
    method: "POST",
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ ...row, id }),
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  return id;
}

/* ---------- admin (butuh sesi + profiles role, patch-002) ---------- */

export interface DbBrandRow {
  id: string;
  name: string;
  config: Record<string, unknown> | null;
}

/** Baca brand + config UI. Null = pakai lokal. */
export async function fetchBrand(brandId: string): Promise<{ name: string; config: Record<string, unknown> } | null> {
  if (!supabaseConfigured() || !getSession()) return null;
  try {
    const rows = await readJson<DbBrandRow[]>(
      `brands?id=eq.${encodeURIComponent(brandId)}&select=id,name,config&limit=1`
    );
    if (!rows[0]) return null;
    return { name: rows[0].name, config: rows[0].config ?? {} };
  } catch {
    return null;
  }
}

/** Simpan brand (nama + config UI). */
export async function saveBrandRow(brandId: string, name: string, config: Record<string, unknown>): Promise<void> {
  const res = await rest(`brands?id=eq.${encodeURIComponent(brandId)}`, {
    method: "PATCH",
    body: JSON.stringify({ name, config }),
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
}

export interface DbProductRow {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
  price_usd: number;
  weight_g: number;
  type: "pod" | "stock";
  pod_sku: string | null;
  stock_qty: number;
  images: string[];
  sizes: string[];
  colors: string[];
  fabric: string;
  badge: string;
  is_sample: boolean;
  published: boolean;
  video: string | null;
}

/** Baca SEMUA produk brand (termasuk unpublished) untuk admin. */
export async function fetchAllProducts(brandId: string): Promise<DbProductRow[] | null> {
  if (!supabaseConfigured() || !getSession()) return null;
  try {
    return await readJson(
      `products?brand_id=eq.${encodeURIComponent(brandId)}&select=*&order=name`
    );
  } catch {
    return null;
  }
}

export function toProduct(r: DbProductRow): Product {
  return {
    id: r.id,
    brandId: r.brand_id,
    name: r.name,
    slug: r.slug,
    priceUsd: r.price_usd,
    weightG: r.weight_g,
    type: r.type,
    stockQty: r.type === "stock" ? r.stock_qty : undefined,
    podSku: r.pod_sku ?? undefined,
    images: r.images?.length ? r.images : [],
    sizes: r.sizes?.length ? r.sizes : ["M"],
    colors: r.colors?.length ? r.colors : ["Black"],
    fabric: r.fabric ?? "",
    badge: r.badge ?? "",
    isSample: r.is_sample,
    published: r.published,
    video: r.video ?? undefined,
  };
}

export function toRow(p: Product): Record<string, unknown> {
  return {
    id: p.id,
    brand_id: p.brandId,
    name: p.name,
    slug: p.slug,
    price_usd: p.priceUsd,
    weight_g: p.weightG,
    type: p.type,
    pod_sku: p.podSku ?? null,
    stock_qty: p.stockQty ?? 0,
    images: p.images,
    sizes: p.sizes,
    colors: p.colors,
    fabric: p.fabric,
    badge: p.badge,
    is_sample: p.isSample,
    published: p.published,
    video: p.video ?? null,
  };
}

/** Upsert produk (insert bila id baru). Return id final (uuid untuk baris DB). */
export async function upsertProduct(p: Product): Promise<string> {
  const id = /^[0-9a-f-]{36}$/i.test(p.id)
    ? p.id
    : typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : p.id;
  const body = { ...toRow(p), id };
  const res = await rest("products", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  return id;
}

/** Hapus produk. */
export async function deleteProductRow(id: string): Promise<void> {
  const res = await rest(`products?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
}

export interface DbOrderRow {
  id: string;
  email: string;
  items: { slug: string; name?: string; qty: number; size: string; price?: number }[];
  total_usd: number;
  lane: string;
  created_at: string;
}

/** Baca order terbaru untuk admin. */
export async function fetchOrders(brandId: string): Promise<DbOrderRow[] | null> {
  if (!supabaseConfigured() || !getSession()) return null;
  try {
    return await readJson(
      `orders?brand_id=eq.${encodeURIComponent(brandId)}&select=id,email,items,total_usd,lane,created_at&order=created_at.desc&limit=100`
    );
  } catch {
    return null;
  }
}
