import { NextResponse } from "next/server";

// Stub: returns 501 until provider KYC done. Production must verify signature + timestamp + idempotency key.
export async function POST(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  void req;
  return NextResponse.json({ error: `${provider} not configured (KYC hold)` }, { status: 501 });
}
