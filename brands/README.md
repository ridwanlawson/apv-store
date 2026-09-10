# White-label: tambah brand baru < 15 menit (Poin A: 1 deploy per brand)

1. Copy `brands/_template.ts` -> `brands/<id>.ts`, isi nama/logo/warna/font/domain.
2. Taruh aset di `public/brands/<id>/` (logo.svg, og.jpg). Atau pakai URL remote dulu.
3. Daftarkan di `brands/index.ts` registry (1 baris).
4. Di Vercel: duplikat project, set `NEXT_PUBLIC_BRAND=<id>` + custom domain -> Redeploy.
5. Import produk via `/admin` (CSV) atau seed sample. Tandai sample `is_sample:true` untuk purge 1 klik.

Aturan anti-bocor: tidak ada nama brand / hex warna di luar `brands/` + `public/brands/`.
Semua komponen baca via `getBrand()`.
