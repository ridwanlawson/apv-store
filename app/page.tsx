"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { getBrand } from "@/brands";
import { useVisibleProducts } from "@/lib/store";
import { Reveal } from "@/components/Reveal";
import { ProductCard } from "@/components/ProductCard";
import { ProductModal } from "@/components/ProductModal";
import { ScrollSequence } from "@/components/ScrollSequence";
import type { Product } from "@/lib/products";

export default function Home() {
  const b = getBrand();
  const [quick, setQuick] = useState<Product | null>(null);
  const visible = useVisibleProducts();
  const drop = visible.slice(0, 6);
  const story = visible[2] ?? visible[0];

  return (
    <main>
      {/* HERO fullscreen */}
      <section className="relative flex min-h-[92vh] items-end overflow-hidden">
        <Image src={b.hero.poster} alt={`${b.name} hero`} fill priority className="kenburns object-cover opacity-60" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-16">
          <Reveal>
            <p className="mb-3 inline-block rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs tracking-[0.2em]">WORLDWIDE DROP 001</p>
            <h1 className="font-display text-[13vw] leading-[0.9] tracking-tight sm:text-7xl">{b.hero.headline}</h1>
            <p className="mt-3 max-w-xl text-base opacity-80 sm:text-lg">{b.hero.sub}</p>
            <div className="mt-6 flex gap-3">
              <Link href="/shop" className="rounded-xl bg-white px-6 py-3.5 font-bold text-black hover:opacity-90">{b.hero.cta}</Link>
              <a href="#spin" className="rounded-xl border border-white/30 px-6 py-3.5 hover:bg-white/10">See it in 3D ↓</a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SCROLL-3D (panggung terang, frame dari config brand) */}
      {b.sequence && (
        <div id="spin">
          <ScrollSequence seq={b.sequence} frames={240} />
        </div>
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
            <h2 className="font-display text-4xl">LATEST DROP</h2>
            <p className="opacity-60">Swipe sideways. Click a piece for quick view.</p>
          </div>
          <Link href="/shop" className="text-sm underline underline-offset-4">View all</Link>
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
            <Image src={story ? story.images[0] : b.hero.poster} alt="On-body fit" fill className="object-cover" sizes="50vw" loading="lazy" />
          </div>
        </div>
        <div className="flex flex-col gap-10">
          {[
            ["01 / HEAVY FABRIC", "240–400 GSM. No see-through, no shrink excuses. Wash-cold, hang-dry."],
            ["02 / TRUE FIT", "Model 178cm wears M. Size chart US/EU/Asia in cm+inch on every product."],
            ["03 / SHIPPED WORLDWIDE", "POD ships from US/EU hubs. Limited pieces fly from Indonesia. Track everything."],
          ].map(([t, d]) => (
            <Reveal key={t}>
              <h3 className="font-display text-3xl">{t}</h3>
              <p className="mt-2 opacity-70">{d}</p>
            </Reveal>
          ))}
          <Reveal>
            <motion.div whileHover={{ scale: 1.02 }} className="rounded-2xl p-[1px]" style={{ background: "linear-gradient(135deg,#C1121F,#5b0b12)" }}>
              <Link href="/shop" className="block rounded-2xl bg-black px-6 py-5 text-center font-bold">Shop best sellers →</Link>
            </motion.div>
          </Reveal>
        </div>
      </section>

      <ProductModal key={quick?.id ?? "none"} p={quick} onClose={() => setQuick(null)} />
    </main>
  );
}
