"use client";
import { useState } from "react";
import { updateOrder, type DbOrderRow } from "@/lib/supabase";

const STATUS = ["received", "packing", "shipped", "delivered", "cancelled"] as const;

// Kartu order DB + ubah status/tracking (admin).
export function OrderCard({ o, onChanged }: { o: DbOrderRow; onChanged: () => void }) {
  const [status, setStatus] = useState(o.status || "received");
  const [tracking, setTracking] = useState(o.tracking || "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const save = async () => {
    setSaving(true);
    setErr("");
    try {
      await updateOrder(o.id, { status, tracking: tracking.trim() });
      onChanged();
    } catch {
      setErr("Gagal simpan (cek patch-004).");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 p-4 text-sm">
      <p><b>{o.id.slice(0, 8)}…</b> <span className="opacity-50">· {o.email} · {o.lane} · ${o.total_usd} · {new Date(o.created_at).toLocaleString()}</span></p>
      <p className="mt-1 opacity-70">{o.items.map((i) => `${i.slug} ×${i.qty} (${i.size})`).join(", ")}</p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status"
          className="rounded-lg border border-white/15 bg-black px-3 py-2 text-sm">
          {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="No. resi" aria-label="Tracking"
          className="flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/50" />
        <button onClick={() => void save()} disabled={saving} className="rounded-lg bg-white px-4 py-2 font-bold text-black cursor-pointer disabled:opacity-50">
          {saving ? "…" : "Simpan"}
        </button>
      </div>
      {err && <p role="alert" className="mt-1 text-xs text-red-400">{err}</p>}
    </div>
  );
}
