import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-6xl">404</h1>
      <p className="mt-2 opacity-60">This piece sold out into the void.</p>
      <Link href="/" className="mt-6 inline-block rounded-xl bg-white px-6 py-3 font-bold text-black">Back home</Link>
    </main>
  );
}
