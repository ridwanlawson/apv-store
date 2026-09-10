# Sequence tee-705 — 240 frames scroll-scrub (asset user, compressed 66MB → 4.9MB)

- Sumber: `D:\dev\assets\` (00001.png–00240.png, 1280×720, ~20KB/frame) + `spin.mp4` (fallback).
- Journey: 001–180 rotasi 360° (060/120 side-back, hanger kayu terlihat) · 181–210 push-in logo · 211–240 macro kain.
- Bukan loop: 240 ≠ 001 → desain satu arah (scrollytelling), bukan spin infinite.
- Catatan: logo "705" (placeholder, ganti frame APV asli nanti) · sparkle AI 2–3 frame · hanger di-crop via CSS object-position.
- Ganti produk: taruh frame baru di `public/seq/<slug>/` (00001.png… + spin.mp4 opsional), set `sequence: "<slug>"` di `brands/*.ts`.
