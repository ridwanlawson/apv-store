// Payment skeleton: alur asli = /api/checkout. Stub di bawah aktif saat KYC done.
// Activate later by filling keys in Hub (/super) — no cart/checkout rewrite.
export type Lane = "economy" | "express";
export interface CheckoutInput { brandId: string; email: string; lane: Lane; items: { slug: string; qty: number; size: string }[] }
export interface CheckoutResult { orderId: string; url: string }

export async function stripeCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  void input;
  throw Object.assign(new Error("Stripe not configured (KYC hold)"), { status: 501 });
}
export async function paypalCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  void input;
  throw Object.assign(new Error("PayPal not configured (KYC hold)"), { status: 501 });
}
export async function dokuCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  void input;
  throw Object.assign(new Error("DOKU not configured (KYC hold)"), { status: 501 });
}
