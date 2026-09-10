// Copy this file -> brands/<new-brand>.ts, fill it, set NEXT_PUBLIC_BRAND=<id>.
// Never hardcode brand strings/hex outside brands/ + public/brands/.
import type { BrandConfig } from "./a-private-violence";

export const template: BrandConfig = {
  id: "brand-id",
  name: "Brand Name",
  slug: "brand-id",
  tagline: "One-line tagline.",
  template: "minimal",
  colors: { bg: "#0A0A0A", fg: "#FAFAF9", muted: "#1A1816", accent: "#C1121F" },
  fonts: { display: "Anton", body: "Inter" },
  currency: "USD",
  lang: "en",
  contact: "support@example.com",
  socials: {},
  hero: {
    headline: "HEADLINE",
    sub: "Sub headline.",
    cta: "Shop now",
    poster:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
  },
  seo: { title: "Brand Name", description: "Short description." },
  shippingOrigin: "ID",
  paymentRefs: { stripePrefix: "brand" },
};
