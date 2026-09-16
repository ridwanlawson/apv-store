"use client";
import { useState } from "react";
import { useBrand, saveBrand, resetBrand, fileToDataUrl, type BrandOverride } from "@/lib/brand-store";
import type { BrandConfig } from "@/brands";

export interface BrandFormInitial {
  brandId: string;
  name: string;
  tagline: string;
  contact: string;
  whatsapp: string;
  phone: string;
  address: string;
  hours: string;
  mapsUrl: string;
  instagram: string;
  tiktok: string;
  announcement: string;
  logo: string;
  logoFull: string;
  favicon: string;
  colors: BrandConfig["colors"];
  hero: { headline: string; sub: string; cta: string };
}

// Tab Brand: identitas, 3 logo, warna, hero — semua tanpa coding.
// Tanpa props = brand aktif (tab Tampilan). Dengan props = brand mana pun (superadmin).
export function BrandForm({ initial, onSave, onReset, submitLabel = "Simpan tampilan" }: {
  initial?: BrandFormInitial;
  onSave?: (patch: BrandOverride) => Promise<void>;
  onReset?: () => void;
  submitLabel?: string;
} = {}) {
  const b = useBrand();
  const src: BrandFormInitial = initial ?? {
    brandId: b.id, name: b.name, tagline: b.tagline, contact: b.contact, whatsapp: b.whatsapp ?? "",
    phone: b.phone ?? "", address: b.address ?? "", hours: b.hours ?? "", mapsUrl: b.mapsUrl ?? "",
    instagram: b.socials.instagram ?? "", tiktok: b.socials.tiktok ?? "",
    announcement: b.announcement ?? "",
    logo: b.logo ?? "", logoFull: b.logoFull ?? "", favicon: b.favicon ?? "",
    colors: b.colors, hero: b.hero,
  };
  const [name, setName] = useState(src.name);
  const [tagline, setTagline] = useState(src.tagline);
  const [contact, setContact] = useState(src.contact);
  const [whatsapp, setWhatsapp] = useState(src.whatsapp);
  const [phone, setPhone] = useState(src.phone);
  const [address, setAddress] = useState(src.address);
  const [hours, setHours] = useState(src.hours);
  const [mapsUrl, setMapsUrl] = useState(src.mapsUrl);
  const [instagram, setInstagram] = useState(src.instagram);
  const [tiktok, setTiktok] = useState(src.tiktok);
  const [announcement, setAnnouncement] = useState(src.announcement);
  const [logo, setLogo] = useState(src.logo);
  const [logoFull, setLogoFull] = useState(src.logoFull);
  const [favicon, setFavicon] = useState(src.favicon);
  const [colors, setColors] = useState({ ...src.colors });
  const [hero, setHero] = useState({ ...src.hero });
  const [msg, setMsg] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sinkron sekali saat brand berubah dari luar (hindari timpa ketikan).
  const [synced, setSynced] = useState(src.name + src.brandId);
  if (synced !== src.name + src.brandId && document.activeElement?.tagName !== "INPUT") {
    setSynced(src.name + src.brandId);
    setName(src.name); setTagline(src.tagline); setContact(src.contact); setWhatsapp(src.whatsapp);
    setPhone(src.phone); setAddress(src.address); setHours(src.hours); setMapsUrl(src.mapsUrl);
    setInstagram(src.instagram); setTiktok(src.tiktok); setAnnouncement(src.announcement);
    setLogo(src.logo); setLogoFull(src.logoFull); setFavicon(src.favicon);
    setColors({ ...src.colors }); setHero({ ...src.hero });
  }

  const save = async () => {
    setSaving(true);
    setMsg("");
    try {
      if (contact && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact.trim())) throw new Error("Email kontak tidak valid.");
      const wa = whatsapp.replace(/\D/g, "");
      if (wa && (wa.length < 8 || wa.length > 15)) throw new Error("WA 8–15 digit.");
      for (const [label, url] of [["Instagram", instagram], ["TikTok", tiktok], ["Maps", mapsUrl]] as const) {
        if (url && !/^https:\/\//.test(url.trim())) throw new Error(`${label} harus https://…`);
      }
      const patch = {
        name, tagline, contact: contact.trim(), whatsapp: wa, phone: phone.trim(),
        address: address.trim(), hours: hours.trim(), mapsUrl: mapsUrl.trim(),
        socials: { instagram: instagram.trim(), tiktok: tiktok.trim() },
        announcement, logo, logoFull, favicon, colors, hero,
      };
      if (onSave) await onSave(patch);
      else await saveBrand(patch, src.brandId);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
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
          <label className="text-xs opacity-70">No. WhatsApp order (digit, cth 62812…)
            <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))} inputMode="tel" placeholder="6281234567890" className={`mt-1 ${input}`} /></label>
          <label className="text-xs opacity-70">Pengumuman (kosongkan untuk sembunyi)
            <input value={announcement} onChange={(e) => setAnnouncement(e.target.value)} placeholder="FREE WORLDWIDE SHIPPING OVER $150" className={`mt-1 ${input}`} /></label>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 p-4">
        <p className="font-bold">Kontak & alamat (tampil di footer)</p>
        <div className="mt-2 grid gap-2">
          <label className="text-xs opacity-70">Telepon tampil (opsional, cth +62 812-3456-7890)
            <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="+62…" className={`mt-1 ${input}`} /></label>
          <label className="text-xs opacity-70">Alamat fisik (1–2 baris, tampil + dipakai di Privacy/Shipping)
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Jl. … Bandung, Indonesia" className={`mt-1 ${input}`} /></label>
          <label className="text-xs opacity-70">Jam operasional (cth Mon–Sat 10:00–18:00 WIB)
            <input value={hours} onChange={(e) => setHours(e.target.value)} className={`mt-1 ${input}`} /></label>
          <label className="text-xs opacity-70">Link Google Maps (https://…, kosong = sembunyi)
            <input value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} inputMode="url" placeholder="https://maps.google.com/…" className={`mt-1 ${input}`} /></label>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="text-xs opacity-70">Instagram URL
              <input value={instagram} onChange={(e) => setInstagram(e.target.value)} inputMode="url" placeholder="https://instagram.com/…" className={`mt-1 ${input}`} /></label>
            <label className="text-xs opacity-70">TikTok URL
              <input value={tiktok} onChange={(e) => setTiktok(e.target.value)} inputMode="url" placeholder="https://tiktok.com/…" className={`mt-1 ${input}`} /></label>
          </div>
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
        <button onClick={() => void save()} disabled={saving} className="rounded-xl bg-white px-6 py-3 font-bold text-black cursor-pointer disabled:opacity-50">
          {saving ? "Menyimpan…" : saved ? "Tersimpan ✓" : submitLabel}
        </button>
        <button onClick={() => { if (onReset) onReset(); else resetBrand(src.brandId); setMsg(""); }} className="rounded-xl border border-white/20 px-6 py-3 cursor-pointer">
          Reset default
        </button>
      </div>
      <p className="text-xs opacity-50">Langsung tampil di semua halaman. Permanen multi-device bila login (Supabase).</p>
    </div>
  );
}
