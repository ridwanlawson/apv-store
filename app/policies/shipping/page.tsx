import { getBrand } from "@/brands";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shipping — worldwide" };

export default function Shipping() {
  const b = getBrand();
  return (
    <main className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="font-display text-4xl">SHIPPING WORLDWIDE</h1>
      <div className="mt-6 flex flex-col gap-4 text-sm opacity-85">
        <p><b>Economy (Pos EMS/e-Packet):</b> ~$14, 10–20 business days, tracked. Best for tees, caps, totes.</p>
        <p><b>Express (DHL via aggregator):</b> ~$32, 3–7 business days, tracked + priority customs. Best for orders over $75.</p>
        <p><b>Print-on-demand:</b> printed & shipped from the nearest hub (US/EU), no Indonesia leg.</p>
        <p><b>Duties:</b> prices exclude import duties (DDU) — US $800, EU €150, UK £135 thresholds. Buyer pays any charges.</p>
        <p>Questions: {b.contact}</p>
      </div>
    </main>
  );
}
