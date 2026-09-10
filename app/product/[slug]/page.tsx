"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { getProduct, products as seed } from "@/lib/products";
import { Price } from "@/lib/currency";
import { useMounted, useProductStore } from "@/lib/store";
import { categoryForProduct } from "@/lib/sizeguide";
import { SizeGuideModal } from "@/components/SizeGuideModal";
import { PdpExtras } from "@/components/PdpExtras";
import { AddToCart } from "./AddToCart";

// Client-side agar produk yang ditambah via /admin langsung punya halaman —
export default function PDP() {
  const { slug } = useParams<{ slug: string }>();
  const mounted = useMounted();
  const { items } = useProductStore();
  const [guide, setGuide] = useState(false);
  const catalog = mounted ? items : seed;
  const p = catalog.find((x) => x.slug === slug) ?? getProduct(slug);
  if (!p) return <main className="mx-auto max-w-6xl px-4 py-20"><p>Not found. <Link href="/shop" className="underline">Back to shop</Link></p></main>;
  const others = catalog.filter((x) => x.slug !== p.slug && x.published).slice(0, 4);
  return (
    <>
    <main className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        {p.images.map((src, i) => (
          <div key={i} className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10">
            <Image src={src} alt={`${p.name} ${i + 1}`} fill sizes="50vw" className="object-cover" priority={i === 0} />
          </div>
        ))}
      </div>
      <div className="md:sticky md:top-20 md:self-start">
        <p className="text-xs tracking-widest opacity-60">{p.badge}</p>
        <h1 className="font-display text-4xl">{p.name.toUpperCase()}</h1>
        <p className="mt-2 text-2xl font-bold"><Price usdAmount={p.priceUsd} /></p>
        <p className="mt-3 text-sm opacity-70">{p.fabric} · {p.weightG}g · {p.type === "pod" ? "Print-on-demand, ships from nearest hub" : "Limited stock, ships from Indonesia"}</p>
        <button onClick={() => setGuide(true)} className="mt-3 text-sm underline underline-offset-4 opacity-80 hover:opacity-100 cursor-pointer">
          Size guide — find your fit
        </button>
        <AddToCart slug={p.slug} name={p.name} price={p.priceUsd} image={p.images[0]} sizes={p.sizes} />
        <SizeGuideModal open={guide} category={categoryForProduct(p.name)} onClose={() => setGuide(false)} />
        <div className="mt-6 rounded-xl border border-white/10 p-4 text-sm opacity-80">
          <p className="font-bold">SHIPPING & RETURNS</p>
          <p className="mt-2">Shipping: Economy 10–20d · Express 3–7d. Duties (DDU) by buyer. Returns 30 days.</p>
        </div>
      </div>
    </main>
    <PdpExtras p={p} others={others} />
    </>
  );
}
