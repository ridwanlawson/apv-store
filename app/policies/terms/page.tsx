import type { Metadata } from "next";
import { getBrand } from "@/brands";

export const metadata: Metadata = { title: "Terms — conditions of sale" };

export default function Terms() {
  const b = getBrand();
  return (
    <main className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="font-display text-4xl">TERMS</h1>
      <div className="mt-6 flex flex-col gap-4 text-sm opacity-85">
        <p><b>Prices & payment.</b> All prices in USD at checkout. Payment is on hold (mock + WhatsApp confirmation) until KYC completes — no card is charged on this site today.</p>
        <p><b>Order acceptance.</b> An order is confirmed when you receive an order ID. We may cancel (refund in full) for stock errors, failed payments, or suspected fraud.</p>
        <p><b>Shipping & duties.</b> Economy 10–20 business days (~$14), Express 3–7 (~$32). Prices exclude import duties (DDU) — the buyer pays any charges.</p>
        <p><b>Returns.</b> 30 days, unworn with tags. Buyer pays return shipping. Print-on-demand pieces are made to order and returnable only if defective/wrong.</p>
        <p><b>Intellectual property.</b> All artwork, photos, and copy belong to {b.name}. No reproduction without permission.</p>
        <p>Questions: {b.contact}{b.address ? ` · ${b.address}` : ""}</p>
      </div>
    </main>
  );
}
