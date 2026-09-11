-- PATCH 004: kode promo + update order oleh admin.
-- Cara: SQL Editor → New query → paste SELURUH isi → Run. Idempoten.
-- Prasyarat: patch-002 (fungsi is_brand_admin).

-- 1. Tabel promo.
create table if not exists discounts (
  code text primary key,
  percent int not null check (percent between 1 and 90),
  active boolean not null default true,
  created_at timestamptz default now()
);
alter table discounts enable row level security;
-- Publik baca promo aktif (untuk validasi checkout; tanpa ini checkout 400).
drop policy if exists "public read discounts" on discounts;
create policy "public read discounts" on discounts
for select using (active = true);
-- Admin kelola penuh.
drop policy if exists "admin write discounts" on discounts;
create policy "admin write discounts" on discounts
for all to authenticated
using (public.is_brand_admin()) with check (true);

-- 2. Admin boleh update status/tracking order (publik tetap tidak bisa baca/tulis).
drop policy if exists "admin update orders" on orders;
create policy "admin update orders" on orders
for update to authenticated
using (public.is_brand_admin()) with check (true);

-- 3. Kolom status/tracking bila schema awal belum punya (aman di-run ulang).
alter table orders add column if not exists status text not null default 'received';
alter table orders add column if not exists tracking text not null default '';

-- Contoh promo (opsional, hapus baris ini bila tidak perlu):
-- insert into discounts (code, percent) values ('HEMAT10', 10) on conflict do nothing;
