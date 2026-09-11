"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useMounted } from "@/lib/store";
import { getSession } from "@/lib/supabase";
import {
  fetchAllBrands, createBrandRow, updateBrandRow, deleteBrandRow, fetchOwnRole,
  fetchProfiles, setProfileRole, deleteProfile,
  type BrandAdminRow, type ProfileRow,
} from "@/lib/supabase";
import { BrandForm, type BrandFormInitial } from "@/components/admin/BrandForm";
import { saveBrand } from "@/lib/brand-store";

// Superadmin Hub: tambah/edit/aktif/nonaktif/hapus brand TANPA coding.
// Akses: login + role superadmin (profiles). brand_admin diarahkan ke /admin.
export default function Super() {
  const { user } = useAuth();
  const mounted = useMounted();
  const [role, setRole] = useState<string | null>(null);
  const [rows, setRows] = useState<BrandAdminRow[] | null>(null);
  const [err, setErr] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ id: "", name: "", slug: "", template: "brutal", currency: "USD", domain: "", active: true });

  useEffect(() => {
    let live = true;
    if (!mounted || !user || !getSession()) return;
    fetchOwnRole()
      .then((r) => { if (live) setRole(r); })
      .catch(() => { if (live) setRole(null); });
    return () => { live = false; };
  }, [mounted, user]);

  const reload = () => {
    fetchAllBrands()
      .then((r) => setRows(r ?? []))
      .catch(() => setErr("Gagal baca brands (cek patch-005)."));
  };
  useEffect(() => {
    if (role === "superadmin") reload();
  }, [role]);

  if (!mounted) return <main className="mx-auto max-w-4xl px-4 py-10"><p>Loading…</p></main>;
  if (!user) {
    return (
      <main className="mx-auto max-w-sm px-4 py-20">
        <h1 className="font-display text-3xl">SUPERADMIN</h1>
        <p className="mt-2 text-sm opacity-60">Login dulu via <Link href="/admin" className="underline">/admin</Link> (magic link), lalu kembali ke sini.</p>
      </main>
    );
  }
  if (role !== "superadmin") {
    return (
      <main className="mx-auto max-w-sm px-4 py-20">
        <h1 className="font-display text-3xl">SUPERADMIN</h1>
        <p className="mt-2 text-sm opacity-60">
          Akun <b>{user.email}</b> role: <b>{role ?? "belum terdaftar"}</b>. Halaman ini khusus superadmin.
          Kelola tokomu di <Link href="/admin" className="underline">/admin</Link>.
        </p>
      </main>
    );
  }

  const startCreate = () => {
    setForm({ id: "", name: "", slug: "", template: "brutal", currency: "USD", domain: "", active: false });
    setCreating(true);
    setErr("");
  };

  const doCreate = async () => {
    const id = form.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "");
    if (!/^[a-z0-9-]{3,32}$/.test(id)) { setErr("Slug 3–32 karakter a-z/0-9/-."); return; }
    if (!form.name.trim()) { setErr("Nama wajib diisi."); return; }
    setErr("");
    try {
      await createBrandRow({
        id,
        name: form.name.trim(),
        slug: id,
        template: form.template === "minimal" ? "minimal" : "brutal",
        currency: form.currency || "USD",
        domain: form.domain.trim().toLowerCase(),
        active: form.active,
        config: { tagline: "", contact: "", colors: {}, hero: {} },
      });
      setCreating(false);
      reload();
    } catch {
      setErr("Gagal buat brand (cek patch-005 + role superadmin).");
    }
  };

  const rowToInitial = (r: BrandAdminRow): BrandFormInitial => {
    const c = (r.config ?? {}) as Record<string, unknown>;
    const colors = (c.colors ?? {}) as Record<string, string>;
    const hero = (c.hero ?? {}) as Record<string, string>;
    return {
      brandId: r.id,
      name: r.name,
      tagline: (c.tagline as string) ?? "",
      contact: (c.contact as string) ?? "",
      whatsapp: (c.whatsapp as string) ?? "",
      announcement: (c.announcement as string) ?? "",
      logo: (c.logo as string) ?? "",
      logoFull: (c.logoFull as string) ?? "",
      favicon: (c.favicon as string) ?? "",
      colors: {
        bg: colors.bg ?? "#0A0A0A", fg: colors.fg ?? "#EDEAE4",
        muted: colors.muted ?? "#1A1816", accent: colors.accent ?? "#C1121F",
      },
      hero: { headline: hero.headline ?? r.name, sub: hero.sub ?? "", cta: hero.cta ?? "Shop" },
    };
  };

  const input = "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-white/50";

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">SUPERADMIN HUB</h1>
          <p className="text-sm opacity-60">{user.email} · superadmin · {rows?.length ?? 0} brand</p>
        </div>
        <button onClick={startCreate} className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black cursor-pointer">+ Brand baru</button>
      </div>
      {err && <p role="alert" className="mt-3 text-sm text-red-400">{err}</p>}

      {creating && (
        <div className="mt-4 rounded-xl border border-white/25 bg-white/[0.03] p-4">
          <p className="font-bold">Brand baru (nonaktif dulu sampai siap)</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <label className="text-xs opacity-70">Nama<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`mt-1 ${input}`} /></label>
            <label className="text-xs opacity-70">Slug/id (domain alternatif)<input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="brand-kedua" className={`mt-1 ${input}`} /></label>
            <label className="text-xs opacity-70">Template
              <select value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2.5 text-sm">
                <option value="brutal">brutal</option><option value="minimal">minimal</option>
              </select></label>
            <label className="text-xs opacity-70">Currency<input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} className={`mt-1 ${input}`} /></label>
            <label className="text-xs opacity-70 sm:col-span-2">Custom domain (opsional, pasang DNS dulu)<input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="shop.brand.com" className={`mt-1 ${input}`} /></label>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => void doCreate()} className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-black cursor-pointer">Buat brand</button>
            <button onClick={() => setCreating(false)} className="rounded-lg border border-white/20 px-5 py-2.5 text-sm cursor-pointer">Batal</button>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {rows === null && <p className="opacity-60">Memuat… (butuh patch-005 + login)</p>}
        {rows?.map((r) => (
          <div key={r.id}>
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 p-4 text-sm">
              <div className="flex-1">
                <b>{r.name}</b>{" "}
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${r.active ? "bg-green-500/20 text-green-300" : "bg-white/10 opacity-60"}`}>
                  {r.active ? "AKTIF" : "NONAKTIF"}
                </span>
                <p className="mt-1 opacity-50">/{r.slug} · {r.template} · {r.currency} · {r.domain || "belum ada domain"}</p>
              </div>
              <button onClick={() => {
                updateBrandRow(r.id, { active: !r.active })
                  .then(reload)
                  .catch(() => setErr("Gagal ubah status."));
              }} className="rounded-lg border border-white/20 px-3 py-1.5 cursor-pointer">
                {r.active ? "Nonaktifkan" : "Aktifkan"}
              </button>
              <button onClick={() => setEditing((e) => (e === r.id ? null : r.id))}
                className="rounded-lg border border-white/20 px-3 py-1.5 cursor-pointer">Edit</button>
              <button onClick={() => {
                if (!window.confirm(`Hapus brand ${r.name}? Produk/order yatim tetap di DB.`)) return;
                deleteBrandRow(r.id).then(reload).catch(() => setErr("Gagal hapus."));
              }} className="rounded-lg border border-red-400/40 px-3 py-1.5 cursor-pointer">Hapus</button>
            </div>
            {editing === r.id && (
              <div className="mt-2 rounded-xl border border-white/10 p-4">
                <div className="grid gap-2 sm:grid-cols-3">
                  <label className="text-xs opacity-70">Domain<input defaultValue={r.domain} id={`dom-${r.id}`} className={`mt-1 ${input}`} /></label>
                  <label className="text-xs opacity-70">Template
                    <select defaultValue={r.template} id={`tpl-${r.id}`} className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2.5 text-sm">
                      <option value="brutal">brutal</option><option value="minimal">minimal</option>
                    </select></label>
                  <label className="text-xs opacity-70">Currency
                    <input defaultValue={r.currency} id={`cur-${r.id}`} className={`mt-1 ${input}`} /></label>
                </div>
                <button onClick={() => {
                  const dom = (document.getElementById(`dom-${r.id}`) as HTMLInputElement)?.value.trim().toLowerCase() ?? "";
                  const tpl = (document.getElementById(`tpl-${r.id}`) as HTMLSelectElement)?.value ?? "brutal";
                  const cur = (document.getElementById(`cur-${r.id}`) as HTMLInputElement)?.value.trim().toUpperCase() || "USD";
                  updateBrandRow(r.id, { domain: dom, template: tpl, currency: cur }).then(reload).catch(() => setErr("Gagal simpan."));
                }} className="mt-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-black cursor-pointer">Simpan kolom</button>
                <div className="mt-4">
                  <p className="mb-2 text-sm font-bold">Tampilan & konten</p>
                  <BrandForm
                    key={r.id}
                    initial={rowToInitial(r)}
                    submitLabel="Simpan brand"
                    onSave={async (patch) => { await saveBrand(patch, r.id); reload(); }}
                    onReset={() => { reload(); }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs opacity-50">
        Brand aktif + domain terpasang = langsung tayang di 1 deploy ini (resolusi domain, cache 60 detik).
        Nonaktif = domain-nya tampil halaman nonaktif. Tanpa coding, tanpa deploy ulang.
      </p>
      <AccessManager />
    </main>
  );
}

/** Persetujuan akses: pending -> brand_admin / superadmin / tolak. */
function AccessManager() {
  const [list, setList] = useState<ProfileRow[] | null>(null);
  const [err, setErr] = useState("");
  const reload = () => {
    fetchProfiles()
      .then((r) => setList(r ?? []))
      .catch(() => setErr("Gagal baca akun (cek patch-006)."));
  };
  useEffect(() => {
    reload();
  }, []);
  const act = async (fn: () => Promise<void>, fail: string) => {
    setErr("");
    try {
      await fn();
      reload();
    } catch {
      setErr(fail);
    }
  };
  const pendings = (list ?? []).filter((p) => p.role === "pending");
  const members = (list ?? []).filter((p) => p.role !== "pending");
  return (
    <div className="mt-8 rounded-xl border border-white/10 p-4">
      <p className="font-bold">AKSES AKUN ({pendings.length} pending)</p>
      {err && <p role="alert" className="mt-2 text-sm text-red-400">{err}</p>}
      {list === null && <p className="mt-2 text-sm opacity-60">Memuat…</p>}
      {pendings.map((p) => (
        <div key={p.user_id} className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-amber-300/30 bg-amber-300/5 p-3 text-sm">
          <b>{p.email || p.user_id.slice(0, 8)}</b>
          <span className="opacity-50">minta akses</span>
          <span className="ml-auto flex gap-2">
            <button onClick={() => void act(() => setProfileRole(p.user_id, "brand_admin", "a-private-violence"), "Gagal setujui.")}
              className="rounded-lg bg-white px-3 py-1.5 font-bold text-black cursor-pointer">Admin</button>
            <button onClick={() => void act(() => setProfileRole(p.user_id, "superadmin", "a-private-violence"), "Gagal setujui.")}
              className="rounded-lg border border-white/20 px-3 py-1.5 cursor-pointer">Superadmin</button>
            <button onClick={() => void act(() => deleteProfile(p.user_id), "Gagal tolak.")}
              className="rounded-lg border border-red-400/40 px-3 py-1.5 cursor-pointer">Tolak</button>
          </span>
        </div>
      ))}
      {members.map((p) => (
        <div key={p.user_id} className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-white/10 p-3 text-sm">
          <b>{p.email || p.user_id.slice(0, 8)}</b>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{p.role}</span>
          <span className="ml-auto flex gap-2">
            {p.role !== "superadmin" && (
              <button onClick={() => void act(() => setProfileRole(p.user_id, "superadmin", p.brand_id), "Gagal ubah.")}
                className="rounded-lg border border-white/20 px-3 py-1.5 cursor-pointer">Jadikan superadmin</button>
            )}
            {p.role !== "brand_admin" && (
              <button onClick={() => void act(() => setProfileRole(p.user_id, "brand_admin", p.brand_id), "Gagal ubah.")}
                className="rounded-lg border border-white/20 px-3 py-1.5 cursor-pointer">Jadikan admin</button>
            )}
            <button onClick={() => void act(() => deleteProfile(p.user_id), "Gagal cabut.")}
              className="rounded-lg border border-red-400/40 px-3 py-1.5 cursor-pointer">Cabut</button>
          </span>
        </div>
      ))}
      <p className="mt-2 text-xs opacity-50">Alur: orang login via /admin → tercatat pending → setujui di sini. Tanpa SQL lagi.</p>
    </div>
  );
}
