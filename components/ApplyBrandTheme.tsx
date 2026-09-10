"use client";
import { useEffect } from "react";
import { useBrand } from "@/lib/brand-store";

// Terapkan brand admin ke runtime: warna tema, favicon, judul tab.
// (Metadata statis tetap dari seed — update penuh saat redeploy.)
export function ApplyBrandTheme() {
  const b = useBrand();
  useEffect(() => {
    try {
      document.body.style.background = b.colors.bg;
      document.body.style.color = b.colors.fg;
      document.body.style.setProperty("--brand-fg", b.colors.fg);
      document.body.style.setProperty("--brand-accent", b.colors.accent);
      document.title = b.seo.title;
      const icon = b.favicon ?? b.logo;
      if (icon) {
        let el = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
        if (!el) {
          el = document.createElement("link");
          el.rel = "icon";
          document.head.appendChild(el);
        }
        el.href = icon;
      }
    } catch {
      /* abaikan */
    }
  }, [b]);
  return null;
}
