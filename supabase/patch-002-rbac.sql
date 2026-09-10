-- PATCH 002: RBAC admin + kolom produk kurang + policies tulis/baca.
-- Cara: SQL Editor → New query → paste SELURUH isi → Run. Idempoten.
-- Setelah ini: daftarkan 1 admin (lihat langkah AKTIVASI di bawah).

-- 0. Kolom yang dipakai editor produk (colors, video).
alter table products add column if not exists colors text[] not null default '{Black}';
alter table products add column if not exists video text;

-- 1. profiles: RLS + baca profil sendiri.
alter table profiles enable row level security;
drop policy if exists "own profile" on profiles;
create policy "own profile" on profiles
for select to authenticated using (auth.uid() = user_id);

-- 2. Helper cek admin (SECURITY DEFINER = lolos RLS profiles dengan aman).
create or replace function public.is_brand_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from profiles
    where user_id = auth.uid() and role in ('superadmin', 'brand_admin')
  );
$$;

-- 3. brands: admin boleh update config tampilan.
drop policy if exists "admin update brands" on brands;
create policy "admin update brands" on brands
for update to authenticated
using (public.is_brand_admin()) with check (true);

-- 4. products: admin baca semua (termasuk unpublished) + tulis penuh.
drop policy if exists "admin read products" on products;
create policy "admin read products" on products
for select to authenticated using (public.is_brand_admin());
drop policy if exists "admin write products" on products;
create policy "admin write products" on products
for all to authenticated
using (public.is_brand_admin()) with check (true);

-- 5. orders: admin boleh baca (publik/anon tetap tidak bisa — lindungi email buyer).
drop policy if exists "admin read orders" on orders;
create policy "admin read orders" on orders
for select to authenticated using (public.is_brand_admin());

-- AKTIVASI ADMIN (setelah user login magic-link 1x):
-- 1. Dashboard → Authentication → Users → klik user → copy UID.
-- 2. Jalankan (ganti UID):
--    insert into profiles (user_id, role, brand_id)
--    values ('PASTE-UID-DI-SINI', 'brand_admin', 'a-private-violence');
-- Tanpa baris profiles = user login tapi tetap tidak bisa tulis (deny by default).
