-- PATCH 006: kunci pintu admin + track publik aman.
-- Cara: SQL Editor → New query → paste SELURUH isi → Run. Idempoten.
-- Prasyarat: patch-002, patch-005.

-- 1. Email di profiles (superadmin bisa lihat SIAPA yang minta akses).
alter table profiles add column if not exists email text not null default '';

-- 2. Self-register sebagai PENDING saja (tidak bisa self-promote ke admin).
drop policy if exists "self register pending" on profiles;
create policy "self register pending" on profiles
for insert to authenticated
with check (user_id = auth.uid() and role = 'pending');

-- 3. Superadmin: baca semua profiles + ubah role.
drop policy if exists "superadmin read profiles" on profiles;
create policy "superadmin read profiles" on profiles
for select to authenticated using (public.is_superadmin());
drop policy if exists "superadmin update profiles" on profiles;
create policy "superadmin update profiles" on profiles
for update to authenticated
using (public.is_superadmin()) with check (true);

-- 4. Token lacak publik per order (uuid acak, ditebak tidak mungkin).
alter table orders add column if not exists track_token text;
-- Backfill baris lama yang null (Postgres ≥13: gen_random_uuid butuh pgcrypto;
-- jadi pakai md5 acak — cukup unik untuk token lacak).
update orders set track_token = md5(random()::text || id::text)
where track_token is null;

-- AKTIVASI (cukup sekali per orang, tanpa SQL setelah ini):
-- 1. Orang tersebut login magic-link 1x di /admin (otomatis tercatat pending).
-- 2. Superadmin buka /super → setujui sebagai brand_admin / superadmin / tolak.
-- Bootstrap superadmin pertama tetap 1x SQL manual (sudah dilakukan).
