"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { useBrand } from "@/lib/brand-store";
import { useT } from "@/lib/i18n";
import { listOrders } from "@/lib/orders";
import { trackEvent } from "@/lib/analytics";

function Inner() {
  const t = useT();
  const b = useBrand();
  const sp = useSearchParams();
  const order = sp.get("order") ?? "";
  const waParam = sp.get("wa");
  const tk = sp.get("tk");
  const trackUrl = tk ? `/track-order?tk=${encodeURIComponent(tk)}` : "/track-order";
  const local = order ? listOrders().find((o) => o.orderId === order) : undefined;
  const waNum = (b.whatsapp ?? "").replace(/\D/g, "");
  const waFallback = waNum.length >= 8 && waNum.length <= 15
    ? `https://wa.me/${waNum}?text=${encodeURIComponent(`Order ${order}`)}`
    : "https://wa.me";
  const wa = waParam ? decodeURIComponent(waParam) : order ? waFallback : null;

  const tracked = useRef(false);
  useEffect(() => {
    if (order && !tracked.current) {
      tracked.current = true;
      trackEvent("purchase", { order });
    }
  }, [order]);

  if (!order) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-5xl">{t("successT")}</h1>
        <p className="mt-3 opacity-70">{t("successEmpty")}</p>
        <Link href="/shop" className="mt-6 inline-block rounded-xl bg-white px-6 py-3 font-bold text-black">{t("continueBtn")}</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="font-display text-5xl">{t("successT")}</h1>
      <p className="mt-3 opacity-70">Order <b>{order}</b> {t("successD")}</p>
      {local && (
        <div className="mx-auto mt-4 max-w-md rounded-xl border border-white/10 p-4 text-left text-sm">
          <p className="opacity-70">{local.email} · {local.lane} · ${local.total}</p>
          <p className="mt-1 opacity-70">{local.items.map((i) => `${i.name} ×${i.qty} (${i.size})`).join(", ")}</p>
        </div>
      )}
      {tk && (
        <p className="mx-auto mt-3 max-w-md rounded-xl border border-white/10 p-3 text-xs opacity-70">
          Simpan link lacak ini (berlaku di device mana pun):<br />
          <Link href={trackUrl} className="break-all underline">{trackUrl}</Link>
        </p>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {wa && <a href={wa} target="_blank" rel="noreferrer" className="rounded-xl bg-white px-6 py-3 font-bold text-black">{t("waBtn")}</a>}
        <Link href={trackUrl} className="rounded-xl border border-white/30 px-6 py-3">{t("trackBtn")}</Link>
        <Link href="/shop" className="rounded-xl border border-white/30 px-6 py-3 opacity-80">{t("continueBtn")}</Link>
      </div>
    </main>
  );
}

export function SuccessBody() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
