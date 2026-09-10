"use client";
import { useState } from "react";
import { useMounted } from "@/lib/store";

const KEY = "apv-consent-v1";

// GDPR: analitik hanya jalan setelah consent. Tanpa pilihan = tidak dilacak.
export function CookieConsent() {
  const mounted = useMounted();
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return !localStorage.getItem(KEY);
    } catch {
      return false;
    }
  });
  if (!mounted || !visible) return null;

  const pick = (v: "accepted" | "declined") => {
    try {
      localStorage.setItem(KEY, v);
    } catch {
      /* abaikan */
    }
    setVisible(false);
  };

  return (
    <div role="dialog" aria-label="Cookie consent" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl border border-white/15 bg-[#141210] p-4 shadow-2xl">
      <p className="text-sm"><b>Cookies.</b> Kami pakai yang esensial saja. Analitik (GA4/Pixel) hanya aktif jika kamu setuju.</p>
      <div className="mt-3 flex gap-2">
        <button onClick={() => pick("accepted")} className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-black cursor-pointer">Accept</button>
        <button onClick={() => pick("declined")} className="rounded-lg border border-white/25 px-4 py-2 text-sm cursor-pointer">Decline</button>
        <a href="/policies/privacy" className="ml-auto self-center text-sm underline opacity-70">Privacy</a>
      </div>
    </div>
  );
}
