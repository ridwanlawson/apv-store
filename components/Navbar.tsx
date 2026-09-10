"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { CurrencySelector } from "@/lib/currency";

export function Navbar({ brandName, accent }: { brandName: string; accent: string }) {
  const { count } = useCart();
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4" aria-label="Main">
        <Link href="/" className="font-display text-lg tracking-widest" style={{ color: "var(--brand-fg)" }}>
          {brandName.toUpperCase()}
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <CurrencySelector />
          <Link href="/shop" className="hover:opacity-80">Shop</Link>
          <Link href="/lookbook" className="hidden sm:inline hover:opacity-80">Lookbook</Link>
          <Link href="/track-order" className="hidden sm:inline hover:opacity-80">Track</Link>
          {/* suppressHydrationWarning: count cart dari localStorage hanya ada di client */}
          <Link href="/cart" aria-label={`Cart, ${count} items`} suppressHydrationWarning className="rounded-full px-3 py-1.5 font-semibold text-black" style={{ background: accent }}>
            <span suppressHydrationWarning>Cart · {count}</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
