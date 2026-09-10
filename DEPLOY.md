# DEPLOY GRATIS Rp0 — GitHub + Vercel (Hobby)

Hasil akhir: `https://<nama>.vercel.app` + HTTPS otomatis. Tanpa kartu kredit.

## 1. Taruh kode di GitHub (5 menit, sekali saja)

1. Buka `github.com` → login → **New repository** → nama `apv-store` → **Private** → **Create** (JANGAN centang README).
2. Di PowerShell, dari folder ini:
   ```powershell
   git remote add origin https://github.com/<username-github>/apv-store.git
   git push -u origin main
   ```
   Login via browser saat diminta. Update berikutnya cukup `git push`.

## 2. Deploy ke Vercel (5 menit)

1. Buka `vercel.com` → **Sign Up** → lanjutkan **dengan GitHub**.
2. **Add New → Project** → **Import** repo `apv-store` → framework terdeteksi Next.js (biarkan default).
3. Buka **Environment Variables**, isi persis ini (Production + Preview + Development):

| Name | Value |
|---|---|
| `NEXT_PUBLIC_BRAND` | `a-private-violence` |
| `NEXT_PUBLIC_SINGLE_MODE` | `true` |
| `PAYMENTS_ENABLED` | `false` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://rfeodcwxivgxwyzypsqq.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_a0O8772PcvZHj4D4MPQM6w_qJFt-pBc` |

   (Key di atas = publishable, aman untuk env. JANGAN pernah taruh secret key di sini —
   secret live payment nanti via dashboard manual.)
4. **Deploy** → tunggu ±2 menit → dapat URL `https://apv-store-xxx.vercel.app`.
5. (Opsional) Project → Settings → General → ganti nama project jadi `a-private-violence`
   agar URL cantik: `https://a-private-violence.vercel.app`.

## 3. Verifikasi live (2 menit)

- Buka `/` (hero + scroll-3D), `/shop`, `/product/riot-heavyweight-tee`.
- Test checkout 1x (email sendiri) → cek tabel `orders` di Supabase → baris uuid muncul.
- Hapus baris test itu via Table Editor.

## 4. Update berikutnya

```powershell
git add -A; git commit -m "pesan"; git push
```
Vercel auto-deploy tiap push ke `main`. Pindah custom `.com` nanti: Vercel
Settings → Domains → Add — tanpa ubah kode (sitemap/robots ikut domain otomatis).
