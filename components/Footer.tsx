"use client";
import Image from "next/image";
import { useBrand } from "@/lib/brand-store";
import { useT } from "@/lib/i18n";

export function Footer() {
  const b = useBrand();
  const t = useT();
  return (
    <footer className="mt-20 border-t border-white/10 px-4 pb-10 pt-14 text-sm">
      <p className="mx-auto max-w-6xl text-center font-display text-[11vw] leading-[0.95] tracking-tight opacity-90 sm:text-7xl" aria-label={b.tagline}>
        {b.tagline.toUpperCase() || b.name.toUpperCase()}
      </p>
      {b.logoFull && (
        <div className="mx-auto mb-8 mt-8 flex max-w-6xl justify-center opacity-70">
          <Image src={b.logoFull} alt={`${b.name} lockup`} width={480} height={270} className="h-20 w-auto opacity-90 sm:h-24" loading="lazy" />
        </div>
      )}
      <div className="mx-auto flex max-w-6xl flex-col gap-2 opacity-70 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} {b.name} · {b.tagline}</p>
        <nav className="flex flex-wrap gap-4" aria-label="Policies">
          <a href="/size-guide" className="hover:underline">{t("footSize")}</a>
          <a href="/policies/shipping" className="hover:underline">{t("footShip")}</a>
          <a href="/policies/returns" className="hover:underline">{t("footRet")}</a>
          <a href="/policies/privacy" className="hover:underline">{t("footPriv")}</a>
          <a href="/policies/terms" className="hover:underline">{t("footTerms")}</a>
        </nav>
      </div>
      <div className="mx-auto mt-2 max-w-6xl space-y-1 opacity-70">
        <p>Contact: {b.contact}{b.phone ? ` · ${b.phone}` : ""} · {t("footNote")}</p>
        {b.address && (
          <p>{b.address}{b.hours ? ` · ${b.hours}` : ""}{b.mapsUrl ? <> · <a href={b.mapsUrl} target="_blank" rel="noreferrer" className="underline">Maps</a></> : null}</p>
        )}
        {(b.socials.instagram || b.socials.tiktok) && (
          <p className="flex gap-4">
            {b.socials.instagram && <a href={b.socials.instagram} target="_blank" rel="noreferrer" className="hover:underline">Instagram</a>}
            {b.socials.tiktok && <a href={b.socials.tiktok} target="_blank" rel="noreferrer" className="hover:underline">TikTok</a>}
          </p>
        )}
      </div>
    </footer>
  );
}
