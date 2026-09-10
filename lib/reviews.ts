// Sample reviews terstruktur (deterministik per slug — stabil SSR/client).
// Ganti dengan review asli (Judge.me/Loox/import CSV) saat live.
export interface Review { name: string; country: string; rating: number; title: string; body: string; size: string }

const pool: Review[] = [
  { name: "Marcus", country: "US", rating: 5, title: "Heavy like promised", body: "240 GSM is no joke. Fits true, collar kept shape after 3 washes.", size: "M" },
  { name: "Sofia", country: "DE", rating: 5, title: "Survived EU shipping", body: "12 days to Berlin, packaging solid. Print crisp, no cracking.", size: "S" },
  { name: "Rizky", country: "ID", rating: 4, title: "Bagus, size up kalau oversize", body: "Bahan tebal adem. Saya 175cm ambil L untuk fit oversize, pas.", size: "L" },
  { name: "Dan", country: "UK", rating: 5, title: "Third order", body: "Quality consistent across drops. Duties under threshold, no extra fees.", size: "M" },
  { name: "Yuki", country: "JP", rating: 4, title: "Good, slow economy lane", body: "Shirt great. Economy took 16 days — pay express if impatient.", size: "M" },
  { name: "Alina", country: "FR", rating: 5, title: "Parfait", body: "Coupe nette, tissu lourd. Le guide des tailles est juste.", size: "S" },
];

const sum = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0);

export function getReviews(slug: string): { avg: number; count: number; dist: number[]; list: Review[] } {
  const h = sum(slug);
  const count = 18 + (h % 40);
  const avg = 4.4 + ((h % 5) / 10);
  const dist = [72, 19, 6, 2, 1];
  const list = [0, 1, 2].map((k) => pool[(h + k * 2) % pool.length]);
  return { avg: Math.round(avg * 10) / 10, count, dist, list };
}

export function stars(rating: number): string {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}
