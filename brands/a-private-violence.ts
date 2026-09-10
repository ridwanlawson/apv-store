// White-label brand config. 1 file per brand. Copy _template.ts for a new brand.
// No brand name / hex may be hardcoded outside brands/ + public/brands/ (see brands/README.md).
export type BrandTemplate = "brutal" | "minimal";

export interface BrandConfig {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  domain?: string;
  subdomain?: string;
  template: BrandTemplate;
  colors: { bg: string; fg: string; muted: string; accent: string };
  fonts: { display: string; body: string };
  currency: string;
  lang: string;
  contact: string;
  socials: { instagram?: string; tiktok?: string };
  hero: { headline: string; sub: string; cta: string; poster: string };
  logo?: string; // emblem tengah navbar, mis. /brands/a-private-violence/logo.png
  sequence?: string; // folder di public/seq/<id>/ (scroll-3D), kosong = section disembunyikan
  seo: { title: string; description: string };
  shippingOrigin: string;
  paymentRefs: { stripePrefix: string; dokuMerchant?: string };
}

export const aPrivateViolence: BrandConfig = {
  id: "a-private-violence",
  name: "A Private Violence",
  slug: "a-private-violence",
  tagline: " Brutalist streetwear. Limited drops, worldwide.",
  template: "brutal",
  colors: { bg: "#0A0A0A", fg: "#EDEAE4", muted: "#1A1816", accent: "#C1121F" },
  fonts: { display: "Anton", body: "Inter" },
  currency: "USD",
  lang: "en",
  contact: "support@aprivateviolence.com",
  socials: { instagram: "https://instagram.com", tiktok: "https://tiktok.com" },
  hero: {
    headline: "WEAR THE NOISE",
    sub: "Heavyweight tees, hoodies & cargos. Designed dark, shipped worldwide.",
    cta: "Shop the drop",
    poster:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=80",
  },
  seo: {
    title: "A Private Violence — Brutalist Streetwear, Worldwide",
    description:
      "Limited streetwear drops: heavyweight tees, hoodies, cargos. POD + limited Indonesia stock, shipped worldwide.",
  },
  shippingOrigin: "ID",
  sequence: "tee-705",
  paymentRefs: { stripePrefix: "apv" },
};
