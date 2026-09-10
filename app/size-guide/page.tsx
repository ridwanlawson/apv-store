"use client";
import { SizeGuideContent } from "@/components/SizeGuideContent";
import { useT } from "@/lib/i18n";

export default function SizeGuidePage() {
  const t = useT();
  return (
    <main className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="font-display text-4xl">{t("sgTitle")}</h1>
      <p className="mt-1 text-sm opacity-60">{t("sgSub")}</p>
      <div className="mt-6">
        <SizeGuideContent />
      </div>
    </main>
  );
}
