"use client";
// Product store: sample bawaan + override admin di localStorage.
// Nanti: ganti isi hook ini dengan fetchProducts(brandId) dari lib/supabase.ts.
import { useEffect, useState, useSyncExternalStore } from "react";
import { products as seed, type Product } from "./products";

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
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage penuh -> abaikan */
    }
  }, [items]);
  return { items, setItems };
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
