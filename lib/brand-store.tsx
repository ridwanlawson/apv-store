"use client";
// Brand CMS multi-brand: seed (TS) < lokal per-brand < DB Supabase.
// Brand aktif disuplai server via <BrandProvider initial> (resolusi domain).
// Tanpa provider (atau SSR): fallback seed env.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getBrand, type BrandConfig } from "@/brands";
import { useMounted } from "./store";
import { fetchBrand, saveBrandRow, getSession } from "./supabase";

const keyFor = (id: string) => `apv-brand-${id}`;
const LEGACY_KEY = "apv-brand-v1";

export type BrandOverride = Partial<{
  name: string;
  tagline: string;
  contact: string;
  whatsapp: string;
  announcement: string;
  logo: string;
  logoFull: string;
  favicon: string;
  colors: BrandConfig["colors"];
  hero: { headline: string; sub: string; cta: string };
}>;

function load(id: string): BrandOverride {
  try {
    if (typeof window === "undefined") return {};
    const raw = localStorage.getItem(keyFor(id)) ?? localStorage.getItem(LEGACY_KEY);
    const o = raw ? (JSON.parse(raw) as BrandOverride) : {};
    return o && typeof o === "object" ? o : {};
  } catch {
    return {};
  }
}

function merge(base: BrandConfig, override: BrandOverride): BrandConfig {
  return {
    ...base,
    ...override,
    colors: { ...base.colors, ...(override.colors ?? {}) },
    hero: { ...base.hero, ...(override.hero ?? {}) },
  };
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

const BrandCtx = createContext<BrandConfig | null>(null);

/** Disediakan layout (server) hasil resolveBrand(). */
export function BrandProvider({ initial, children }: { initial: BrandConfig; children: ReactNode }) {
  return <BrandCtx.Provider value={initial}>{children}</BrandCtx.Provider>;
}

/** Brand gabungan. Seed dipakai saat SSR/prerender. */
export function useBrand(): BrandConfig {
  const mounted = useMounted();
  const server = useContext(BrandCtx);
  const base = server ?? getBrand();
  const [override, setOverride] = useState<BrandOverride>(() =>
    typeof window === "undefined" ? {} : load(base.id)
  );
  // Refresh saat admin menyimpan (tab yang sama) atau storage berubah (tab lain).
  useEffect(() => {
    const refresh = () => setOverride(load(base.id));
    window.addEventListener("apv-brand", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("apv-brand", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [base.id]);
  // Sinkron dari DB sekali setelah mount bila ada sesi (admin login).
  useEffect(() => {
    if (!mounted || !getSession()) return;
    fetchBrand(base.id)
      .then((db) => {
        if (!db) return;
        setOverride((prev) => ({ ...prev, name: db.name, ...(db.config as BrandOverride) }));
      })
      .catch(() => { /* offline / belum ada akses -> tetap lokal */ });
  }, [mounted, base.id]);
  if (!mounted) return base;
  return merge(base, override);
}

/** Simpan patch override: ke DB bila login (server truth) + selalu ke lokal (backup).
 * Butuh patch-002 + profiles role, kalau tidak -> throw dengan pesan jelas. */
export async function saveBrand(patch: BrandOverride, brandId?: string): Promise<void> {
  const seed = getBrand();
  const id = brandId ?? seed.id;
  const next = { ...load(id), ...patch };
  try {
    localStorage.setItem(keyFor(id), JSON.stringify(next));
  } catch {
    throw new Error("Penyimpanan lokal penuh — pakai URL gambar, bukan upload.");
  }
  if (getSession()) {
    const { name, ...config } = next;
    try {
      await saveBrandRow(id, name ?? seed.name, config);
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

export function resetBrand(brandId?: string) {
  try {
    const seed = getBrand();
    localStorage.removeItem(keyFor(brandId ?? seed.id));
    localStorage.removeItem(LEGACY_KEY);
    window.dispatchEvent(new Event("apv-brand"));
  } catch {
    /* abaikan */
  }
}
