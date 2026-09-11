"use client";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { type Product, mainImage } from "@/lib/products";
import { Price } from "@/lib/currency";

export function ProductCard({ p, onQuickView }: { p: Product; onQuickView: (p: Product) => void }) {
  const reduce = useReducedMotion();
  return (
    <motion.article
      whileHover={reduce ? undefined : { y: -6 }}
      transition={{ duration: 0.25 }}
      className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
    >
      <button onClick={() => onQuickView(p)} className="block w-full cursor-pointer text-left" aria-label={`Quick view ${p.name}`}>
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image src={mainImage(p)} alt={p.name} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          {p.badge && (
            <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold tracking-wide">{p.badge}</span>
          )}
        </div>
      </button>
      <div className="flex items-center justify-between gap-2 p-3">
        <div>
          <h3 className="text-sm font-semibold"><Link href={`/product/${p.slug}`} className="hover:underline">{p.name}</Link></h3>
          <p className="text-xs opacity-60">{p.fabric}</p>
        </div>
        <p className="text-sm font-bold"><Price usdAmount={p.priceUsd} compareAt={p.compareAt} /></p>
      </div>
    </motion.article>
  );
}
