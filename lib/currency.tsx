"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Display-only conversion (checkout tetap USD). Kurs statis + label estimasi —
// ganti dengan fetch kurs harian saat live.
export type Currency = "USD" | "IDR" | "EUR";
const RATES: Record<Currency, { rate: number; locale: string }> = {
  USD: { rate: 1, locale: "en-US" },
  IDR: { rate: 16200, locale: "id-ID" },
  EUR: { rate: 0.92, locale: "de-DE" },
};
const KEY = "apv-currency-v1";

const Ctx = createContext<{ cur: Currency; setCur: (c: Currency) => void } | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [cur, setCurState] = useState<Currency>(() => {
    if (typeof window === "undefined") return "USD";
    try {
      const v = localStorage.getItem(KEY);
      return v === "IDR" || v === "EUR" ? v : "USD";
    } catch {
      return "USD";
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(KEY, cur);
    } catch {
      /* abaikan */
    }
  }, [cur]);
  return <Ctx.Provider value={{ cur, setCur: setCurState }}>{children}</Ctx.Provider>;
}

export function useCurrency() {
  return useContext(Ctx)?.cur ?? "USD";
}

export function money(usdAmount: number, cur: Currency): string {
  const r = RATES[cur];
  const v = cur === "IDR" ? Math.round(usdAmount * r.rate / 500) * 500 : usdAmount * r.rate;
  return new Intl.NumberFormat(r.locale, {
    style: "currency",
    currency: cur,
    maximumFractionDigits: cur === "USD" || cur === "EUR" ? 0 : 0,
  }).format(v);
}

/** Display price dari USD. Pakai ini di semua halaman (bukan usd() langsung). */
export function Price({ usdAmount }: { usdAmount: number }) {
  const cur = useCurrency();
  return <>{money(usdAmount, cur)}</>;
}

export function CurrencySelector() {
  const ctx = useContext(Ctx);
  if (!ctx) return null;
  return (
    <select
      value={ctx.cur}
      onChange={(e) => ctx.setCur(e.target.value as Currency)}
      aria-label="Currency"
      className="cursor-pointer rounded-full border border-white/20 bg-transparent px-2 py-1.5 text-xs"
    >
      {(Object.keys(RATES) as Currency[]).map((c) => (
        <option key={c} value={c} className="bg-black">{c}</option>
      ))}
    </select>
  );
}
