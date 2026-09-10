"use client";
import { useState } from "react";
import { useProductStore, toCSV, useMounted } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { listOrders } from "@/lib/orders";
import { BrandForm } from "@/components/admin/BrandForm";
import { ProductEditor } from "@/components/admin/ProductEditor";
import type { Product } from "@/lib/products";

// Brand-admin: tambah/edit produk + stok via UI (persisten localStorage;
// colok Supabase via lib/supabase.ts + Auth asli saat env tersedia — tanpa ubah UI).
export default function Admin() {
  const { user, mode, demoLogin, magicLink, logout } = useAuth();
  const { items, setItems } = useProductStore();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("45");
  const [type, setType] = useState<"pod" | "stock">("pod");
  const [stock, setStock] = useState("20");
  const [tab, setTab] = useState<"products" | "orders" | "brand">("products");
  const [editing, setEditing] = useState<string | null>(null);
  const mounted = useMounted();
  const orders = tab === "orders" && mounted ? listOrders() : [];
  const orderCount = mounted ? listOrders().length : 0;

  // Tunggu mount agar SSR/client sama (auth dibaca dari browser).
  if (!mounted || !user) {
    return (
      <main className="mx-auto max-w-sm px-4 py-20">
        <h1 className="font-display text-3xl">ADMIN LOGIN</h1>
        <p className="text-sm opacity-60">
          {mode === "demo" ? "Demo mode: any email logs in. Isi Supabase env untuk Auth asli." : "Login via magic link ke email admin."}
        </p>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="admin@brand.com" aria-label="Admin email"
          className="mt-4 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 outline-none focus:border-white/50" />
        {err && <p role="alert" className="mt-2 text-sm text-red-400">{err}</p>}
        <button onClick={() => {
          if (mode === "demo") {
            if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) { setErr("Enter a valid email."); return; }
            demoLogin(email);
          } else {
            setErr("");
            magicLink(email).then(() => setErr("Check your email for the login link.")).catch(() => setErr("Magic link failed."));
          }
        }} className="mt-3 w-full rounded-xl bg-white py-3 font-bold text-black cursor-pointer">
          {mode === "demo" ? "Enter demo admin" : "Send magic link"}
        </button>
      </main>
    );
  }
  const addProduct = () => {
    const clean = name.trim();
    const num = Number(price);
    if (!clean || !Number.isFinite(num) || num <= 0) return;
    const slug = `${clean.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now().toString(36)}`;
    const p: Product = {
      id: slug, brandId: "a-private-violence", name: clean, slug, priceUsd: Math.round(num),
      weightG: 300, type, stockQty: type === "stock" ? Math.max(0, Number(stock) || 0) : undefined,
      podSku: type === "pod" ? `APV-${Date.now().toString(36).toUpperCase()}` : undefined,
      images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80"],
      sizes: ["S", "M", "L", "XL"], colors: ["Black"], fabric: "Cotton",
      badge: type === "pod" ? "POD Worldwide" : "Limited Indonesia",
      isSample: false, published: true,
    };
    setItems((prev) => [p, ...prev]);
    setName("");
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-xs opacity-50">{user.email} · {user.role} · {mode} mode · <button onClick={logout} className="underline cursor-pointer">Logout</button></p>
      <div className="mt-2 flex gap-2" role="tablist" aria-label="Admin sections">
        {(["products", "orders", "brand"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={`rounded-full border px-4 py-1.5 text-sm capitalize cursor-pointer ${tab === t ? "border-white bg-white font-bold text-black" : "border-white/20"}`}>
            {t === "brand" ? "Tampilan" : t} {t === "orders" && `(${orderCount})`}
          </button>
        ))}
      </div>
      {tab === "brand" ? (
        <div className="mt-6"><BrandForm /></div>
      ) : tab === "orders" ? (
        <div className="mt-6 flex flex-col gap-3">
          {orders.length === 0 && <p className="opacity-60">No orders yet — checkout dari /cart untuk test.</p>}
          {orders.map((o) => (
            <div key={o.orderId} className="rounded-xl border border-white/10 p-4 text-sm">
              <p><b>{o.orderId}</b> <span className="opacity-50">· {o.email} · {o.lane} · ${o.total}</span></p>
              <p className="mt-1 opacity-70">{o.items.map((i) => `${i.name} ×${i.qty} (${i.size})`).join(", ")}</p>
            </div>
          ))}
          <p className="text-xs opacity-50">Lokal (browser ini). Live: orders masuk Supabase + email otomatis.</p>
        </div>
      ) : (
      <>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">PRODUCTS ({items.filter((i) => i.published).length})</h1>
        <div className="flex gap-2 text-sm">
          <button
            onClick={() => {
              const blob = new Blob([toCSV(items)], { type: "text/csv" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = "products.csv";
              a.click();
            }}
            className="rounded-lg border border-white/20 px-3 py-2 cursor-pointer"
          >
            Export CSV
          </button>
          <button onClick={() => setItems((p) => p.filter((i) => !i.isSample))} className="rounded-lg border border-red-400/50 px-3 py-2 cursor-pointer">Purge samples</button>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 p-4">
        <p className="font-bold">+ Add product</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_120px_130px_100px_auto]">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name, e.g. Riot Tee" aria-label="Product name" className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-white/50" />
          <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="numeric" aria-label="Price USD" className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-white/50" />
          <select value={type} onChange={(e) => setType(e.target.value as "pod" | "stock")} aria-label="Type" className="rounded-lg border border-white/15 bg-black px-3 py-2.5">
            <option value="pod">POD</option>
            <option value="stock">Stock</option>
          </select>
          <input value={stock} onChange={(e) => setStock(e.target.value)} inputMode="numeric" aria-label="Stock qty" disabled={type !== "stock"} className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-white/50 disabled:opacity-40" />
          <button onClick={addProduct} className="rounded-lg bg-white px-4 font-bold text-black cursor-pointer">Add</button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {items.map((p) => (
          <div key={p.id}>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 p-3 text-sm">
              <div className="flex-1"><b>{p.name}</b> <span className="opacity-50">· ${p.priceUsd} · {p.type}{p.type === "stock" ? ` · stock ${p.stockQty}` : ""} · {p.images.length} foto {p.isSample ? "· SAMPLE" : ""}</span></div>
              <button onClick={() => setEditing((e) => (e === p.id ? null : p.id))}
                className="rounded-lg border border-white/20 px-3 py-1.5 cursor-pointer" aria-label={`Edit ${p.name}`}>Edit</button>
              <button onClick={() => setItems((prev) => prev.map((x) => (x.id === p.id ? { ...x, published: !x.published } : x)))}
                className="rounded-lg border border-white/20 px-3 py-1.5 cursor-pointer">{p.published ? "Unpublish" : "Publish"}</button>
              {p.type === "stock" && (
                <button onClick={() => setItems((prev) => prev.map((x) => (x.id === p.id ? { ...x, stockQty: (x.stockQty ?? 0) + 1 } : x)))}
                  className="rounded-lg border border-white/20 px-3 py-1.5 cursor-pointer" aria-label={`Restock ${p.name}`}>+1</button>
              )}
              {!p.isSample && (
                <button onClick={() => setItems((prev) => prev.filter((x) => x.id !== p.id))}
                  className="rounded-lg border border-red-400/40 px-3 py-1.5 cursor-pointer" aria-label={`Delete ${p.name}`}>Delete</button>
              )}
            </div>
            {editing === p.id && (
              <div className="mt-2">
                <ProductEditor p={p}
                  onSave={(np) => { setItems((prev) => prev.map((x) => (x.id === p.id ? np : x))); setEditing(null); }}
                  onCancel={() => setEditing(null)} />
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs opacity-50">Persisten di browser (localStorage). Production: hubungkan Supabase via lib/supabase.ts — UI tidak berubah. Stock decrement atomic di DB (supabase/schema.sql).</p>
      </>
      )}
    </main>
  );
}
