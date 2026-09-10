import type { Metadata } from "next";
import { SizeGuideContent } from "@/components/SizeGuideContent";

export const metadata: Metadata = { title: "Size Guide — measure once, fit right" };

export default function SizeGuidePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="font-display text-4xl">SIZE GUIDE</h1>
      <p className="mt-1 text-sm opacity-60">Measure once, fit right — worldwide, no returns headache.</p>
      <div className="mt-6">
        <SizeGuideContent />
      </div>
    </main>
  );
}
