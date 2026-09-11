-- PATCH 003: harga coret + decrement stok aman untuk checkout.
-- Cara: SQL Editor → New query → paste SELURUH isi → Run. Idempoten.

-- 1. Kolom harga coret (diskon). Checkout tetap pakai price_usd.
alter table products add column if not exists compare_at_usd int;

-- 2. decrement_stock jadi SECURITY DEFINER (lolos RLS dengan aman —
-- validasi stok tetap di dalam fungsi) + boleh dipanggil publik/checkout.
create or replace function public.decrement_stock(p_brand text, p_slug text, p_qty int)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_qty < 1 or p_qty > 9 then raise exception 'invalid qty'; end if;
  update products set stock_qty = stock_qty - p_qty
  where brand_id = p_brand and slug = p_slug and type = 'stock' and stock_qty >= p_qty;
  if not found then raise exception 'insufficient stock for %', p_slug; end if;
end $$;
grant execute on function public.decrement_stock(text, text, int) to anon, authenticated;
