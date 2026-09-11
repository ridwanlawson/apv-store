"use client";
import { useEffect, useState } from "react";
import { fetchDiscounts, upsertDiscount, deleteDiscount, getSession, type Discount } from "@/lib/supabase";

// Tab Promo: kode diskon persen. DB-only (pembeli butuh baca global).
export function PromoManager() {
  const [list, setList] = useState<Discount[] | null>(null);
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("10");
  const [err, setErr] = useState("");
  const authed = typeof window !== "undefined" && !!getSession();

  const reload = () => {
    fetchDiscounts()
      .then((r) => setList(r ?? []))
      .catch(() => setList([]));
  };
  useEffect(() => {
    let live = true;
    if (!authed) return;
    fetchDiscounts()
      .then((r) => { if (live) setList(r ?? []); })
      .catch(() => { if (live) setList([]); });
    return () => { live = false; };
  }, [authed]);

  if (!authed) {
    return <p className="mt-6 opacity-60">Login admin untuk kelola promo (tersimpan global di Supabase).</p>;
  }

  const add = async () => {
    const c = code.trim().toUpperCase();
    const n = Math.round(Number(percent));
    if (!/^[A-Z0-9-]{3,24}$/.test(c)) { setErr("Kode 3–24 karakter A-Z/0-9/-."); return; }
    if (!Number.isFinite(n) || n < 1 || n > 90) { setErr("Persen 1–90."); return; }
    setErr("");
    try {
      await upsertDiscount({ code: c, percent: n, active: true });
      setCode("");
      reload();
    } catch {
      setErr("Gagal simpan (cek patch-004 + profiles role).");
    }
  };

  return (
    <div className="mt-6 flex flex-col gap-3">
      <div className="flex gap-2">
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="HEMAT10" aria-label="Kode promo"
          className="w-40 rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm uppercase outline-none focus:border-white/50" />
        <input value={percent} onChange={(e) => setPercent(e.target.value)} inputMode="numeric" aria-label="Persen"
          className="w-24 rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-white/50" />
        <button onClick={() => void add()} className="rounded-lg bg-white px-4 text-sm font-bold text-black cursor-pointer">Tambah</button>
      </div>
      {err && <p role="alert" className="text-sm text-red-400">{err}</p>}
      {list === null && <p className="opacity-60">Memuat…</p>}
      {list?.map((d) => (
        <div key={d.code} className="flex items-center gap-3 rounded-xl border border-white/10 p-3 text-sm">
          <b>{d.code}</b><span className="opacity-60">−{d.percent}%</span>
          <span className="ml-auto flex gap-2">
            <button onClick={() => { upsertDiscount({ ...d, active: !d.active }).then(reload).catch(() => setErr("Gagal update.")); }}
              className="rounded-lg border border-white/20 px-3 py-1.5 cursor-pointer">{d.active ? "Nonaktifkan" : "Aktifkan"}</button>
            <button onClick={() => { deleteDiscount(d.code).then(reload).catch(() => setErr("Gagal hapus.")); }}
              className="rounded-lg border border-red-400/40 px-3 py-1.5 cursor-pointer">Hapus</button>
          </span>
        </div>
      ))}
      {list?.length === 0 && <p className="opacity-60">Belum ada promo. Contoh: HEMAT10 = 10%.</p>}
    </div>
  );
}
