"use client";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { CurrencySelector } from "@/lib/currency";
import { LangSelector, useT } from "@/lib/i18n";
import { useBrand } from "@/lib/brand-store";

// Navbar: desktop 1 baris 3 zona (emblem tengah) · mobile 2 baris, semua menu tampil.
// Brand dibaca dari store (bisa diubah via /admin tanpa coding).
export function Navbar() {
  const { count } = useCart();
  const t = useT();
  const b = useBrand();
  const accent = b.colors.accent;
  const emblem = (
    <Link href="/" aria-label={b.name} className="transition-transform duration-300 hover:scale-105">
      {b.logo ? (
        <Image src={b.logo} alt={`${b.name} emblem`} width={96} height={48} className="h-8 w-auto sm:h-10" priority />
      ) : (
        <span className="font-display text-base tracking-widest sm:text-lg" style={{ color: "var(--brand-fg)" }}>
          {b.name.toUpperCase()}
        </span>
      )}
    </Link>
  );
  const cartBtn = (
    /* suppressHydrationWarning: count cart dari localStorage hanya ada di client */
    <Link href="/cart" aria-label={`${t("navCart")}, ${count} items`} suppressHydrationWarning className="rounded-full px-2 py-1.5 text-xs font-semibold text-black sm:px-3 sm:text-sm" style={{ background: accent }}>
      <span suppressHydrationWarning>{t("navCart")} · {count}</span>
    </Link>
  );
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur">
      {/* MOBILE: baris 1 emblem+util, baris 2 semua menu scroll */}
      <nav className="px-4 sm:hidden" aria-label="Main mobile">
        <div className="relative flex h-14 items-center justify-between">
          <LangSelector />
          <div className="absolute left-1/2 -translate-x-1/2">{emblem}</div>
          {cartBtn}
        </div>
        <div className="no-scrollbar -mx-4 flex items-center gap-5 overflow-x-auto border-t border-white/10 px-4 py-2 text-sm tracking-wide">
          <Link href="/shop" className="whitespace-nowrap py-1 hover:opacity-80">{t("navShop")}</Link>
          <Link href="/lookbook" className="whitespace-nowrap py-1 hover:opacity-80">{t("navLook")}</Link>
          <Link href="/track-order" className="whitespace-nowrap py-1 hover:opacity-80">{t("navTrack")}</Link>
          <span className="ml-auto shrink-0"><CurrencySelector /></span>
        </div>
      </nav>
      {/* DESKTOP: 1 baris 3 zona */}
      <nav className="relative mx-auto hidden h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:flex" aria-label="Main">
        <div className="flex flex-1 items-center gap-5 text-sm tracking-wide">
          <Link href="/shop" className="py-2 hover:opacity-80">{t("navShop")}</Link>
          <Link href="/lookbook" className="py-2 hover:opacity-80">{t("navLook")}</Link>
          <Link href="/track-order" className="py-2 hover:opacity-80">{t("navTrack")}</Link>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2">{emblem}</div>
        <div className="flex flex-1 items-center justify-end gap-3">
          <LangSelector />
          <CurrencySelector />
          {cartBtn}
        </div>
      </nav>
    </header>
  );
}
