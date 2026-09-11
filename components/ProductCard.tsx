"use client";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { type Product, mainImage } from "@/lib/products";
import { Price } from "@/lib/currency";

// Kartu ala LN store: hover ganti foto ke-2, badge sale, pills size inline.
export function ProductCard({ p, onQuickView }: { p: Product; onQuickView: (p: Product) => void }) {
  const reduce = useReducedMotion();
  const sale = p.compareAt && p.compareAt > p.priceUsd
    ? Math.round(((p.compareAt - p.priceUsd) / p.compareAt) * 100)
    : 0;
  return (
    <motion.article
      whileHover={reduce ? undefined : { y: -6 }}
      transition={{ duration: 0.25 }}
      className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
    >
      <button onClick={() => onQuickView(p)} className="block w-full cursor-pointer text-left" aria-label={`Quick view ${p.name}`}>
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image src={mainImage(p)} alt={p.name} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition-all duration-500 group-hover:scale-105" loading="lazy" />
          {p.images[1] && (
            <Image src={p.images[1]} alt="" aria-hidden fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" loading="lazy" />
          )}
          <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
            {p.badge && (
              <span className="rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold tracking-wide">{p.badge}</span>
            )}
            {sale > 0 && (
              <span className="rounded-full bg-[#C1121F] px-2.5 py-1 text-[11px] font-bold tracking-wide text-white">−{sale}%</span>
            )}
          </div>
        </div>
      </button>
      <div className="flex items-start justify-between gap-2 p-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold"><Link href={`/product/${p.slug}`} className="hover:underline">{p.name}</Link></h3>
          <p className="text-xs opacity-60">{p.fabric}</p>
          <p className="mt-1 text-[11px] tracking-wider opacity-50">{p.sizes.slice(0, 6).join(" · ")}</p>
        </div>
        <p className="shrink-0 text-sm font-bold"><Price usdAmount={p.priceUsd} compareAt={p.compareAt} /></p>
      </div>
    </motion.article>
  );
}
