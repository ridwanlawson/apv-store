"use client";
import Link from "next/link";
import { listBrands } from "@/brands";
import { useBrand } from "@/lib/brand-store";
import { supabaseConfigured } from "@/lib/supabase";
import { useVisibleProducts } from "@/lib/store";

// Superadmin Hub: status live per brand + jalan pintas.
// Multi-brand penuh (deploy per brand + domain) = fase aktivasi saat brand ke-2 bayar.
export default function Super() {
  const brands = listBrands();
  const live = useBrand();
  const products = useVisibleProducts();
  const db = supabaseConfigured();
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl">SUPERADMIN HUB</h1>
      <p className="text-sm opacity-60">1 brand live now, multi-brand ready (brand_id everywhere).</p>
      <div className="mt-6 flex flex-col gap-3">
        {brands.map((b) => (
          <div key={b.id} className="rounded-xl border border-white/10 p-4">
            <p className="font-bold">{live.name} <span className="opacity-50">· /{b.template} · {b.currency} · {b.shippingOrigin}</span></p>
            <p className="text-sm opacity-60">{live.seo.description}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full border border-white/20 px-3 py-1">Template: {b.template}</span>
              <span className="rounded-full border border-white/20 px-3 py-1">Payments: HOLD (mock)</span>
              <span className="rounded-full border border-white/20 px-3 py-1">DB: {db ? "● Supabase" : "○ lokal"}</span>
              <span className="rounded-full border border-white/20 px-3 py-1">Produk tampil: {products.length}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <Link href="/admin" className="rounded-lg bg-white px-4 py-2 font-bold text-black">Kelola brand →</Link>
              <Link href="/" className="rounded-lg border border-white/20 px-4 py-2">Lihat toko →</Link>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-white/10 p-4 text-sm opacity-70">
        <p className="font-bold">Aktivasi brand ke-2 (saat dibutuhkan)</p>
        <p className="mt-1">1. Copy brands/_template.ts → brands/&lt;id&gt;.ts + daftar di brands/index.ts ·
          2. ENV NEXT_PUBLIC_BRAND=&lt;id&gt; · 3. Deploy Vercel baru + domain ·
          4. Insert profiles role + seed katalog. Tanpa ubah komponen.</p>
      </div>
    </main>
  );
}
