"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "@/lib/cart";
import { Price, money, useCurrency } from "@/lib/currency";
import { categoryForProduct } from "@/lib/sizeguide";
import { SizeGuideModal } from "./SizeGuideModal";
import { type Product } from "@/lib/products";

// Quick-view modal: gallery + size + add-to-cart. ponytail: no 3D lib, spin = swipe images.
export function ProductModal({ p, onClose }: { p: Product | null; onClose: () => void }) {
  const { add } = useCart();
  const cur = useCurrency();
  const [guide, setGuide] = useState(false);
  const [img, setImg] = useState(0);
  const [size, setSize] = useState<string>(p?.sizes[1] ?? p?.sizes[0] ?? "M");
  const [added, setAdded] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!p) return null;
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-6"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} role="dialog" aria-modal="true" aria-label={p.name}>
        <motion.div onClick={(e) => e.stopPropagation()}
          initial={{ y: 60, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="grid max-h-[92vh] w-full max-w-3xl grid-cols-1 overflow-auto rounded-t-2xl bg-[#141210] sm:grid-cols-2 sm:rounded-2xl">
          <div className="relative aspect-[3/4] bg-black">
            <Image key={img} src={p.images[img % p.images.length]} alt={`${p.name} view ${img + 1}`} fill className="object-cover" sizes="50vw" />
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
              {p.images.map((_, i) => (
                <button key={i} onClick={() => setImg(i)} aria-label={`View ${i + 1}`}
                  className={`h-2 w-2 rounded-full cursor-pointer ${i === img % p.images.length ? "bg-white" : "bg-white/40"}`} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs tracking-widest opacity-60">{p.badge}</p>
                <h2 className="font-display text-2xl tracking-wide">{p.name.toUpperCase()}</h2>
                <p className="text-sm opacity-60">{p.fabric} · {p.type === "pod" ? "Printed on demand, ships locally" : `Limited stock Indonesia${p.stockQty != null ? ` · ${p.stockQty} left` : ""}`}</p>
              </div>
              <button onClick={onClose} aria-label="Close" className="rounded-full border border-white/20 px-3 py-1 cursor-pointer hover:bg-white/10">✕</button>
            </div>
            <p className="text-xl font-bold"><Price usdAmount={p.priceUsd} /></p>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs tracking-widest opacity-60">SIZE</p>
                <button onClick={() => setGuide(true)} className="text-xs underline underline-offset-4 opacity-70 hover:opacity-100 cursor-pointer">Size guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {p.sizes.map((s) => (
                  <button key={s} onClick={() => setSize(s)}
                    className={`min-h-[44px] min-w-[44px] rounded-lg border px-3 cursor-pointer transition ${s === size ? "border-white bg-white text-black font-bold" : "border-white/20 hover:border-white/60"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => {
              add({ slug: p.slug, name: p.name, price: p.priceUsd, image: p.images[0], size, qty: 1 });
              setAdded(true); setTimeout(() => { setAdded(false); onClose(); }, 700);
            }} className="mt-auto min-h-[48px] rounded-xl bg-white font-bold text-black cursor-pointer hover:opacity-90">
              {added ? "Added ✓" : `Add to cart — ${money(p.priceUsd, cur)}`}
            </motion.button>
            <p className="text-xs opacity-50">Worldwide: Economy 10–20 days · Express 3–7 days. Duties (DDU) by buyer.</p>
          </div>
        </motion.div>
      </motion.div>
      <SizeGuideModal open={guide} category={categoryForProduct(p.name)} onClose={() => setGuide(false)} />
    </AnimatePresence>
  );
}
