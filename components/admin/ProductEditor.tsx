"use client";
import { useState } from "react";
import { fileToDataUrl } from "@/lib/brand-store";
import type { Product, ProductType } from "@/lib/products";

// Editor produk lengkap: detail + gambar (URL/upload) + video + varian + stok.
export function ProductEditor({ p, onSave, onCancel }: {
  p: Product;
  onSave: (p: Product) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(p.name);
  const [price, setPrice] = useState(String(p.priceUsd));
  const [compareAt, setCompareAt] = useState(p.compareAt ? String(p.compareAt) : "");
  const [fabric, setFabric] = useState(p.fabric);
  const [badge, setBadge] = useState(p.badge ?? "");
  const [type, setType] = useState<ProductType>(p.type);
  const [stockQty, setStockQty] = useState(String(p.stockQty ?? 0));
  const [sizes, setSizes] = useState(p.sizes.join(", "));
  const [colors, setColors] = useState(p.colors.join(", "));
  const [weightG, setWeightG] = useState(String(p.weightG));
  const [video, setVideo] = useState(p.video ?? "");
  const [images, setImages] = useState<string[]>([...p.images]);
  const [imgUrl, setImgUrl] = useState("");
  const [err, setErr] = useState("");

  const input = "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-white/50";

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    try {
      setErr("");
      const news: string[] = [];
      for (const f of Array.from(files).slice(0, 8)) {
        news.push(await fileToDataUrl(f, 1024, 0.82));
      }
      setImages((prev) => [...prev, ...news].slice(0, 12));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload gagal");
    }
  };

  const save = () => {
    const num = Math.round(Number(price));
    const cat = compareAt.trim() === "" ? undefined : Math.round(Number(compareAt));
    if (!name.trim()) { setErr("Nama wajib diisi."); return; }
    if (!Number.isFinite(num) || num < 1 || num > 9999) { setErr("Harga USD 1–9999."); return; }
    if (cat !== undefined && (!Number.isFinite(cat) || cat <= num)) { setErr("Harga coret harus > harga jual."); return; }
    if (images.length === 0) { setErr("Minimal 1 gambar."); return; }
    onSave({
      ...p,
      name: name.trim(),
      priceUsd: num,
      compareAt: cat,
      fabric: fabric.trim() || "Cotton",
      badge: badge.trim(),
      type,
      stockQty: type === "stock" ? Math.max(0, Number(stockQty) || 0) : undefined,
      podSku: type === "pod" ? (p.podSku ?? `APV-${Date.now().toString(36).toUpperCase()}`) : undefined,
      sizes: sizes.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 10),
      colors: colors.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 10),
      weightG: Math.max(1, Number(weightG) || 300),
      video: video.trim() || undefined,
      images,
    });
  };

  return (
    <div className="rounded-xl border border-white/25 bg-white/[0.03] p-4">
      <p className="font-bold">Edit: {p.name}</p>
      <p className="text-xs opacity-50">slug: /product/{p.slug} · id: {p.id.slice(0, 8)}…</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="text-xs opacity-70">Nama<input value={name} onChange={(e) => setName(e.target.value)} className={`mt-1 ${input}`} /></label>
        <label className="text-xs opacity-70">Harga (USD)<input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="numeric" className={`mt-1 ${input}`} /></label>
        <label className="text-xs opacity-70">Harga coret (opsional)<input value={compareAt} onChange={(e) => setCompareAt(e.target.value)} inputMode="numeric" placeholder="mis. 59" className={`mt-1 ${input}`} /></label>
        <label className="text-xs opacity-70">Bahan<input value={fabric} onChange={(e) => setFabric(e.target.value)} className={`mt-1 ${input}`} /></label>
        <label className="text-xs opacity-70">Badge<input value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="POD Worldwide / Limited Indonesia" className={`mt-1 ${input}`} /></label>
        <label className="text-xs opacity-70">Tipe
          <select value={type} onChange={(e) => setType(e.target.value as ProductType)} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2.5 text-sm">
            <option value="pod">POD</option><option value="stock">Stock</option>
          </select></label>
        <label className="text-xs opacity-70">Stok (khusus stock)<input value={stockQty} onChange={(e) => setStockQty(e.target.value)} inputMode="numeric" disabled={type !== "stock"} className={`mt-1 ${input} disabled:opacity-40`} /></label>
        <label className="text-xs opacity-70">Sizes (koma)<input value={sizes} onChange={(e) => setSizes(e.target.value)} className={`mt-1 ${input}`} /></label>
        <label className="text-xs opacity-70">Warna (koma)<input value={colors} onChange={(e) => setColors(e.target.value)} className={`mt-1 ${input}`} /></label>
        <label className="text-xs opacity-70">Berat (gram)<input value={weightG} onChange={(e) => setWeightG(e.target.value)} inputMode="numeric" className={`mt-1 ${input}`} /></label>
        <label className="text-xs opacity-70">Video MP4 (opsional)<input value={video} onChange={(e) => setVideo(e.target.value)} placeholder="/seq/....mp4 atau URL" className={`mt-1 ${input}`} /></label>
      </div>

      <p className="mt-4 text-xs font-bold opacity-70">GAMBAR ({images.length}/12)</p>
      <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {images.map((src, i) => (
          <div key={`${i}-${src.slice(-12)}`} className="relative aspect-[3/4] overflow-hidden rounded-lg border border-white/15">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Gambar ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
            <button onClick={() => setImages((prev) => prev.filter((_, k) => k !== i))}
              aria-label={`Hapus gambar ${i + 1}`}
              className="absolute right-1 top-1 rounded-full bg-black/70 px-2 py-0.5 text-xs cursor-pointer">✕</button>
            {i === 0 && <span className="absolute left-1 top-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-black">Utama</span>}
            {images.length > 1 && (
              <span className="absolute bottom-1 left-1 flex gap-1">
                <button onClick={() => setImages((prev) => (i === 0 ? prev : [...prev.slice(0, i - 1), prev[i], prev[i - 1], ...prev.slice(i + 1)]))}
                  aria-label="Geser kiri" className="rounded-full bg-black/70 px-1.5 text-[10px] cursor-pointer">◀</button>
                <button onClick={() => setImages((prev) => (i === prev.length - 1 ? prev : [...prev.slice(0, i), prev[i + 1], prev[i], ...prev.slice(i + 2)]))}
                  aria-label="Geser kanan" className="rounded-full bg-black/70 px-1.5 text-[10px] cursor-pointer">▶</button>
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <label className="cursor-pointer rounded-lg border border-white/20 px-3 py-2 text-xs">
          + Upload foto
          <input type="file" accept="image/*" multiple className="hidden"
            onChange={(e) => { void addFiles(e.target.files); e.target.value = ""; }} />
        </label>
        <div className="flex flex-1 gap-2">
          <input value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} placeholder="…atau tempel URL gambar"
            className={`flex-1 ${input}`} />
          <button onClick={() => {
            const u = imgUrl.trim();
            if (!u || images.length >= 12) return;
            setImages((prev) => [...prev, u]);
            setImgUrl("");
          }} className="rounded-lg border border-white/20 px-3 py-2 text-xs cursor-pointer">Tambah</button>
        </div>
      </div>

      {err && <p role="alert" className="mt-2 text-sm text-red-400">{err}</p>}
      <div className="mt-3 flex gap-2">
        <button onClick={save} className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-black cursor-pointer">Simpan produk</button>
        <button onClick={onCancel} className="rounded-lg border border-white/20 px-5 py-2.5 text-sm cursor-pointer">Batal</button>
      </div>
      <p className="mt-2 text-[11px] opacity-50">Upload disimpan di browser (maks ~10 foto lokal). Untuk katalog besar pakai URL / Supabase Storage nanti.</p>
    </div>
  );
}
