"use client";
import { useState } from "react";
import { guides, fmt, recommendTop, recommendBottom, type GuideCategory, type Unit } from "@/lib/sizeguide";

const tabs: { id: GuideCategory; label: string }[] = [
  { id: "tops", label: "Tops" },
  { id: "bottoms", label: "Bottoms" },
  { id: "caps", label: "Caps" },
];

export function SizeGuideContent({ initial = "tops" }: { initial?: GuideCategory }) {
  const [cat, setCat] = useState<GuideCategory>(initial);
  const [unit, setUnit] = useState<Unit>("cm");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [fit, setFit] = useState<"slim" | "regular" | "oversized">("regular");
  const g = guides[cat];
  const topRec = recommendTop(Number(chest), fit);
  const botRec = recommendBottom(Number(waist));

  return (
    <div>
      {/* Tabs + unit */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2" role="tablist" aria-label="Category">
          {tabs.map((t) => (
            <button key={t.id} role="tab" aria-selected={cat === t.id} onClick={() => setCat(t.id)}
              className={`min-h-[40px] rounded-full border px-4 text-sm cursor-pointer ${cat === t.id ? "border-white bg-white font-bold text-black" : "border-white/20"}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-full border border-white/20 p-1 text-sm" role="group" aria-label="Unit">
          {(["cm", "in"] as Unit[]).map((u) => (
            <button key={u} onClick={() => setUnit(u)} aria-pressed={unit === u}
              className={`rounded-full px-3 py-1 cursor-pointer ${unit === u ? "bg-white font-bold text-black" : "opacity-70"}`}>{u}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="bg-white/5 text-left">
              <th className="px-4 py-3 font-semibold">Size</th>
              {g.measures.map((m) => (
                <th key={m.key} className="px-4 py-3 font-semibold" title={m.hint}>{m.label} <span className="font-normal opacity-50">({unit})</span></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {g.sizes.map((s) => (
              <tr key={s} className="border-t border-white/10">
                <td className="px-4 py-2.5 font-bold">{s}</td>
                {g.rows[s].map((v, i) => (
                  <td key={i} className="px-4 py-2.5 tabular-nums">{fmt(v, unit)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs opacity-50">Garment measured flat then doubled where relevant. Between sizes? Size up.</p>

      {/* How to measure */}
      <h3 className="mt-6 font-bold">How to measure (30 seconds)</h3>
      <ol className="mt-2 flex list-decimal flex-col gap-1.5 pl-5 text-sm opacity-80">
        <li><b>Chest/waist:</b> wrap the tape around, snug but 2 fingers loose. Breathe normally.</li>
        <li><b>Length/inseam:</b> measure a piece you already love and compare to the table.</li>
        <li><b>Caps:</b> tape above eyebrows; strap adjusts ±2 cm.</li>
      </ol>

      {/* Fit finder */}
      <h3 className="mt-6 font-bold">Fit finder</h3>
      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <label className="text-xs opacity-70">Chest (cm)
          <input value={chest} onChange={(e) => setChest(e.target.value)} inputMode="decimal" placeholder="e.g. 100"
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-white/50" />
        </label>
        <label className="text-xs opacity-70">Waist (cm)
          <input value={waist} onChange={(e) => setWaist(e.target.value)} inputMode="decimal" placeholder="e.g. 80"
            className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-white/50" />
        </label>
        <label className="text-xs opacity-70">Fit
          <select value={fit} onChange={(e) => setFit(e.target.value as typeof fit)}
            className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2.5 text-sm">
            <option value="slim">Slim</option>
            <option value="regular">Regular</option>
            <option value="oversized">Oversized</option>
          </select>
        </label>
        <div className="self-end pb-0.5 text-sm font-bold" aria-live="polite">
          {chest && (topRec ? `Tops: ${topRec}` : "Tops: —")} {waist && (botRec ? `· Bottoms: ${botRec}` : "· Bottoms: —")}
        </div>
      </div>
      <p className="mt-3 text-xs opacity-50">Model 178 cm / 70 kg wears M. Fits true to size.</p>
    </div>
  );
}
