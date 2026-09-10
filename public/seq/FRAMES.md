# Sequence tee-705 — 120 frame WebP transparan (scroll-scrub fullscreen)

- Sumber: `D:\dev\assets\` (240 PNG transparan 1280×720, bg removed).
- Build: tiap frame ke-2 → 960px WebP q82 → 00001.webp–00120.webp, total ~2MB.
- Journey: awal–tengah rotasi 360° (hanger kayu terlihat di side view) · akhir push-in logo + macro kain.
- Bukan loop: desain satu arah (scrollytelling). Stage gelap (alpha menyatu).
- Component: `components/ScrollSequence.tsx` (`seq`, `frames`, `ext`), teks via i18n.
- Ganti produk: frame baru di `public/seq/<slug>/` (5-digit webp) + set `sequence: "<slug>"`, `frames` di pemanggil.
- Catatan: logo "705" placeholder; sparkle AI 2–3 frame; spin.mp4 (bg putih) hanya fallback PDP.
