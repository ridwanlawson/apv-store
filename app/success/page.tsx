"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useT } from "@/lib/i18n";

function Body() {
  const t = useT();
  const sp = useSearchParams();
  const order = sp.get("order") ?? "MOCK";
  const wa = sp.get("wa");
  const tk = sp.get("tk");
  const trackUrl = tk ? `/track-order?tk=${encodeURIComponent(tk)}` : "/track-order";
  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="font-display text-5xl">{t("successT")}</h1>
      <p className="mt-3 opacity-70">Order <b>{order}</b> {t("successD")}</p>
      {tk && (
        <p className="mx-auto mt-3 max-w-md rounded-xl border border-white/10 p-3 text-xs opacity-70">
          Simpan link lacak ini (berlaku di device mana pun):<br />
          <Link href={trackUrl} className="break-all underline">{trackUrl}</Link>
        </p>
      )}
      <div className="mt-6 flex justify-center gap-3">
        {wa && <a href={decodeURIComponent(wa)} target="_blank" rel="noreferrer" className="rounded-xl bg-white px-6 py-3 font-bold text-black">{t("waBtn")}</a>}
        <Link href={trackUrl} className="rounded-xl border border-white/30 px-6 py-3">{t("trackBtn")}</Link>
      </div>
    </main>
  );
}

export default function Success() {
  return (
    <Suspense>
      <Body />
    </Suspense>
  );
}
