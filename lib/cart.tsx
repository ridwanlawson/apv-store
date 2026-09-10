"use client";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface CartItem { slug: string; name: string; price: number; image: string; size: string; qty: number }

interface CartCtx {
  items: CartItem[];
  count: number;
  total: number;
  add: (i: CartItem) => void;
  remove: (slug: string, size: string) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "apv-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      if (typeof window === "undefined") return [];
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* storage full -> ignore */ }
  }, [items]);

  const value = useMemo<CartCtx>(() => ({
    items,
    count: items.reduce((a, i) => a + i.qty, 0),
    total: items.reduce((a, i) => a + i.qty * i.price, 0),
    add: (i) => setItems((prev) => {
      const k = prev.find((p) => p.slug === i.slug && p.size === i.size);
      if (k) return prev.map((p) => (p === k ? { ...p, qty: Math.min(9, p.qty + i.qty) } : p));
      return [...prev, i];
    }),
    remove: (slug, size) => setItems((prev) => prev.filter((p) => !(p.slug === slug && p.size === size))),
    clear: () => setItems([]),
  }), [items]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside provider");
  return c;
}
