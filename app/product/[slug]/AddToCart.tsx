"use client";
import { useState } from "react";
import { useCart } from "@/lib/cart";

export function AddToCart({ slug, name, price, image, sizes }: { slug: string; name: string; price: number; image: string; sizes: string[] }) {
  const { add } = useCart();
  const [size, setSize] = useState(sizes[1] ?? sizes[0]);
  const [ok, setOk] = useState(false);
  return (
    <div className="mt-5">
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
        {sizes.map((s) => (
          <button key={s} role="radio" aria-checked={s === size} onClick={() => setSize(s)}
            className={`min-h-[44px] min-w-[48px] rounded-lg border px-3 cursor-pointer ${s === size ? "bg-white text-black font-bold" : "border-white/20"}`}>{s}</button>
        ))}
      </div>
      <button onClick={() => { add({ slug, name, price, image, size, qty: 1 }); setOk(true); setTimeout(() => setOk(false), 900); }}
        className="mt-4 min-h-[52px] w-full rounded-xl bg-white font-bold text-black cursor-pointer hover:opacity-90">
        {ok ? "Added ✓" : "Add to cart"}
      </button>
    </div>
  );
}
