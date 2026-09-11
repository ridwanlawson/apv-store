"use client";
// Product store 3 lapis: seed (SSR) < lokal (browser) < DB Supabase (server truth saat login).
// Tanpa sesi: perilaku lokal seperti sebelumnya. Dengan sesi: baca DB + tulis DB.
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { products as seed, type Product } from "./products";
import { fetchAllProducts, fetchProducts, toProduct, upsertProduct, deleteProductRow, getSession, type DbProductRow } from "./supabase";
import { useBrand } from "./brand-store";

/** true hanya setelah hydrate — pakai ini untuk render data client (anti hydration-mismatch). */
export function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

/** Daftar tampil: seed saat SSR/prerender, store admin setelah mount. Satu sumber untuk semua halaman. */
export function useVisibleProducts(): Product[] {
  const mounted = useMounted();
  const { items } = useProductStore();
  return (mounted ? items : seed).filter((p) => p.published);
}

const KEY = "apv-products-v2"; // legacy global (migrasi sekali ke per-brand)
const keyFor = (id: string) => `apv-products-${id}`;

function load(brandId: string, isSeedBrand: boolean): Product[] {
  try {
    if (typeof window === "undefined") return isSeedBrand ? seed : [];
    const raw =
      localStorage.getItem(keyFor(brandId)) ?? localStorage.getItem(KEY);
    if (!raw) return isSeedBrand ? seed : [];
    const parsed = JSON.parse(raw) as Product[];
    if (!Array.isArray(parsed) || parsed.length === 0) return isSeedBrand ? seed : [];
    // Adopsi cache global lama ke kunci per-brand.
    try {
      localStorage.setItem(keyFor(brandId), JSON.stringify(parsed));
    } catch {
      /* abaikan */
    }
    return parsed;
  } catch {
    return isSeedBrand ? seed : [];
  }
}

export function useProductStore() {
  const { id: brandId } = useBrand();
  const isSeedBrand = brandId === (seed[0]?.brandId ?? "a-private-violence");
  // Lazy init (SSR: seed brand / kosong). Tanpa setState di effect.
  const [items, setItems] = useState<Product[]>(() =>
    typeof window === "undefined" ? (isSeedBrand ? seed : []) : load(brandId, isSeedBrand)
  );
  const mounted = useMounted();
  const itemsRef = useRef<Product[]>(items);
  useEffect(() => {
    itemsRef.current = items;
    try {
      localStorage.setItem(keyFor(brandId), JSON.stringify(items));
    } catch {
      /* storage penuh -> abaikan */
    }
  }, [items, brandId]);
  // Sinkron dari DB sekali setelah mount.
  // Login (admin): semua baris; kosong -> bootstrap dorong lokal ke DB.
  // Publik (tanpa sesi): gabung katalog published DB (menang per slug) + lokal.
  useEffect(() => {
    if (!mounted) return;
    if (getSession()) {
      fetchAllProducts(brandId)
      .then((rows) => {
        if (rows && rows.length > 0) {
          setItems(rows.map(toProduct));
        } else {
          void Promise.all(
            itemsRef.current.map(async (p) => {
              try {
                const id = await upsertProduct(p);
                return { old: p.id, id };
              } catch {
                return { old: p.id, id: p.id };
              }
            })
          ).then((maps) => {
            const changed = maps.filter((m) => m.old !== m.id);
            if (changed.length > 0) {
              setItems((prev) =>
                prev.map((p) => {
                  const m = changed.find((c) => c.old === p.id);
                  return m ? { ...p, id: m.id } : p;
                })
              );
            }
          });
        }
      })
      .catch(() => { /* offline / belum ada akses -> tetap lokal */ });
    } else {
      // Publik: gabung katalog published DB di atas lokal (DB menang per slug).
      fetchProducts(brandId)
        .then((rows) => {
          if (!rows || rows.length === 0) return;
          const db = new Map(
            (rows as unknown as DbProductRow[]).map(toProduct).map((p) => [p.slug, p])
          );
          setItems((prev) => {
            const keep = prev.filter((p) => !db.has(p.slug));
            const merged = [...db.values(), ...keep];
            // Jangan timpa bila identik (hindari render loop).
            if (merged.length === prev.length && merged.every((m, i) => m.id === prev[i]?.id)) return prev;
            return merged;
          });
        })
        .catch(() => { /* offline -> tetap lokal/seed */ });
    }
  }, [mounted, brandId]);
  return { items, setItems };
}

