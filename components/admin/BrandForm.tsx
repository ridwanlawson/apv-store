"use client";
import { useState } from "react";
import { useBrand, saveBrand, resetBrand, fileToDataUrl } from "@/lib/brand-store";

// Tab Brand: identitas, 3 logo, warna, hero — semua tanpa coding.
export function BrandForm() {
  const b = useBrand();
  const [name, setName] = useState(b.name);
  const [tagline, setTagline] = useState(b.tagline);
  const [contact, setContact] = useState(b.contact);
  const [logo, setLogo] = useState(b.logo ?? "");
  const [logoFull, setLogoFull] = useState(b.logoFull ?? "");
  const [favicon, setFavicon] = useState(b.favicon ?? "");
  const [colors, setColors] = useState({ ...b.colors });
  const [hero, setHero] = useState({ ...b.hero });
  const [msg, setMsg] = useState("");
  const [saved, setSaved] = useState(false);

  // Sinkron sekali saat brand berubah dari luar (hindari timpa ketikan).
  const [synced, setSynced] = useState(b.name);
  if (synced !== b.name && document.activeElement?.tagName !== "INPUT") {
    setSynced(b.name);
    setName(b.name); setTagline(b.tagline); setContact(b.contact);
    setLogo(b.logo ?? ""); setLogoFull(b.logoFull ?? ""); setFavicon(b.favicon ?? "");
    setColors({ ...b.colors }); setHero({ ...b.hero });
  }

  const save = () => {
    try {
      saveBrand({ name, tagline, contact, logo, logoFull, favicon, colors, hero });
      setMsg("");
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Gagal menyimpan");
    }
  };

  const upload = async (file: File | undefined, set: (v: string) => void, maxSide: number) => {
    if (!file) return;
    try {
      setMsg("");
      set(await fileToDataUrl(file, maxSide));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Upload gagal");
    }
  };

  const slot = (
    label: string, value: string, set: (v: string) => void, maxSide: number, hint: string
  ) => (
    <div className="rounded-xl border border-white/10 p-3">
      <p className="text-sm font-bold">{label}</p>
      <div className="mt-2 flex h-16 items-center justify-center overflow-hidden rounded-lg bg-black/40">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={label} className="max-h-16 w-auto object-contain" />
        ) : (
          <span className="text-xs opacity-40">belum ada</span>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        <label className="cursor-pointer rounded-lg border border-white/20 px-3 py-1.5 text-xs">
          Upload
          <input type="file" accept="image/*" className="hidden"
            onChange={(e) => { void upload(e.target.files?.[0], set, maxSide); e.target.value = ""; }} />
        </label>
        <button onClick={() => set("")} className="rounded-lg border border-white/20 px-3 py-1.5 text-xs cursor-pointer">Hapus</button>
      </div>
      <input value={value.startsWith("data:") ? "" : value} onChange={(e) => set(e.target.value)}
        placeholder="…atau tempel URL gambar" aria-label={`${label} URL`}
        className="mt-2 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs outline-none placeholder:text-white/30 focus:border-white/50" />
      <p className="mt-1 text-[11px] opacity-50">{hint}</p>
    </div>
  );

  const input = "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-white/50";
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-white/10 p-4">
        <p className="font-bold">Identitas</p>
        <div className="mt-2 grid gap-2">
          <label className="text-xs opacity-70">Nama brand
            <input value={name} onChange={(e) => setName(e.target.value)} className={`mt-1 ${input}`} /></label>
          <label className="text-xs opacity-70">Tagline
            <input value={tagline} onChange={(e) => setTagline(e.target.value)} className={`mt-1 ${input}`} /></label>
          <label className="text-xs opacity-70">Email kontak
            <input value={contact} onChange={(e) => setContact(e.target.value)} className={`mt-1 ${input}`} /></label>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 p-4">
        <p className="font-bold">Logo</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          {slot("Emblem tengah navbar", logo, setLogo, 256, "Kotak, background transparan/hitam.")}
          {slot("Logo full (footer)", logoFull, setLogoFull, 640, "Lockup landscape.")}
          {slot("Favicon (tab browser)", favicon, setFavicon, 64, "Kecil, kontras tinggi.")}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 p-4">
        <p className="font-bold">Warna</p>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(Object.keys(colors) as (keyof typeof colors)[]).map((k) => (
            <label key={k} className="text-xs opacity-70 capitalize">{k}
              <span className="mt-1 flex items-center gap-2">
                <input type="color" value={colors[k]} onChange={(e) => setColors({ ...colors, [k]: e.target.value })}
                  className="h-10 w-12 cursor-pointer rounded border border-white/20 bg-transparent" />
                <span className="opacity-80">{colors[k]}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 p-4">
        <p className="font-bold">Hero (teks pembuka depan)</p>
        <div className="mt-2 grid gap-2">
          <label className="text-xs opacity-70">Headline
            <input value={hero.headline} onChange={(e) => setHero({ ...hero, headline: e.target.value })} className={`mt-1 ${input}`} /></label>
          <label className="text-xs opacity-70">Sub-headline
            <input value={hero.sub} onChange={(e) => setHero({ ...hero, sub: e.target.value })} className={`mt-1 ${input}`} /></label>
          <label className="text-xs opacity-70">Tombol CTA
            <input value={hero.cta} onChange={(e) => setHero({ ...hero, cta: e.target.value })} className={`mt-1 ${input}`} /></label>
        </div>
      </div>

      {msg && <p role="alert" className="text-sm text-red-400">{msg}</p>}
      <div className="flex gap-2">
        <button onClick={save} className="rounded-xl bg-white px-6 py-3 font-bold text-black cursor-pointer">
          {saved ? "Tersimpan ✓" : "Simpan tampilan"}
        </button>
        <button onClick={() => { resetBrand(); setMsg(""); }} className="rounded-xl border border-white/20 px-6 py-3 cursor-pointer">
          Reset default
        </button>
      </div>
      <p className="text-xs opacity-50">Tersimpan di browser ini + langsung tampil di semua halaman. Versi permanen multi-device ikut Supabase tahap berikutnya.</p>
    </div>
  );
}
