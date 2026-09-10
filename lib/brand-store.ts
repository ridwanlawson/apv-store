"use client";
// Brand CMS: override config brand via UI (localStorage), merge di atas seed brands/*.ts.
// Nanti: row brands di Supabase — bentuk datanya sama, tinggal ganti load/save.
import { useEffect, useState } from "react";
import { getBrand, type BrandConfig } from "@/brands";
import { useMounted } from "./store";
import { fetchBrand, saveBrandRow, getSession } from "./supabase";

const KEY = "apv-brand-v1";

export type BrandOverride = Partial<{
  name: string;
  tagline: string;
  contact: string;
  logo: string;
  logoFull: string;
  favicon: string;
  colors: BrandConfig["colors"];
  hero: BrandConfig["hero"];
}>;

function load(): BrandOverride {
  try {
    if (typeof window === "undefined") return {};
    const raw = localStorage.getItem(KEY);
    const o = raw ? (JSON.parse(raw) as BrandOverride) : {};
    return o && typeof o === "object" ? o : {};
  } catch {
    return {};
  }
}

/** File gambar -> dataURL, di-downscale agar muat localStorage (~5MB). */
export function fileToDataUrl(file: File, maxSide = 512, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const s = Math.min(1, maxSide / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * s));
      const h = Math.max(1, Math.round(img.height * s));
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      c.getContext("2d")?.drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gambar tidak terbaca"));
    };
    img.src = url;
  });
}

/** Brand gabungan: seed < lokal < DB (server truth saat login). Seed dipakai saat SSR. */
export function useBrand(): BrandConfig {
  const mounted = useMounted();
  const [override, setOverride] = useState<BrandOverride>(() =>
    typeof window === "undefined" ? {} : load()
  );
  // Refresh saat admin menyimpan (tab yang sama) atau storage berubah (tab lain).
  useEffect(() => {
    const refresh = () => setOverride(load());
    window.addEventListener("apv-brand", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("apv-brand", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  // Sinkron dari DB sekali setelah mount bila ada sesi (admin login).
  useEffect(() => {
    if (!mounted || !getSession()) return;
    const seed = getBrand();
    fetchBrand(seed.id)
      .then((db) => {
        if (!db) return;
        setOverride((prev) => ({ ...prev, name: db.name, ...(db.config as BrandOverride) }));
      })
      .catch(() => { /* offline / belum ada akses -> tetap lokal */ });
  }, [mounted]);
  const seed = getBrand();
  if (!mounted) return seed;
  return {
    ...seed,
    ...override,
    colors: { ...seed.colors, ...(override.colors ?? {}) },
    hero: { ...seed.hero, ...(override.hero ?? {}) },
  };
}

/** Simpan patch override: ke DB bila login (server truth) + selalu ke lokal (backup).
 * Butuh patch-002 + profiles role, kalau tidak -> throw dengan pesan jelas. */
export async function saveBrand(patch: BrandOverride): Promise<void> {
  const next = { ...load(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    throw new Error("Penyimpanan lokal penuh — pakai URL gambar, bukan upload.");
  }
  if (getSession()) {
    const seed = getBrand();
    const { name, ...config } = next;
    try {
      await saveBrandRow(seed.id, name ?? seed.name, config);
    } catch {
      throw new Error("Gagal simpan ke Supabase (cek profiles role / patch-002). Lokal tersimpan.");
    }
  }
  try {
    window.dispatchEvent(new Event("apv-brand"));
  } catch {
    /* abaikan */
  }
}

export function resetBrand() {
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event("apv-brand"));
  } catch {
    /* abaikan */
  }
}
