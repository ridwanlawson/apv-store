"use client";
import { useState } from "react";
import { useT } from "@/lib/i18n";

export default function Track() {
  const t = useT();
  const [id, setId] = useState("");
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-display text-4xl">{t("trackT")}</h1>
      <input value={id} onChange={(e) => setId(e.target.value)} placeholder={t("trackPh")} aria-label="Order id"
        className="mt-4 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 outline-none focus:border-white/50" />
      {id && <p className="mt-4 rounded-xl border border-white/10 p-4 text-sm opacity-80">Order <b>{id}</b>: {t("trackNote")} (Supabase orders).</p>}
    </main>
  );
}
