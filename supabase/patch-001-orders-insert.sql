-- PATCH 001 (rev2): izinkan checkout API menyimpan order.
-- Cara: Supabase Dashboard → SQL Editor → New query → paste SELURUH isi file ini → Run.
-- Aman di-run ulang (idempoten).
-- Catatan: TO public (bukan TO anon) agar cocok untuk semua varian API key.
-- Membaca order tetap lewat service_role / dashboard (email buyer = PII).
drop policy if exists "anon insert orders" on orders;
create policy "anon insert orders"
on orders for insert to public
with check (true);
