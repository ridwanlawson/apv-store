import { cache } from "react";
import { headers } from "next/headers";
import { getBrand, type BrandConfig } from "@/brands";

// Resolusi brand runtime (server): host -> baris brands (aktif) -> BrandConfig.
// Tanpa coding: brand baru dari /super langsung tayang begitu domain dipasang.
// Urutan: domain persis > subdomain slug > env NEXT_PUBLIC_BRAND > seed.
export interface BrandRow {
  id: string;
  name: string;
  slug: string;
  template: string;
  currency: string;
  domain: string;
  active: boolean;
  config: Record<string, unknown> | null;
}

const DEFAULTS = {
  tagline: "",
  contact: "",
  bg: "#0A0A0A",
  fg: "#EDEAE4",
  muted: "#1A1816",
  accent: "#C1121F",
};

export function brandFromRow(row: BrandRow): BrandConfig {
  const c = (row.config ?? {}) as Record<string, unknown>;
  const colors = (c.colors ?? {}) as Record<string, string>;
  const hero = (c.hero ?? {}) as Record<string, string>;
  const socials = (c.socials ?? {}) as Record<string, string>;
  return {
    id: row.id,
    name: row.name || row.id,
    slug: row.slug || row.id,
    tagline: (c.tagline as string) ?? DEFAULTS.tagline,
    domain: row.domain || undefined,
    active: row.active,
    template: row.template === "minimal" ? "minimal" : "brutal",
    colors: {
      bg: colors.bg ?? DEFAULTS.bg,
      fg: colors.fg ?? DEFAULTS.fg,
      muted: colors.muted ?? DEFAULTS.muted,
      accent: colors.accent ?? DEFAULTS.accent,
    },
    fonts: { display: "Anton", body: "Inter" },
    currency: row.currency || "USD",
    lang: "en",
    contact: (c.contact as string) ?? DEFAULTS.contact,
    whatsapp: (c.whatsapp as string) ?? undefined,
    announcement: (c.announcement as string) ?? undefined,
    socials,
    hero: {
      headline: hero.headline ?? row.name,
      sub: hero.sub ?? "",
      cta: hero.cta ?? "Shop",
      poster: (c.poster as string) ?? "",
    },
    seo: {
      title: (c.seoTitle as string) ?? `${row.name} — Worldwide`,
      description: (c.seoDescription as string) ?? "",
    },
    shippingOrigin: (c.shippingOrigin as string) ?? "ID",
    paymentRefs: { stripePrefix: row.id.slice(0, 3) },
    sequence: c.sequence as string | undefined,
    logo: c.logo as string | undefined,
    logoFull: c.logoFull as string | undefined,
    favicon: c.favicon as string | undefined,
  };
}

async function fetchActiveBrands(): Promise<BrandRow[]> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!base.startsWith("http") || key.length <= 20) return [];
  const res = await fetch(
    `${base}/rest/v1/brands?select=id,name,slug,template,currency,domain,active,config&active=eq.true&order=name`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` }, next: { revalidate: 60 } }
  );
  if (!res.ok) return [];
  return (await res.json()) as BrandRow[];
}

export interface ResolvedBrand {
  brand: BrandConfig;
  /** false = domain custom tak dikenal / brand nonaktif -> tampilkan halaman nonaktif. */
  known: boolean;
}

export const resolveBrand = cache(async (): Promise<ResolvedBrand> => {
  const envId = process.env.NEXT_PUBLIC_BRAND ?? "a-private-violence";
  const fallback = { brand: getBrand(envId), known: true };
  try {
    const host = ((await headers()).get("host") ?? "").split(":")[0].toLowerCase();
    const vercelish = host.endsWith(".vercel.app") || host === "localhost" || /^[\d.]+$/.test(host);
    const rows = await fetchActiveBrands();
    if (!vercelish) {
      const hit =
        rows.find((r) => r.domain.toLowerCase() === host) ??
        rows.find((r) => host.startsWith(`${r.slug}.`));
      if (hit) return { brand: brandFromRow(hit), known: true };
      return { brand: getBrand(envId), known: false };
    }
    if (rows.length > 0) {
      const env = rows.find((r) => r.id === envId);
      if (env) return { brand: brandFromRow(env), known: true };
    }
  } catch {
    /* fallback seed */
  }
  return fallback;
});
