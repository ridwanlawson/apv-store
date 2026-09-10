import type { Metadata } from "next";

export const metadata: Metadata = { title: "Returns — 30 days" };

export default function Returns() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="font-display text-4xl">RETURNS — 30 DAYS</h1>
      <div className="mt-6 flex flex-col gap-4 text-sm opacity-85">
        <p>30 days from delivery, unworn with tags. Email your order id for an RMA.</p>
        <p>Worldwide return shipping is paid by the buyer (tracked). Refund to original method within 7 days of warehouse receipt.</p>
        <p>Print-on-demand misprints: free reprint or refund with photo proof within 14 days.</p>
        <p>AI lifestyle photos are illustrative — the first product photo is always the real garment.</p>
      </div>
    </main>
  );
}