/** Tulis produk ke DB bila login (best-effort). Return id final. */
export async function persistProduct(p: Product): Promise<string> {
  if (!getSession()) return p.id;
  return upsertProduct(p);
}

/** Hapus produk di DB bila login (best-effort). */
export async function removeProduct(id: string): Promise<void> {
  if (!getSession()) return;
  await deleteProductRow(id);
}

export function toCSV(items: Product[]): string {
  const head = "name,slug,priceUsd,compareAt,type,stockQty,podSku,sizes,colors,fabric,badge,weightG,video,published,images";
  const rows = items.map((p) =>
    [p.name, p.slug, p.priceUsd, p.compareAt ?? "", p.type, p.stockQty ?? "", p.podSku ?? "", p.sizes.join("|"), p.colors.join("|"), p.fabric, p.badge ?? "", p.weightG, p.video ?? "", p.published, p.images.join("|")]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [head, ...rows].join("\n");
}

/** Parse CSV hasil Export (format baru; format lama 10 kolom tetap dibaca). */
export function parseCSV(text: string, brandId: string): Product[] {
  const out: Product[] = [];
  const rows: string[][] = [];
  let cur = "", row: string[] = [], q = false;
  const pushCell = () => { row.push(cur); cur = ""; };
  for (let k = 0; k < text.length; k++) {
    const c = text[k];
    if (q) {
      if (c === '"') {
        if (text[k + 1] === '"') { cur += '"'; k++; }
        else q = false;
      } else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") pushCell();
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[k + 1] === "\n") k++;
      pushCell(); rows.push(row); row = [];
    } else cur += c;
  }
  if (cur !== "" || row.length > 0) { pushCell(); rows.push(row); }
  const data = rows.filter((r) => r.length > 1 && !/^name/i.test(r[0] ?? ""));
  const num = (v: string | undefined, fb: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fb;
  };
  const split = (v: string | undefined) => (v ?? "").split("|").map((s) => s.trim()).filter(Boolean);
  for (const r of data) {
    const isNew = r.length >= 15;
    const name = (r[0] ?? "").trim();
    if (!name) continue;
    const price = Math.round(num(r[2], 0));
    if (!(price >= 1)) continue;
    const type = r[4] === "stock" ? "stock" : "pod";
    const slugBase = (r[1] ?? "").trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const slug = `${slugBase}-${Date.now().toString(36)}${out.length}`;
    const sizes = split(r[7]);
    out.push({
      id: slug,
      brandId,
      name,
      slug,
      priceUsd: price,
      compareAt: isNew && r[3] ? Math.round(num(r[3], 0)) || undefined : undefined,
      weightG: Math.max(1, Math.round(num(isNew ? r[11] : undefined, 300))),
      type,
      stockQty: type === "stock" ? Math.max(0, Math.round(num(r[5], 0))) : undefined,
      podSku: type === "pod" ? (r[6] || `APV-${Date.now().toString(36).toUpperCase()}${out.length}`) : undefined,
      images: isNew ? split(r[14]).slice(0, 12) : [],
      video: isNew && r[12] ? r[12] : undefined,
      sizes: sizes.length ? sizes.slice(0, 10) : ["M"],
      colors: split(isNew ? r[8] : r[7]).slice(0, 10),
      fabric: (isNew ? r[9] : r[8]) || "Cotton",
      badge: isNew ? r[10] || "" : "",
      isSample: false,
      published: /^(true|1|ya|y)$/i.test((isNew ? r[13] : r[9]) ?? ""),
    });
  }
  return out;
}
