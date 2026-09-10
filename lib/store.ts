"use client";
// Product store 3 lapis: seed (SSR) < lokal (browser) < DB Supabase (server truth saat login).
// Tanpa sesi: perilaku lokal seperti sebelumnya. Dengan sesi: baca DB + tulis DB.
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { products as seed, type Product } from "./products";
import { fetchAllProducts, toProduct, upsertProduct, deleteProductRow, getSession } from "./supabase";

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

const KEY = "apv-products-v2"; // bump saat seed berubah agar cache lama terbuang

function load(): Product[] {
  try {
    if (typeof window === "undefined") return seed;
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as Product[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seed;
  } catch {
    return seed;
  }
}

export function useProductStore() {
  // Lazy init (SSR: seed, client: localStorage). Tanpa setState di effect.
  const [items, setItems] = useState<Product[]>(() =>
    typeof window === "undefined" ? seed : load()
  );
  const mounted = useMounted();
  const itemsRef = useRef<Product[]>(items);
  useEffect(() => {
    itemsRef.current = items;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage penuh -> abaikan */
    }
  }, [items]);
  // Sinkron dari DB sekali setelah mount bila ada sesi (admin login).
  // DB ada isi -> pakai DB. DB kosong -> bootstrap: dorong lokal ke DB (migrasi pertama).
  useEffect(() => {
    if (!mounted || !getSession()) return;
    fetchAllProducts(seed[0]?.brandId ?? "a-private-violence")
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
  }, [mounted]);
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
  const head = "name,slug,priceUsd,type,stockQty,podSku,sizes,colors,fabric,published";
  const rows = items.map((p) =>
    [p.name, p.slug, p.priceUsd, p.type, p.stockQty ?? "", p.podSku ?? "", p.sizes.join("|"), p.colors.join("|"), p.fabric, p.published]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [head, ...rows].join("\n");
}
