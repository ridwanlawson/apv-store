"use client";
import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

// ponytail: one smooth-scroll lib, no GSAP. Skip if prefers-reduced-motion.
// Admin/super pakai scroll native (tabel data butuh presisi, bukan mulus).
// Touch dibiarkan native agar scroll HP tidak dibajak.
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const plain = pathname === "/admin" || pathname === "/super";
  useEffect(() => {
    if (plain) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.12, smoothWheel: true });
    let raf = 0;
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, [plain, pathname]);
  return <>{children}</>;
}
