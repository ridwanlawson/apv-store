import type { MetadataRoute } from "next";
import { products } from "@/lib/products";

export default function sitemap(): MetadataRoute.Sitemap {
  // Urutan: env manual > domain produksi Vercel (gratis *.vercel.app) > .com final.
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://aprivateviolence.com");
  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/lookbook`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/size-guide`, changeFrequency: "monthly", priority: 0.5 },
    ...products.filter((p) => p.published).map((p) => ({
      url: `${base}/product/${p.slug}` as string,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
