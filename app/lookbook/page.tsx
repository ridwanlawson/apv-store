"use client";
import Image from "next/image";
import { useVisibleProducts } from "@/lib/store";
import { mainImage } from "@/lib/products";

export default function Lookbook() {
  const list = useVisibleProducts().slice(0, 9);
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-5xl">LOOKBOOK</h1>
      <p className="opacity-60">Sample frames — replace with real shoot + 6s Kling clips.</p>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        {list.map((p) => (
          <div key={p.id} className="relative aspect-[3/4] overflow-hidden rounded-xl">
            <Image src={mainImage(p)} alt={p.name} fill className="object-cover" sizes="33vw" loading="lazy" />
          </div>
        ))}
      </div>
    </main>
  );
}
