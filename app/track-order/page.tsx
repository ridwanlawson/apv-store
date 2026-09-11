"use client";
import { useState } from "react";
import { useT } from "@/lib/i18n";
import { listOrders } from "@/lib/orders";
import { useMounted } from "@/lib/store";

export default function Track() {
  const t = useT();
  const mounted = useMounted();
  const [id, setId] = useState("");
  const q = id.trim().toLowerCase();
  // Order browser ini (tersimpan saat checkout). Lintas device = tanya admin via email.
  const found = mounted && q
    ? listOrders().find((o) => o.orderId.toLowerCase() === q || o.orderId.toLowerCase().startsWith(q))
    : undefined;
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-display text-4xl">{t("trackT")}</h1>
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
    </main>
  );
}
