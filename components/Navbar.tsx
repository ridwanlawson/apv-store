"use client";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { CurrencySelector } from "@/lib/currency";
import { LangSelector, useT } from "@/lib/i18n";

// Navbar 3 zona: kiri navigasi, tengah emblem brand, kanan utilitas.
export function Navbar({ brandName, accent, logo }: { brandName: string; accent: string; logo?: string }) {
  const { count } = useCart();
  const t = useT();
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur">
      <nav className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4" aria-label="Main">
        <div className="flex flex-1 items-center gap-5 text-sm tracking-wide">
          <Link href="/shop" className="py-2 hover:opacity-80">{t("navShop")}</Link>
          <Link href="/lookbook" className="hidden py-2 hover:opacity-80 md:inline">{t("navLook")}</Link>
          <Link href="/track-order" className="hidden py-2 hover:opacity-80 md:inline">{t("navTrack")}</Link>
        </div>
        <Link href="/" aria-label={brandName} className="absolute left-1/2 -translate-x-1/2 transition-transform duration-300 hover:scale-105">
          {logo ? (
            <Image src={logo} alt={`${brandName} emblem`} width={96} height={48} className="h-8 w-auto sm:h-10" priority />
          ) : (
            <span className="font-display text-base tracking-widest sm:text-lg" style={{ color: "var(--brand-fg)" }}>
              {brandName.toUpperCase()}
            </span>
          )}
        </Link>
        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
          <LangSelector />
          <span className="hidden sm:inline"><CurrencySelector /></span>
          {/* suppressHydrationWarning: count cart dari localStorage hanya ada di client */}
          <Link href="/cart" aria-label={`${t("navCart")}, ${count} items`} suppressHydrationWarning className="rounded-full px-2 py-1.5 text-xs font-semibold text-black sm:px-3 sm:text-sm" style={{ background: accent }}>
            <span suppressHydrationWarning>{t("navCart")} · {count}</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
