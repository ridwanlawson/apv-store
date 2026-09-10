"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useChips, useT } from "@/lib/i18n";

const pad = (n: number) => String(n).padStart(5, "0");

// Scroll-3D fullscreen: pin 340vh, canvas sticky, frame transparan = f(scroll).
// Frame awal–tengah rotasi, akhir push/macro (lihat public/seq/FRAMES.md).
export function ScrollSequence({
  seq,
  frames = 120,
  ext = "webp",
  headline,
  sub,
}: {
  seq: string;
  frames?: number;
  ext?: string;
  headline: string;
  sub: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [drawn, setDrawn] = useState(false);
  const [wide, setWide] = useState(false);
  const [reduced] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const t = useT();
  const chips = useChips(progress < 0.3 ? 0 : progress < 0.68 ? 1 : 2);
  const frame = Math.min(frames, Math.max(1, Math.round(progress * (frames - 1)) + 1));

  // Muat progresif: 12 pertama langsung, sisanya idle. Cache dipakai ulang saat gambar.
  const cacheRef = useRef(new Map<number, HTMLImageElement>());
  useEffect(() => {
    cacheRef.current.clear();
    const cache = cacheRef.current;
    const load = (i: number) => {
      if (cache.has(i)) return cache.get(i)!;
      const img = new Image();
      img.src = `/seq/${seq}/${pad(i)}.${ext}`;
      cache.set(i, img);
      return img;
    };
    for (let i = 1; i <= 12; i++) load(i);
    let i = 13;
    let stop = false;
    const pump = () => {
      if (stop) return;
      for (let k = 0; k < 10 && i <= frames; k++, i++) load(i);
      if (i <= frames) setTimeout(pump, 250);
    };
    const timer = setTimeout(pump, 1500);
    return () => { stop = true; clearTimeout(timer); };
  }, [seq, frames, ext]);

  // Progress scroll -> state (rAF throttle) + breakpoint desktop/mobile.
  useEffect(() => {
    if (reduced) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const updWide = () => setWide(mq.matches);
    updWide();
    mq.addEventListener("change", updWide);
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
    return () => {
      window.removeEventListener("scroll", onScroll);
      mq.removeEventListener("change", updWide);
    };
  }, [reduced]);

  // Gambar frame ke canvas (contain, dpr cap 1.5).
  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const drawW = wide;
    const cached = cacheRef.current.get(frame);
    const img = cached ?? new Image();
    if (!cached) {
      img.src = `/seq/${seq}/${pad(frame)}.${ext}`;
      cacheRef.current.set(frame, img);
    }
    const draw = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      const box = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(box.width * dpr));
      canvas.height = Math.max(1, Math.round(box.height * dpr));
      const ctx = canvas.getContext("2d");
      if (!ctx || !img.naturalWidth) return;
      // Desktop (landscape): contain — baju utuh. Mobile (portrait): cover — fullscreen.
      const s = drawW
        ? Math.min(canvas.width / img.width, canvas.height / img.height)
        : Math.max(canvas.width / img.width, canvas.height / img.height);
      const w = img.width * s, h = img.height * s;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
      setDrawn(true);
    };
    if (img.complete && img.naturalWidth) draw();
    else img.onload = draw;
  }, [frame, seq, ext, reduced, wide]);

  const step = progress < 0.3 ? 0 : progress < 0.68 ? 1 : 2;
  const titles = [t("step1t"), t("step2t"), t("step3t")];
  const descs = [t("step1d"), t("step2d"), t("step3d")];
  const heroOpacity = Math.max(0, 1 - progress / 0.1);

  if (reduced) {
    return (
      <section aria-label="Product spin" className="px-4 pb-16 pt-24" style={{ background: "#EDEAE4", color: "#111" }}>
        <div className="mx-auto max-w-4xl text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/seq/${seq}/${pad(1)}.${ext}`} alt="Tee front view" className="mx-auto rounded-2xl" loading="lazy" />
          <h1 className="mt-4 font-display text-5xl">{headline}</h1>
          <p className="mt-2 opacity-70">{sub}</p>
          <Link href="/shop" className="mt-6 inline-block rounded-xl bg-white px-6 py-3.5 font-bold text-black">{t("seqCta")}</Link>
        </div>
      </section>
    );
  }

  return (
    <section ref={wrapRef} aria-label="Scroll to rotate product" className="relative" style={{ height: "340vh", background: "#EDEAE4", color: "#111" }}>
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden supports-[height:100svh]:h-[100svh]">
        {/* studio sweep: pool bayangan lembut agar kaos hitam terbaca */}
        <div className="pointer-events-none absolute left-1/2 top-[16%] h-[62vmin] w-[86vmin] max-w-[720px] -translate-x-1/2 rounded-[50%] bg-black/[0.07] blur-2xl" />
        {/* poster behind canvas until first draw — cover, tanpa band */}
        {!drawn && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/seq/${seq}/${pad(1)}.${ext}`} alt="" aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full object-cover md:object-contain" />
        )}
        <canvas ref={canvasRef} className="w-full flex-1 drop-shadow-[0_24px_45px_rgba(0,0,0,0.35)]" aria-label={`Product view ${frame} of ${frames}`} role="img" />

        {/* headline overlay: panel frosted rapi kiri-atas, fade saat scroll */}
        <div className="pointer-events-none absolute inset-x-0 top-16 px-4 pt-4 transition-opacity sm:pt-6" style={{ opacity: heroOpacity }} aria-hidden={heroOpacity === 0}>
          <div className="mr-auto w-fit max-w-xl rounded-2xl border border-black/10 bg-[#EDEAE4]/85 p-4 text-left shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md sm:ml-[4vw] sm:p-6">
            <p className="mb-2 inline-block rounded-full bg-black px-3 py-1 text-[11px] font-bold tracking-[0.22em] text-[#EDEAE4]">{t("seqBadge")}</p>
            <h1 className="font-display text-4xl leading-[1.02] tracking-tight sm:text-6xl">{headline}</h1>
            <p className="mt-2 hidden max-w-md text-sm leading-relaxed opacity-75 sm:block">{sub}</p>
          </div>
        </div>

        {/* step info card */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-4 pb-5 sm:justify-start sm:pb-8 sm:pl-[8vw]" aria-live="polite">
          <div key={step} className="w-full max-w-md rounded-2xl border border-black/20 bg-[#141210]/95 p-4 text-[#EDEAE4] backdrop-blur sm:p-5">
            <p className="text-xs font-bold tracking-[0.3em] text-[#C1121F]">0{step + 1} — {titles[step]}</p>
            <p className="mt-1 font-display text-2xl tracking-wide">{titles[step]}</p>
            <p className="mt-1 text-sm opacity-70">{descs[step]}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {chips.map((c) => (
                <span key={c} className="rounded-full border border-white/20 px-2.5 py-1 text-[11px]">{c}</span>
              ))}
            </div>
            {step === 2 && (
              <Link href="/shop" className="pointer-events-auto mt-4 inline-block rounded-xl bg-white px-6 py-3 font-bold text-black hover:opacity-90">
                {t("seqCta")} →
              </Link>
            )}
          </div>
        </div>
        {/* progress di tepi bawah — selalu terlihat, tak makan space */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/10">
          <div className="h-full bg-[#C1121F] transition-[width]" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      </div>
    </section>
  );
}
