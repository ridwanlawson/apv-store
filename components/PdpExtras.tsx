"use client";
import Image from "next/image";
import Link from "next/link";
import { Price } from "@/lib/currency";
import { useT } from "@/lib/i18n";
import { getReviews, stars } from "@/lib/reviews";
import { Reveal } from "@/components/Reveal";
import type { Product } from "@/lib/products";

// PDP richness: video inline + stok real + review + UGC + cross-sell.
export function PdpExtras({ p, others }: { p: Product; others: Product[] }) {
  const t = useT();
  const r = getReviews(p.slug);
  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* VIDEO + STOCK */}
      <div className="grid gap-6 py-10 md:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl">{t("inMotion")}</h2>
          {p.video ? (
            <video src={p.video} controls playsInline preload="none" poster={p.images[0]}
              className="mt-3 aspect-video w-full rounded-2xl border border-white/10 bg-black" />
          ) : (
            <p className="mt-3 rounded-2xl border border-white/10 p-6 text-sm opacity-60">{t("videoSoon")}</p>
          )}
        </div>
        <div>
          <h2 className="font-display text-2xl">{t("pdpAvail")}</h2>
          {p.type === "stock" ? (
            <div className="mt-3 rounded-2xl border border-white/10 p-5">
              <p className="font-bold">{t("onlyLeft").replace("{n}", String(p.stockQty ?? 0))}</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-[#C1121F]" style={{ width: `${Math.min(100, Math.round(((p.stockQty ?? 0) / 40) * 100))}%` }} />
              </div>
              <p className="mt-2 text-sm opacity-60">{t("stockDesc")}</p>
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-white/10 p-5">
              <p className="font-bold">{t("madeToOrder")}</p>
              <p className="mt-2 text-sm opacity-60">{t("podDesc")}</p>
            </div>
          )}
          <div className="mt-3 rounded-2xl border border-white/10 p-5 text-sm">
            <p className="font-bold">{r.avg} {stars(r.avg)} <span className="font-normal opacity-60">· {r.count} {t("verified")}</span></p>
            <div className="mt-2 flex flex-col gap-1">
              {r.dist.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-6 opacity-60">{5 - i}★</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full bg-white/70" style={{ width: `${d}%` }} />
                  </div>
                  <span className="w-8 opacity-60">{d}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS */}
      <Reveal>
        <h2 className="font-display text-2xl">{t("reviews")}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {r.list.map((v, i) => (
            <figure key={i} className="rounded-2xl border border-white/10 p-5">
              <p className="text-sm tracking-widest text-amber-300" aria-label={`${v.rating} of 5 stars`}>{stars(v.rating)}</p>
              <figcaption className="mt-2 font-bold">{v.title}</figcaption>
              <blockquote className="mt-1 text-sm opacity-70">“{v.body}”</blockquote>
              <p className="mt-3 text-xs opacity-50">{v.name} · {v.country} · size {v.size} · verified buyer · sample</p>
            </figure>
          ))}
        </div>
      </Reveal>

      {/* UGC STRIP */}
      <div className="py-10">
        <h2 className="font-display text-2xl">{t("ugc")}</h2>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {others.slice(0, 4).map((o) => (
            <div key={o.id} className="relative aspect-square overflow-hidden rounded-xl">
              <Image src={o.images[0]} alt={`${o.name} on customer`} fill className="object-cover" sizes="25vw" loading="lazy" />
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs opacity-50">{t("ugcNote")}</p>
      </div>

      {/* CROSS-SELL */}
      <div className="pb-16">
        <h2 className="font-display text-2xl">{t("cross")}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {others.slice(0, 3).map((o) => (
            <Link key={o.id} href={`/product/${o.slug}`} className="flex items-center gap-3 rounded-2xl border border-white/10 p-3 hover:bg-white/5">
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg">
                <Image src={o.images[0]} alt={o.name} fill className="object-cover" sizes="100px" loading="lazy" />
              </div>
              <div className="text-sm">
                <p className="font-semibold">{o.name}</p>
                <p className="opacity-70"><Price usdAmount={o.priceUsd} /></p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
