"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useT } from "@/lib/i18n";
import { listOrders } from "@/lib/orders";
import { useMounted } from "@/lib/store";

interface RemoteOrder {
  id: string;
  items: { slug: string; qty: number; size: string }[];
  total_usd: number;
  lane: string;
  status: string;
  tracking: string;
  created_at: string;
}

function Body() {
  const t = useT();
  const mounted = useMounted();
  const sp = useSearchParams();
  const tk = sp.get("tk") ?? "";
  const [id, setId] = useState("");
  const [remote, setRemote] = useState<RemoteOrder | "loading" | "missing" | null>(() =>
    tk ? "loading" : null
  );

  // Link lacak lintas device (?tk=...) -> status asli dari server.
  useEffect(() => {
    if (!tk || !mounted) return;
    let live = true;
    fetch(`/api/track?token=${encodeURIComponent(tk)}`)
      .then(async (res) => {
        if (!live) return;
        if (!res.ok) {
          setRemote(res.status === 501 ? null : "missing");
          return;
        }
        setRemote((await res.json()) as RemoteOrder);
      })
      .catch(() => {
        if (live) setRemote(null);
      });
    return () => {
      live = false;
    };
  }, [tk, mounted]);

  const q = id.trim().toLowerCase();
  // Fallback: order browser ini (tersimpan saat checkout).
  const found = mounted && q && !tk
    ? listOrders().find((o) => o.orderId.toLowerCase() === q || o.orderId.toLowerCase().startsWith(q))
    : undefined;

  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-display text-4xl">{t("trackT")}</h1>
      {tk ? (
        <div className="mt-4">
          {remote === "loading" && <p className="opacity-60">Memuat status…</p>}
          {remote === "missing" && (
            <p className="rounded-xl border border-white/10 p-4 text-sm opacity-80">Link tidak valid / order tidak ditemukan.</p>
          )}
          {remote === null && (
            <p className="rounded-xl border border-white/10 p-4 text-sm opacity-80">
              Lacak online belum aktif di toko ini. Cek manual di bawah (device tempat checkout).
            </p>
          )}
          {remote && typeof remote === "object" && (
            <div className="rounded-xl border border-white/10 p-4 text-sm">
              <p><b>{String(remote.id).slice(0, 8)}…</b> <span className="opacity-50">· {String(remote.lane)} · ${Number(remote.total_usd)}</span></p>
              <p className="mt-1 opacity-70">
                {(Array.isArray(remote.items) ? remote.items : []).map((i) => `${i.slug} ×${i.qty} (${i.size})`).join(", ")}
              </p>
              <p className="mt-2 inline-block rounded-full bg-white/10 px-3 py-1 text-xs">
                {String(remote.status || "received")}{remote.tracking ? ` · resi ${remote.tracking}` : ""}
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          <input value={id} onChange={(e) => setId(e.target.value)} placeholder={t("trackPh")} aria-label="Order id"
            className="mt-4 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 outline-none focus:border-white/50" />
          {q && (found ? (
            <div className="mt-4 rounded-xl border border-white/10 p-4 text-sm">
              <p><b>{found.orderId}</b> <span className="opacity-50">· {found.lane} · ${found.total}</span></p>
              <p className="mt-1 opacity-70">{found.items.map((i) => `${i.name} ×${i.qty} (${i.size})`).join(", ")}</p>
              <p className="mt-2 inline-block rounded-full bg-white/10 px-3 py-1 text-xs">received → packing</p>
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-white/10 p-4 text-sm opacity-80">
              Order <b>{id.trim()}</b>: {t("trackNote")}
            </p>
          ))}
        </>
      )}
    </main>
  );
}

export default function Track() {
  return (
    <Suspense>
      <Body />
    </Suspense>
  );
}
