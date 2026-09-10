"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import type { Lane } from "@/lib/payments";
import { saveOrderLocal } from "@/lib/orders";
import { Price } from "@/lib/currency";

export default function CartPage() {
  const { items, total, remove, clear } = useCart();
  const [email, setEmail] = useState("");
  const [lane, setLane] = useState<Lane>("economy");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();
  const ship = items.length === 0 ? 0 : lane === "economy" ? 14 : 32;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-4xl">CART</h1>
      {items.length === 0 ? <p className="mt-6 opacity-60">Empty. Go grab the drop.</p> : (
        <div className="mt-6 flex flex-col gap-4">
          {items.map((i) => (
            <div key={i.slug + i.size} className="flex items-center gap-3 rounded-xl border border-white/10 p-3">
              <div className="relative h-20 w-16 overflow-hidden rounded-lg"><Image src={i.image} alt={i.name} fill className="object-cover" sizes="100px" /></div>
              <div className="flex-1">
                <p className="font-semibold">{i.name} <span className="opacity-50">· {i.size} × {i.qty}</span></p>
                <p className="text-sm opacity-70"><Price usdAmount={i.price * i.qty} /></p>
              </div>
              <button onClick={() => remove(i.slug, i.size)} className="rounded-lg border border-white/20 px-3 py-2 cursor-pointer hover:bg-white/10" aria-label={`Remove ${i.name}`}>Remove</button>
            </div>
          ))}
          <label className="text-sm">Email for tracking
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@email.com"
              className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 outline-none focus:border-white/50" />
          </label>
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Shipping lane">
            {(["economy", "express"] as Lane[]).map((l) => (
              <button key={l} role="radio" aria-checked={lane === l} onClick={() => setLane(l)}
                className={`rounded-xl border p-4 text-left cursor-pointer ${lane === l ? "border-white bg-white/10" : "border-white/15"}`}>
                <p className="font-bold capitalize">{l}</p>
                <p className="text-sm opacity-60">{l === "economy" ? "Pos EMS · 10–20 days · ~$14" : "DHL Express · 3–7 days · ~$32"}</p>
              </button>
            ))}
          </div>
          <p className="text-right text-lg font-bold">Total + ship: <Price usdAmount={total + ship} /> <span className="text-xs font-normal opacity-50">(checkout charged in USD)</span></p>
          {err && <p role="alert" className="text-sm text-red-400">{err}</p>}
          <button disabled={loading} onClick={async () => {
            if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setErr("Enter a valid email."); return; }
            setErr(""); setLoading(true);
            try {
              const key = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
              const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email, lane, idempotencyKey: key,
                  items: items.map((i) => ({ slug: i.slug, qty: i.qty, size: i.size, name: i.name, price: i.price })),
                }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error ?? "Checkout failed");
              saveOrderLocal({ orderId: data.orderId, email, lane, items, total: data.total, at: Date.now() });
              clear(); router.push(data.url);
            } catch (e) { setErr(e instanceof Error ? e.message : "Checkout failed"); setLoading(false); }
          }} className="min-h-[52px] rounded-xl bg-white font-bold text-black cursor-pointer disabled:opacity-50">
            {loading ? "Placing order…" : "Checkout (mock — payment HOLD)"}
          </button>
          <p className="text-xs opacity-50">Payment HOLD: order via mock + WhatsApp link. Stripe/PayPal/DOKU stubs return 501 until KYC.</p>
        </div>
      )}
    </main>
  );
}
