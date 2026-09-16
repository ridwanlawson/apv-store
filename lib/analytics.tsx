"use client";
import { useEffect } from "react";

// Umami (gratis, ~2KB, tanpa cookie). Aktif HANYA setelah consent "accepted".
// Env: NEXT_PUBLIC_UMAMI_URL=https://cloud.umami.is NEXT_PUBLIC_UMAMI_ID=<website-id>
export const CONSENT_KEY = "apv-consent-v1";

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, unknown>) => void };
  }
}

/** Event manual (checkout/purchase). Tanpa PII. */
export function trackEvent(event: string, data?: Record<string, unknown>) {
  try {
    if (typeof window !== "undefined" && localStorage.getItem(CONSENT_KEY) === "accepted") {
      window.umami?.track(event, data);
    }
  } catch {
    /* abaikan */
  }
}

export function Analytics() {
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_UMAMI_URL;
    const id = process.env.NEXT_PUBLIC_UMAMI_ID ?? process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
    if (!url || !id) return;
    let loaded = false;
    const load = () => {
      if (loaded) return;
      try {
        if (localStorage.getItem(CONSENT_KEY) !== "accepted") return;
      } catch {
        return;
      }
      loaded = true;
      const s = document.createElement("script");
      s.defer = true;
      s.src = `${url.replace(/\/$/, "")}/script.js`;
      s.setAttribute("data-website-id", id);
      document.head.appendChild(s);
    };
    load();
    window.addEventListener("storage", load);
    window.addEventListener("apv-consent", load);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener("apv-consent", load);
    };
  }, []);
  return null;
}
