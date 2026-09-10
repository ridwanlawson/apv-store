"use client";
import { useMemo, useState } from "react";
import { type Product } from "@/lib/products";
import { useVisibleProducts } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";
import { ProductModal } from "@/components/ProductModal";
import { Reveal } from "@/components/Reveal";

type TypeFilter = "all" | "pod" | "stock";
type Sort = "featured" | "low" | "high" | "name";

export default function Shop() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [sort, setSort] = useState<Sort>("featured");
  const [quick, setQuick] = useState<Product | null>(null);
  const all = useVisibleProducts();

  const list = useMemo(() => {
    const out = all.filter(
      (p) =>
        (type === "all" || p.type === type) &&
        p.name.toLowerCase().includes(q.toLowerCase())
    );
    if (sort === "low") out.sort((a, b) => a.priceUsd - b.priceUsd);
    else if (sort === "high") out.sort((a, b) => b.priceUsd - a.priceUsd);
    else if (sort === "name") out.sort((a, b) => a.name.localeCompare(b.name));
    return out;
  }, [all, q, type, sort]);

  const pill = (active: boolean) =>
    `min-h-[40px] rounded-full border px-4 text-sm cursor-pointer ${active ? "border-white bg-white text-black font-bold" : "border-white/20 hover:border-white/60"}`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Reveal>
        <h1 className="font-display text-5xl">SHOP ALL</h1>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tees, hoodies, cargos…" aria-label="Search products"
            className="w-full max-w-md rounded-xl border border-white/15 bg-white/5 px-4 py-3 outline-none placeholder:text-white/40 focus:border-white/50" />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Filters">
          {(["all", "pod", "stock"] as TypeFilter[]).map((t) => (
            <button key={t} onClick={() => setType(t)} aria-pressed={type === t} className={pill(type === t)}>
              {t === "all" ? "All" : t === "pod" ? "POD Worldwide" : "Limited Stock"}
            </button>
          ))}
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort by"
            className="min-h-[40px] cursor-pointer rounded-full border border-white/20 bg-black px-4 text-sm">
            <option value="featured">Featured</option>
            <option value="low">Price ↑</option>
            <option value="high">Price ↓</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
      </Reveal>
      <p className="mt-4 text-sm opacity-50" aria-live="polite">{list.length} pieces</p>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        {list.map((p) => <ProductCard key={p.id} p={p} onQuickView={setQuick} />)}
      </div>
      {list.length === 0 && <p className="mt-10 opacity-60">Nothing matches. Try another keyword.</p>}
      <ProductModal key={quick?.id ?? "none"} p={quick} onClose={() => setQuick(null)} />
    </main>
  );
}
