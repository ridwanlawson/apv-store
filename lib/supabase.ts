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

/** Simpan order dengan id eksplisit. Return id.
 * return=minimal + id client: SELECT pasca-insert ditolak RLS (PII). */
export async function saveOrder(row: Record<string, unknown>, id?: string): Promise<string> {
  if (!supabaseConfigured()) return `LOCAL-${Date.now().toString(36).toUpperCase()}`;
  const finalId =
    id ??
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `LOCAL-${Date.now().toString(36).toUpperCase()}`);
  const res = await fetch(`${URL}/rest/v1/orders`, {
    method: "POST",
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ ...row, id: finalId }),
  });
  if (!res.ok) {
    const err = new Error(`Supabase ${res.status}`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return finalId;
}

/** Kurangi stok atomik via RPC (patch-003). Throw 409 bila stok kurang. */
export async function decrementStock(brand: string, slug: string, qty: number): Promise<void> {
  const res = await fetch(`${URL}/rest/v1/rpc/decrement_stock`, {
    method: "POST",
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_brand: brand, p_slug: slug, p_qty: qty }),
  });
  if (res.status === 409 || res.status === 400) {
    const err = new Error("insufficient stock") as Error & { stock?: boolean };
    err.stock = true;
    throw err;
  }
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
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
  compare_at_usd: number | null;
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
    compareAt: r.compare_at_usd ?? undefined,
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
    compare_at_usd: p.compareAt ?? null,
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
  status: string;
  tracking: string;
}

/** Baca order terbaru untuk admin. */
export async function fetchOrders(brandId: string): Promise<DbOrderRow[] | null> {
  if (!supabaseConfigured() || !getSession()) return null;
  try {
    return await readJson(
      `orders?brand_id=eq.${encodeURIComponent(brandId)}&select=id,email,items,total_usd,lane,status,tracking,created_at&order=created_at.desc&limit=100`
    );
  } catch {
    return null;
  }
}

/** Update status/tracking order (admin). */
export async function updateOrder(id: string, patch: { status?: string; tracking?: string }): Promise<void> {
  const res = await rest(`orders?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
}

export interface Discount { code: string; percent: number; active: boolean }

/** Promo aktif (publik — untuk validasi checkout). */
export async function fetchPromo(code: string): Promise<Discount | null> {
  if (!supabaseConfigured() || !code) return null;
  try {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    const res = await fetch(
      `${base}/rest/v1/discounts?code=eq.${encodeURIComponent(code.toUpperCase().trim())}&select=code,percent,active&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as Discount[];
    return rows[0] && rows[0].active ? rows[0] : null;
  } catch {
    return null;
  }
}

/** Semua promo untuk admin. */
export async function fetchDiscounts(): Promise<Discount[] | null> {

  if (!supabaseConfigured() || !getSession()) return null;
  try {
    return await readJson(`discounts?select=code,percent,active&order=code`);
  } catch {
    return null;
  }
}

/** Simpan promo (admin). */
export async function upsertDiscount(d: Discount): Promise<void> {
  const res = await rest("discounts", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ code: d.code.toUpperCase().trim(), percent: d.percent, active: d.active }),
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
}

/** Hapus promo (admin). */
export async function deleteDiscount(code: string): Promise<void> {
  const res = await rest(`discounts?code=eq.${encodeURIComponent(code)}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
}

export type DbHealth =
  | { state: "no-session" }
  | { state: "connected" }
  | { state: "denied"; code: number }
  | { state: "offline" };

/** Probe tulis/baca DB untuk indikator admin. Tidak throw. */
export async function probeDb(brandId: string): Promise<DbHealth> {
  if (!supabaseConfigured()) return { state: "offline" };
  if (!getSession()) return { state: "no-session" };
  try {
    const res = await rest(
      `products?brand_id=eq.${encodeURIComponent(brandId)}&select=id&limit=1`
    );
    if (res.ok) return { state: "connected" };
    if (res.status === 401 || res.status === 403) return { state: "denied", code: res.status };
    return { state: "offline" };
  } catch {
    return { state: "offline" };
  }
}

/* ---------- superadmin: kelola brand (butuh role superadmin, patch-005) ---------- */

export interface BrandAdminRow {
  id: string;
  name: string;
  slug: string;
  template: string;
  currency: string;
  domain: string;
  active: boolean;
  config: Record<string, unknown> | null;
}

/** Role user login (null = tamu). */
export async function fetchOwnRole(): Promise<string | null> {  if (!supabaseConfigured() || !getSession()) return null;
  try {
    const rows = await readJson<{ role: string }[]>(`profiles?select=role&limit=1`);
    return rows[0]?.role ?? null;
  } catch {
    return null;
  }
}

/** Daftar semua brand (butuh akses baca admin; publik hanya yang aktif). */
export async function fetchAllBrands(): Promise<BrandAdminRow[] | null> {
  if (!supabaseConfigured() || !getSession()) return null;
  try {
    return await readJson(`brands?select=id,name,slug,template,currency,domain,active,config&order=name`);
  } catch {
    return null;
  }
}

/** Buat brand baru (superadmin). */
export async function createBrandRow(row: {
  id: string; name: string; slug: string; template: string; currency: string;
  domain: string; active: boolean; config: Record<string, unknown>;
}): Promise<void> {
  const res = await rest("brands", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
}

/** Update brand (superadmin / brand_admin pemilik). */
export async function updateBrandRow(id: string, patch: Partial<{
  name: string; slug: string; template: string; currency: string;
  domain: string; active: boolean; config: Record<string, unknown>;
}>): Promise<void> {
  const res = await rest(`brands?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
}

/** Hapus brand (superadmin). Produk/order yatim tetap di DB (aman). */
export async function deleteBrandRow(id: string): Promise<void> {
  const res = await rest(`brands?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
}

/* ---------- superadmin: persetujuan akses ---------- */

export interface ProfileRow { user_id: string; email: string; role: string; brand_id: string | null }

/** Daftar semua akun (butuh role superadmin, patch-006). */
export async function fetchProfiles(): Promise<ProfileRow[] | null> {
  if (!supabaseConfigured() || !getSession()) return null;
  try {
    return await readJson(`profiles?select=user_id,email,role,brand_id&order=email`);
  } catch {
    return null;
  }
}

/** Ubah role akun (butuh role superadmin, patch-006). */
export async function setProfileRole(userId: string, role: string, brandId: string | null): Promise<void> {
  const res = await rest(`profiles?user_id=eq.${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify({ role, brand_id: brandId }),
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
}

/** Tolak akses = hapus baris (butuh role superadmin, patch-006). */
export async function deleteProfile(userId: string): Promise<void> {
  const res = await rest(`profiles?user_id=eq.${encodeURIComponent(userId)}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
}
