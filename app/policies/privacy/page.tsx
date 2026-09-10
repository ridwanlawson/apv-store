import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy — GDPR" };

export default function Privacy() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="font-display text-4xl">PRIVACY</h1>
      <div className="mt-6 flex flex-col gap-4 text-sm opacity-85">
        <p>We store only what fulfillment needs: email, order items, shipping address. Cards are processed by Stripe/PayPal/DOKU — we never see or store card numbers.</p>
        <p>Analytics (GA4/Meta Pixel) are cookied with consent. Request export or deletion anytime via support email — answered within 30 days (GDPR).</p>
      </div>
    </main>
  );
}
