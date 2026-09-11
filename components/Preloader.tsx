"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useBrand } from "@/lib/brand-store";
import { useMounted } from "@/lib/store";

// Preloader emblem: sekali per load (CSS-only, tanpa state/effect).
// Sembunyi otomatis via animasi; fork admin/super + reduced-motion dilewati.
let booted = false;

export function Preloader() {
  const b = useBrand();
  const mounted = useMounted();
  const pathname = usePathname();
  if (!mounted || booted) return null;
  if (pathname === "/admin" || pathname === "/super") return null;
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return null;
  }
  return (
    <div
      className="boot-exit fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4"
      style={{ background: b.colors.bg }}
      onAnimationEnd={() => {
        booted = true;
      }}
      aria-hidden
    >
      <div className="boot-pop">
        {b.logo ? (
          <Image src={b.logo} alt="" width={160} height={80} className="h-16 w-auto" priority />
        ) : (
          <p className="font-display text-3xl tracking-widest">{b.name.toUpperCase()}</p>
        )}
      </div>
      <div className="h-px w-40 overflow-hidden bg-white/15">
        <div className="boot-bar h-full bg-[#C1121F]" />
      </div>
    </div>
  );
}
