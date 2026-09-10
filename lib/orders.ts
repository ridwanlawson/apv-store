"use client";
// Order lokal (pre-Supabase): checkout sukses -> tersimpan di browser,
// tampil di /admin tab Orders. Ganti dengan saveOrder() Supabase saat live.
export interface SavedOrder {
  orderId: string;
  email: string;
  lane: string;
  items: { slug: string; name: string; qty: number; size: string; price: number }[];
  total: number;
  at: number;
}

const KEY = "apv-orders-v1";

export function saveOrderLocal(o: SavedOrder) {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as SavedOrder[]) : [];
    list.unshift(o);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 200)));
  } catch {
    /* abaikan */
  }
}

export function listOrders(): SavedOrder[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as SavedOrder[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
