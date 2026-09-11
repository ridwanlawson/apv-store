"use client";
import { useEffect, useState } from "react";
import { useProductStore, toCSV, parseCSV, useMounted, persistProduct, removeProduct } from "@/lib/store";
import { useBrand } from "@/lib/brand-store";
import { useAuth } from "@/lib/auth";
import { listOrders } from "@/lib/orders";
import { fetchOrders, getSession, probeDb, type DbHealth, type DbOrderRow } from "@/lib/supabase";
import { BrandForm } from "@/components/admin/BrandForm";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { PromoManager } from "@/components/admin/PromoManager";
import { OrderCard } from "@/components/admin/OrderCard";
import type { Product } from "@/lib/products";

/** Strip statistik + stok menipis untuk CMS harian. */
function StatsStrip() {
  const { items } = useProductStore();
  const { id: brandId } = useBrand();
  const [orders, setOrders] = useState<{ total: number }[] | null>(null);
  useEffect(() => {
    let live = true;
    if (!getSession()) return;
    fetchOrders(brandId)
      .then((r) => { if (live) setOrders((r ?? []).map((o) => ({ total: o.total_usd }))); })
      .catch(() => { if (live) setOrders(null); });
    return () => { live = false; };
  }, [brandId]);
  const local = listOrders();
  const revenue = orders ? orders.reduce((a, o) => a + o.total, 0) : local.reduce((a, o) => a + o.total, 0);
  const nOrders = orders ? orders.length : local.length;
  const low = items.filter((p) => p.type === "stock" && p.published && (p.stockQty ?? 0) <= 5);
  const card = "rounded-xl border border-white/10 p-3";
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
      <div className={card}><p className="opacity-50">Revenue ({orders ? "DB" : "lokal"})</p><p className="text-xl font-bold">${revenue}</p></div>
      <div className={card}><p className="opacity-50">Orders</p><p className="text-xl font-bold">{nOrders}</p></div>
      <div className={card}><p className="opacity-50">Published</p><p className="text-xl font-bold">{items.filter((i) => i.published).length}/{items.length}</p></div>
      <div className={card}><p className="opacity-50">Stok menipis ≤5</p><p className="text-xl font-bold">{low.length}</p></div>
      {low.length > 0 && (
        <p className="col-span-2 text-xs text-amber-300 sm:col-span-4">
          Restock: {low.map((p) => `${p.name} (${p.stockQty})`).join(", ")}
        </p>
      )}
    </div>
  );
}
function DbBadge() {
  const [health, setHealth] = useState<DbHealth | null>(null);
  const [checking, setChecking] = useState(true);
  const { id: brandId } = useBrand();
  useEffect(() => {
    let live = true;
    probeDb(brandId)
      .then((h) => { if (live) { setHealth(h); setChecking(false); } })
      .catch(() => { if (live) { setHealth({ state: "offline" }); setChecking(false); } });
    return () => { live = false; };
  }, [brandId]);
  const check = () => {
    setChecking(true);
    probeDb(brandId)
      .then((h) => { setHealth(h); setChecking(false); })
      .catch(() => { setHealth({ state: "offline" }); setChecking(false); });
  };
  const label =
    !health || health.state === "no-session" ? "DB: lokal (login untuk live)" :
    health.state === "connected" ? "DB: ● Supabase live" :
    health.state === "denied" ? `DB: ditolak (${health.code}) — cek profiles role` :
    "DB: offline (cek koneksi/env)";
  const hot = health?.state === "connected";
  return (
    <p className="mt-1 flex items-center gap-2 text-xs">
      <span className={hot ? "text-green-400" : "text-amber-300"}>{label}</span>
      <button onClick={() => void check()} disabled={checking} className="underline opacity-70 cursor-pointer disabled:opacity-40">
        {checking ? "…" : "Test"}
      </button>
    </p>
  );
}

