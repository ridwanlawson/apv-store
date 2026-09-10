"use client";
import { useState } from "react";

export default function Track() {
  const [id, setId] = useState("");
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-display text-4xl">TRACK ORDER</h1>
      <input value={id} onChange={(e) => setId(e.target.value)} placeholder="MOCK-XXXX" aria-label="Order id"
        className="mt-4 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 outline-none focus:border-white/50" />
      {id && <p className="mt-4 rounded-xl border border-white/10 p-4 text-sm opacity-80">Order <b>{id}</b>: mock status — received → packing (Supabase orders table when connected).</p>}
    </main>
  );
}
