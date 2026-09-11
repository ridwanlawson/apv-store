-- PATCH 005: multi-brand via UI (aktif/nonaktif, domain, template).
-- Cara: SQL Editor → New query → paste SELURUH isi → Run. Idempoten.
-- Prasyarat: patch-002 (fungsi is_brand_admin).

-- 1. Kolom brand management.
alter table brands add column if not exists active boolean not null default true;
alter table brands add column if not exists domain text not null default '';

-- 2. Helper superadmin.
create or replace function public.is_superadmin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from profiles
    where user_id = auth.uid() and role = 'superadmin'
  );
$$;

-- 3. Publik hanya baca brand AKTIF (storefront + sitemap).
drop policy if exists "public brands" on brands;
create policy "public brands" on brands
for select using (active = true);

-- 4. Update brand: superadmin semua; brand_admin hanya brand-nya sendiri.
drop policy if exists "admin update brands" on brands;
create policy "admin update brands" on brands
for update to authenticated
using (
  public.is_superadmin() or (
    public.is_brand_admin()
    and id = (select brand_id from profiles where user_id = auth.uid())
  )
)
with check (
  public.is_superadmin() or (
    public.is_brand_admin()
    and id = (select brand_id from profiles where user_id = auth.uid())
  )
);

-- 5. Tambah/hapus brand: superadmin saja.
drop policy if exists "superadmin insert brands" on brands;
create policy "superadmin insert brands" on brands
for insert to authenticated with check (public.is_superadmin());
drop policy if exists "superadmin delete brands" on brands;
create policy "superadmin delete brands" on brands
for delete to authenticated using (public.is_superadmin());

-- AKTIVASI SUPERADMIN PERTAMA (ganti UID + jalankan sekali):
-- insert into profiles (user_id, role, brand_id)
-- values ('PASTE-UID-DI-SINI', 'superadmin', 'a-private-violence')
-- on conflict (user_id) do update set role = 'superadmin';