// Brand-admin: tambah/edit produk + stok via UI (persisten localStorage;
// colok Supabase via lib/supabase.ts + Auth asli saat env tersedia — tanpa ubah UI).
export default function Admin() {
  const { user, mode, demoLogin, magicLink, logout } = useAuth();
  const { id: brandId } = useBrand();
  const { items, setItems } = useProductStore();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("45");
  const [type, setType] = useState<"pod" | "stock">("pod");
  const [stock, setStock] = useState("20");
  const [tab, setTab] = useState<"products" | "orders" | "promo" | "brand">("products");
  const [editing, setEditing] = useState<string | null>(null);
  const [csvMsg, setCsvMsg] = useState("");
  const [dbOrders, setDbOrders] = useState<DbOrderRow[] | null>(null);
  const mounted = useMounted();
  // Order DB bila login (server truth); kalau tidak -> lokal browser.
  const loadDbOrders = () => {
    if (!getSession()) {
      setDbOrders(null);
      return;
    }
    fetchOrders(brandId)
      .then((r) => setDbOrders(r ?? []))
      .catch(() => setDbOrders(null));
  };
  useEffect(() => {
    let live = true;
    if (tab === "orders" && user && mounted && getSession()) {
      fetchOrders(brandId)
        .then((r) => { if (live) setDbOrders(r ?? []); })
        .catch(() => { if (live) setDbOrders(null); });
    }
    return () => { live = false; };
  }, [tab, user, mounted, brandId]);
  const orders = tab === "orders" && mounted ? listOrders() : [];
  const orderCount = dbOrders ? dbOrders.length : mounted ? listOrders().length : 0;

  // Tunggu mount agar SSR/client sama (auth dibaca dari browser).
  if (!mounted || !user) {    return (
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
  // Kunci peran: hanya yang terdaftar di profiles (server truth).
  if (user.role !== "superadmin" && user.role !== "brand_admin") {
    return (
      <main className="mx-auto max-w-sm px-4 py-20">
        <h1 className="font-display text-3xl">MENUNGGU AKSES</h1>
        <p className="mt-2 text-sm opacity-60">
          Akun <b>{user.email}</b> tercatat sebagai <b>pending</b>. Minta superadmin
          menyetujuimu di <b>/super</b> → akunmu otomatis terbuka saat refresh.
        </p>
        <button onClick={logout} className="mt-4 w-full rounded-xl border border-white/20 py-3 cursor-pointer">Logout</button>
      </main>
    );
  }
  const addProduct = () => {
    const clean = name.trim();
    const num = Number(price);
    if (!clean || !Number.isFinite(num) || num <= 0) return;
    const slug = `${clean.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now().toString(36)}`;
    // Tanpa foto tempelan: editor langsung dibuka agar dilengkapi (wajib >=1 foto).
    const p: Product = {
      id: slug, brandId, name: clean, slug, priceUsd: Math.round(num),
      weightG: 300, type, stockQty: type === "stock" ? Math.max(0, Number(stock) || 0) : undefined,
      podSku: type === "pod" ? `APV-${Date.now().toString(36).toUpperCase()}` : undefined,
      images: [],
      sizes: ["S", "M", "L", "XL"], colors: ["Black"], fabric: "Cotton",
      badge: type === "pod" ? "POD Worldwide" : "Limited Indonesia",
      isSample: false, published: false,
    };
    setItems((prev) => [p, ...prev]);
    setName("");
    setEditing(slug);
    persistProduct(p)
      .then((id) => {
        if (id !== p.id) {
          setItems((prev) => prev.map((x) => (x.id === p.id ? { ...x, id } : x)));
          setEditing((e) => (e === p.id ? id : e));
        }
      })
      .catch(() => { /* tetap lokal */ });
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-xs opacity-50">{user.email} · {user.role} · {mode} mode · <button onClick={logout} className="underline cursor-pointer">Logout</button></p>
      <DbBadge />
      <div className="mt-2 flex flex-wrap gap-2" role="tablist" aria-label="Admin sections">
        {(["products", "orders", "promo", "brand"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => { setTab(t); if (t !== "orders") setDbOrders(null); }}
            className={`rounded-full border px-4 py-1.5 text-sm capitalize cursor-pointer ${tab === t ? "border-white bg-white font-bold text-black" : "border-white/20"}`}>
            {t === "brand" ? "Tampilan" : t === "promo" ? "Promo" : t} {t === "orders" && `(${orderCount})`}
          </button>
        ))}
      </div>
      {tab === "brand" ? (
        <div className="mt-6"><BrandForm /></div>
      ) : tab === "promo" ? (
        <PromoManager />
      ) : tab === "orders" ? (
        <div className="mt-6 flex flex-col gap-3">
          {dbOrders ? (
            <>
              {dbOrders.length === 0 && <p className="opacity-60">Belum ada order di Supabase.</p>}
              {dbOrders.map((o) => (
                <OrderCard key={o.id} o={o} onChanged={loadDbOrders} />
              ))}
              <p className="text-xs opacity-50">Live dari Supabase (semua device).</p>
            </>
          ) : (
            <>
              {orders.length === 0 && <p className="opacity-60">No orders yet — checkout dari /cart untuk test.</p>}
              {orders.map((o) => (
                <div key={o.orderId} className="rounded-xl border border-white/10 p-4 text-sm">
                  <p><b>{o.orderId}</b> <span className="opacity-50">· {o.email} · {o.lane} · ${o.total}</span></p>
                  <p className="mt-1 opacity-70">{o.items.map((i) => `${i.name} ×${i.qty} (${i.size})`).join(", ")}</p>
                </div>
              ))}
              <p className="text-xs opacity-50">Lokal (browser ini). Login admin untuk order live Supabase.</p>
            </>
          )}
        </div>
      ) : (
      <>
      <StatsStrip />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">PRODUCTS ({items.filter((i) => i.published).length})</h1>
        <div className="flex flex-wrap gap-2 text-sm">
          <label className="cursor-pointer rounded-lg border border-white/20 px-3 py-2">
            Import CSV
            <input type="file" accept=".csv,text/csv" className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const rd = new FileReader();
                rd.onload = () => {
                  const news = parseCSV(String(rd.result ?? ""), brandId);
                  if (news.length === 0) { setCsvMsg("CSV kosong / format salah."); return; }
                  setItems((prev) => [...news, ...prev]);
                  news.forEach((p) => {
                    persistProduct(p)
                      .then((id) => {
                        if (id !== p.id) setItems((prev) => prev.map((x) => (x.id === p.id ? { ...x, id } : x)));
                      })
                      .catch(() => {});
                  });
                  setCsvMsg(`+${news.length} produk (lengkapi foto via Edit).`);
                };
                rd.readAsText(f);
                e.target.value = "";
              }} />
          </label>
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
          <button onClick={() => {
            const gone = items.filter((i) => i.isSample);
            setItems((p) => p.filter((i) => !i.isSample));
            gone.forEach((g) => { removeProduct(g.id).catch(() => {}); });
          }} className="rounded-lg border border-red-400/50 px-3 py-2 cursor-pointer">Purge samples</button>
        </div>
      </div>
      {csvMsg && <p className="mt-2 text-sm opacity-70">{csvMsg}</p>}

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
              <button onClick={() => {
                const np = { ...p, published: !p.published };
                setItems((prev) => prev.map((x) => (x.id === p.id ? np : x)));
                persistProduct(np).catch(() => {});
              }}
                className="rounded-lg border border-white/20 px-3 py-1.5 cursor-pointer">{p.published ? "Unpublish" : "Publish"}</button>
              {p.type === "stock" && (
                <button onClick={() => {
                  const np = { ...p, stockQty: (p.stockQty ?? 0) + 1 };
                  setItems((prev) => prev.map((x) => (x.id === p.id ? np : x)));
                  persistProduct(np).catch(() => {});
                }}
                  className="rounded-lg border border-white/20 px-3 py-1.5 cursor-pointer" aria-label={`Restock ${p.name}`}>+1</button>
              )}
              {!p.isSample && (
                <button onClick={() => {
                  setItems((prev) => prev.filter((x) => x.id !== p.id));
                  removeProduct(p.id).catch(() => {});
                }}
                  className="rounded-lg border border-red-400/40 px-3 py-1.5 cursor-pointer" aria-label={`Delete ${p.name}`}>Delete</button>
              )}
            </div>
            {editing === p.id && (
              <div className="mt-2">
                <ProductEditor p={p}
                  onSave={(np) => {
                    setItems((prev) => prev.map((x) => (x.id === p.id ? np : x)));
                    persistProduct(np)
                      .then((id) => {
                        if (id !== np.id) setItems((prev) => prev.map((x) => (x.id === np.id ? { ...x, id } : x)));
                      })
                      .catch(() => {});
                    setEditing(null);
                  }}
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
