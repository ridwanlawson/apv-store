"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { useBrand } from "@/lib/brand-store";
import { type Product, mainImage } from "@/lib/products";
import { useVisibleProducts } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Reveal } from "@/components/Reveal";
import { ProductCard } from "@/components/ProductCard";
import { ProductModal } from "@/components/ProductModal";
import { ScrollSequence } from "@/components/ScrollSequence";

export default function Home() {
  const b = useBrand();
  const t = useT();
  const [quick, setQuick] = useState<Product | null>(null);
  const visible = useVisibleProducts();
  const drop = visible.slice(0, 6);
  const story = visible[2] ?? visible[0];

  return (
    <main>
      {/* SCROLL-3D fullscreen paling atas (frame dari config brand) */}
      {b.sequence ? (
        <ScrollSequence seq={b.sequence} frames={120} ext="webp" headline={b.hero.headline} sub={b.hero.sub} />
      ) : (
        <section className="flex min-h-[92vh] items-end px-4 pb-16 pt-24">
          <div className="mx-auto w-full max-w-6xl">
            <h1 className="font-display text-[13vw] leading-[0.9] sm:text-7xl">{b.hero.headline}</h1>
            <p className="mt-3 max-w-xl opacity-80">{b.hero.sub}</p>
            <Link href="/shop" className="mt-6 inline-block rounded-xl bg-white px-6 py-3.5 font-bold text-black">{b.hero.cta}</Link>
          </div>
        </section>
      )}

      {/* MARQUEE */}
      <div className="overflow-hidden border-y border-white/10 bg-[#C1121F] py-2 font-display tracking-widest text-white" aria-hidden>
        <div className="marquee flex w-max gap-8 whitespace-nowrap">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i}>{b.name.toUpperCase()} · WORLDWIDE · LIMITED ·&nbsp;</span>
          ))}
        </div>
      </div>

      {/* HORIZONTAL DROP */}
      <section className="mx-auto max-w-6xl px-4 py-16" aria-label="Latest drop">
        <Reveal className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-4xl">{t("dropTitle")}</h2>
            <p className="opacity-60">{t("dropSub")}</p>
          </div>
          <Link href="/shop" className="text-sm underline underline-offset-4">{t("viewAll")}</Link>
        </Reveal>
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2">
          {drop.map((p) => (
            <div key={p.id} className="w-[240px] shrink-0 snap-start sm:w-[280px]">
              <ProductCard p={p} onQuickView={setQuick} />
            </div>
          ))}
        </div>
      </section>

      {/* STICKY STORY */}
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-2">
        <div className="md:sticky md:top-20 md:self-start">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
            <Image src={story ? mainImage(story) : b.hero.poster} alt="On-body fit" fill className="object-cover" sizes="50vw" loading="lazy" />
          </div>
        </div>
        <div className="flex flex-col gap-10">
          {[
            [t("storyT1"), t("storyD1")],
            [t("storyT2"), t("storyD2")],
            [t("storyT3"), t("storyD3")],
          ].map(([title, desc]) => (
            <Reveal key={title}>
              <h3 className="font-display text-3xl">{title}</h3>
              <p className="mt-2 opacity-70">{desc}</p>
            </Reveal>
          ))}
          <Reveal>
            <motion.div whileHover={{ scale: 1.02 }} className="rounded-2xl p-[1px]" style={{ background: "linear-gradient(135deg,#C1121F,#5b0b12)" }}>
              <Link href="/shop" className="block rounded-2xl bg-black px-6 py-5 text-center font-bold">{t("storyCta")}</Link>
            </motion.div>
          </Reveal>
        </div>
      </section>

      <ProductModal key={quick?.id ?? "none"} p={quick} onClose={() => setQuick(null)} />
    </main>
  );
}
