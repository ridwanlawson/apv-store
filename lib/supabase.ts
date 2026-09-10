// Optional Supabase backend (graceful fallback to local sample data).
// Isi NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY untuk live.
// Tanpa env: store memakai data lokal (lib/products.ts + localStorage override di /admin).
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseConfigured = () => URL.startsWith("http") && KEY.length > 20;

async function rest(path: string, init?: RequestInit) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  return res.json();
}

/** Ambil produk published sebuah brand. Fallback: null -> pakai lokal. */
export async function fetchProducts(brandId: string) {
  if (!supabaseConfigured()) return null;
  return rest(
    `products?brand_id=eq.${encodeURIComponent(brandId)}&published=eq.true&select=*&order=name`
  );
}

/** Simpan order. Return id. Fallback: id lokal.
 * Pakai return=minimal + id buatan client: SELECT pasca-insert ditolak RLS
 * (by design — email buyer = PII), jadi id di-generate di sini, bukan dibaca balik. */
export async function saveOrder(row: Record<string, unknown>): Promise<string> {
  if (!supabaseConfigured()) return `LOCAL-${Date.now().toString(36).toUpperCase()}`;
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `LOCAL-${Date.now().toString(36).toUpperCase()}`;
  // return=minimal: 201 tanpa body (parse JSON akan gagal) — cukup cek status.
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
