import type { Metadata } from "next";
import { getBrand } from "@/brands";

export const metadata: Metadata = { title: "Privacy — GDPR" };

export default function Privacy() {
  const b = getBrand();
  return (
    <main className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="font-display text-4xl">PRIVACY</h1>
      <div className="mt-6 flex flex-col gap-4 text-sm opacity-85">
        <p>We store only what fulfillment needs: email, order items, shipping address. Cards are processed by Stripe/PayPal/DOKU — we never see or store card numbers.</p>
        <p>Analytics is Umami (privacy-friendly, no cookies, no cross-site tracking) and loads only after you click Accept. Decline = no tracking at all.</p>
        <p>Request export or deletion anytime via {b.contact} — answered within 30 days (GDPR).</p>
        {b.address && <p>Controller: {b.name}{b.address ? ` — ${b.address}` : ""} · {b.contact}</p>}
      </div>
    </main>
  );
}
