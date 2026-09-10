import Link from "next/link";

export default async function Success({ searchParams }: { searchParams: Promise<{ order?: string; wa?: string }> }) {
  const { order, wa } = await searchParams;
  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="font-display text-5xl">ORDER LOCKED ✓</h1>
      <p className="mt-3 opacity-70">Order <b>{order ?? "MOCK"}</b> recorded (mock checkout). Track it below.</p>
      <div className="mt-6 flex justify-center gap-3">
        {wa && <a href={decodeURIComponent(wa)} target="_blank" rel="noreferrer" className="rounded-xl bg-white px-6 py-3 font-bold text-black">Confirm via WhatsApp</a>}
        <Link href="/track-order" className="rounded-xl border border-white/30 px-6 py-3">Track order</Link>
      </div>
    </main>
  );
}
