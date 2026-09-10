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
  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="font-display text-5xl">{t("successT")}</h1>
      <p className="mt-3 opacity-70">Order <b>{order}</b> {t("successD")}</p>
      <div className="mt-6 flex justify-center gap-3">
        {wa && <a href={decodeURIComponent(wa)} target="_blank" rel="noreferrer" className="rounded-xl bg-white px-6 py-3 font-bold text-black">{t("waBtn")}</a>}
        <Link href="/track-order" className="rounded-xl border border-white/30 px-6 py-3">{t("trackBtn")}</Link>
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
