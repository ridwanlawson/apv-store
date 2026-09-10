"use client";
import { useEffect, useRef, useState } from "react";

const pad = (n: number) => String(n).padStart(5, "0");

// Scroll-scrub 3D: section pin 320vh, canvas sticky, frame = f(scroll).
// Frame 001–180 rotasi, 181–240 push/macro (lihat public/seq/FRAMES.md).
export function ScrollSequence({ seq, frames = 240 }: { seq: string; frames?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [reduced] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const frame = Math.min(frames, Math.max(1, Math.round(progress * (frames - 1)) + 1));

  // Muat frame progresif: 10 pertama langsung, sisanya idle (hemat bandwidth awal).
  // Cache dipakai ulang saat menggambar — tanpa banjir request saat scroll cepat.
  const cacheRef = useRef(new Map<number, HTMLImageElement>());
  useEffect(() => {
    cacheRef.current.clear();
    const cache = cacheRef.current;
    const load = (i: number) => {
      if (cache.has(i)) return cache.get(i)!;
      const img = new Image();
      img.src = `/seq/${seq}/${pad(i)}.png`;
      cache.set(i, img);
      return img;
    };
    for (let i = 1; i <= 10; i++) load(i);
    let i = 11;
    let stop = false;
    const pump = () => {
      if (stop) return;
      for (let k = 0; k < 8 && i <= frames; k++, i++) load(i);
      if (i <= frames) setTimeout(pump, 300);
    };
    const t = setTimeout(pump, 2000);
    return () => { stop = true; clearTimeout(t); };
  }, [seq, frames]);

  // Progress scroll -> state (rAF throttle).
  useEffect(() => {
    if (reduced) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const el = wrapRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const total = r.height - window.innerHeight;
        setProgress(Math.min(1, Math.max(0, -r.top / Math.max(1, total))));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced ]);

  // Gambar frame ke canvas (contain, dpr cap 1.5). Pakai cache bila sudah ada.
  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cached = cacheRef.current.get(frame);
    const img = cached ?? new Image();
    if (!cached) {
      img.src = `/seq/${seq}/${pad(frame)}.png`;
      cacheRef.current.set(frame, img);
    }
    const draw = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      const box = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(box.width * dpr));
      canvas.height = Math.max(1, Math.round(box.height * dpr));
      const ctx = canvas.getContext("2d");
      if (!ctx || !img.naturalWidth) return;
      const s = Math.min(canvas.width / img.width, canvas.height / img.height);
      const w = img.width * s, h = img.height * s;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    };
    if (img.complete && img.naturalWidth) draw();
    else img.onload = draw;
  }, [frame, seq, reduced]);

  const step = progress < 0.33 ? 0 : progress < 0.7 ? 1 : 2;
  const captions = [
    ["01", "FRONT", "Heavyweight tee, chest hit."],
    ["02", "360° SPIN", "Keep scrolling — every angle."],
    ["03", "MACRO WEAVE", "Tight knit. No see-through."],
  ][step];

  if (reduced) {
    return (
      <section aria-label="Product spin" className="px-4 py-16" style={{ background: "#EDEAE4", color: "#111" }}>
        <div className="mx-auto max-w-4xl text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/seq/${seq}/${pad(1)}.png`} alt="Tee front view" className="mx-auto rounded-2xl" loading="lazy" />
          <p className="mt-4 font-display text-3xl">360° SPIN — HEAVYWEIGHT TEE</p>
        </div>
      </section>
    );
  }

  return (
    <section ref={wrapRef} aria-label="Scroll to rotate product" className="relative" style={{ height: "320vh", background: "#EDEAE4", color: "#111" }}>
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        <div className="h-1 w-full bg-black/10">
          <div className="h-full bg-black transition-[width]" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <p className="pt-6 text-center text-xs font-bold tracking-[0.3em] opacity-60">SCROLL TO ROTATE</p>
        <canvas ref={canvasRef} className="mx-auto w-full max-w-5xl flex-1" aria-label={`Product view ${frame} of ${frames}`} role="img" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 pb-10 text-center" aria-live="polite">
          <p key={step} className="font-display text-4xl tracking-wide sm:text-6xl">
            <span className="mr-3 text-lg align-middle opacity-40">{captions[0]}</span>{captions[1]}
          </p>
          <p className="mt-1 text-sm opacity-60">{captions[2]}</p>
        </div>
      </div>
    </section>
  );
}
