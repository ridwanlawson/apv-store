# SOP Foto & Video Produk (HP + AI gratis)

## Foto mentah (30 mnt/SKU)
1. HP + kain putih + cahaya jendela jam 9–11. Mode 2x zoom, tanpa flash.
2. 5 foto: depan, belakang, detail kain/logo (20cm), dipakai, label.
3. Nama file: `<slug>-1.jpg` … `<slug>-5.jpg` → taruh `D:\dev\assets-apv\`.

## Naikkan kelas dengan AI (gratis)
- Background: CapCut remove BG / Photoroom free → samakan `#F5F5F5`.
- Tajamkan: Upscayl (open-source, offline, tanpa watermark).
- Model AI (hemat, 5–10 SKU pertama): Modelia 20 kredit/bln / Kling try-on / PicCopilot free.
- Video 6 detik: 1 foto on-model → Kling (66 kredit/hari, prompt "slow runway walk") → CapCut (caption+musik+9:16).
- ATURAN: foto utama PDP wajib foto asli. AI hanya foto 2–4 (lifestyle).

## Masuk ke toko
- Via `/admin` → Edit → Upload foto (maks 12, foto pertama = utama) → Simpan.
- Bulk: `/admin` → Import CSV (format dari Export CSV).
- Sequence 3D: frame di `public/seq/<slug>/` (5-digit webp) + set `sequence`, `frames` di pemanggil.
