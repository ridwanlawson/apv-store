// Size guide data + fit-finder logic (pure, testable).
// Satuan canonical cm; inch dihitung (dibulatkan 0.5).
export type GuideCategory = "tops" | "bottoms" | "caps";
export type Unit = "cm" | "in";

export interface SizeRow { size: string; [measure: string]: string | number }

interface Guide {
  sizes: string[];
  measures: { key: string; label: string; hint: string }[];
  rows: Record<string, number[]>; // size -> values per measures (cm)
}

export const guides: Record<GuideCategory, Guide> = {
  tops: {
    sizes: ["S", "M", "L", "XL"],
    measures: [
      { key: "chest", label: "Chest", hint: "Lingkar dada, meteran di bawah ketiak" },
      { key: "length", label: "Length", hint: "Bahu tertinggi ke ujung bawah" },
      { key: "sleeve", label: "Sleeve", hint: "Bahu ke pergelangan" },
      { key: "shoulder", label: "Shoulder", hint: "Ujung bahu kiri ke kanan" },
    ],
    rows: {
      S: [102, 68, 58, 44],
      M: [108, 71, 60, 46],
      L: [114, 74, 62, 48],
      XL: [120, 77, 64, 50],
    },
  },
  bottoms: {
    sizes: ["30", "32", "34"],
    measures: [
      { key: "waist", label: "Waist", hint: "Lingkar pinggang, 2 jari longgar" },
      { key: "hip", label: "Hip", hint: "Lingkar pinggul terlebar" },
      { key: "inseam", label: "Inseam", hint: "Selangkangan ke mata kaki" },
      { key: "thigh", label: "Thigh", hint: "Lingkar paha 5cm di bawah selangkangan" },
    ],
    rows: {
      "30": [76, 104, 76, 62],
      "32": [81, 109, 78, 64],
      "34": [86, 114, 80, 66],
    },
  },
  caps: {
    sizes: ["OS"],
    measures: [
      { key: "head", label: "Head", hint: "Lingkar kepala di atas alis, adjustable strap" },
    ],
    rows: { OS: [58] },
  },
};

export const toIn = (cm: number) => Math.round((cm / 2.54) * 2) / 2;

export function fmt(cm: number, unit: Unit): string {
  return unit === "cm" ? `${cm}` : `${toIn(cm)}`;
}

/** Rekomendasi size atasan dari lingkar dada + preferensi fit. */
export function recommendTop(chestCm: number, fit: "slim" | "regular" | "oversized"): string | null {
  if (!Number.isFinite(chestCm) || chestCm < 70 || chestCm > 160) return null;
  const ease = fit === "slim" ? 2 : fit === "regular" ? 6 : 12;
  for (const s of guides.tops.sizes) {
    if (guides.tops.rows[s][0] >= chestCm + ease) return s;
  }
  return "XL";
}

/** Rekomendasi size bawahan dari lingkar pinggang (cm). */
export function recommendBottom(waistCm: number): string | null {
  if (!Number.isFinite(waistCm) || waistCm < 60 || waistCm > 120) return null;
  let best = guides.bottoms.sizes[0];
  let gap = Infinity;
  for (const s of guides.bottoms.sizes) {
    const g = Math.abs(guides.bottoms.rows[s][0] - waistCm);
    if (g < gap) { gap = g; best = s; }
  }
  return best;
}

/** Kategori guide dari nama produk (tanpa field baru — works untuk produk admin juga). */
export function categoryForProduct(name: string): GuideCategory {
  const n = name.toLowerCase();
  if (/(cap|beanie|hat)/.test(n)) return "caps";
  if (/(pant|cargo|jean|trouser|short|skirt)/.test(n)) return "bottoms";
  return "tops";
}
