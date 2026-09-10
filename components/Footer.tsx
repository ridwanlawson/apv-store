"use client";
import Image from "next/image";
import { useBrand } from "@/lib/brand-store";
import { useT } from "@/lib/i18n";

export function Footer() {
  const b = useBrand();
  const t = useT();
  return (
    <footer className="mt-20 border-t border-white/10 px-4 py-10 text-sm opacity-70">
      {b.logoFull && (
        <div className="mx-auto mb-8 flex max-w-6xl justify-center">
          <Image src={b.logoFull} alt={`${b.name} lockup`} width={480} height={270} className="h-20 w-auto opacity-90 sm:h-24" loading="lazy" />
        </div>
      )}
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
