"use client";
import { getBrand } from "@/brands";
import { useT } from "@/lib/i18n";

export function Footer() {
  const b = getBrand();
  const t = useT();
  return (
    <footer className="mt-20 border-t border-white/10 px-4 py-10 text-sm opacity-70">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} {b.name} · {b.tagline}</p>
        <nav className="flex flex-wrap gap-4" aria-label="Policies">
          <a href="/size-guide" className="hover:underline">{t("footSize")}</a>
          <a href="/policies/shipping" className="hover:underline">{t("footShip")}</a>
          <a href="/policies/returns" className="hover:underline">{t("footRet")}</a>
          <a href="/policies/privacy" className="hover:underline">{t("footPriv")}</a>
        </nav>
      </div>
      <p className="mx-auto mt-2 max-w-6xl">Contact: {b.contact} · {t("footNote")}</p>
    </footer>
  );
}
