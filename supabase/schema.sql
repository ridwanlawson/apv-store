-- Supabase schema (multi-brand ready, BigCartel-style). Run in SQL editor.
-- Security: RLS deny-by-default, public reads published products only.
create table if not exists brands (
  id text primary key, name text not null, slug text unique not null,
  template text not null default 'brutal', currency text not null default 'USD',
  config jsonb not null default '{}'::jsonb
);
create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('superadmin','brand_admin','customer')),
  brand_id text references brands(id)
);
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  brand_id text not null references brands(id) on delete cascade,
  name text not null, slug text not null, price_usd int not null check (price_usd >= 0),
  weight_g int not null default 300, type text not null check (type in ('pod','stock')),
  pod_sku text, stock_qty int not null default 0 check (stock_qty >= 0),
  images text[] not null default '{}', sizes text[] not null default '{M}',
  fabric text default '', badge text default '', is_sample boolean default false,
  published boolean default true, unique (brand_id, slug)
);
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  brand_id text not null references brands(id),
  email text not null, items jsonb not null, total_usd int not null,
  lane text not null default 'economy', tracking text default '',
  status text not null default 'received', provider text not null default 'mock',
  idempotency_key text unique, created_at timestamptz default now()
);
alter table brands enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
-- public: read published products + own brand row (idempoten: aman di-run ulang)
drop policy if exists "public brands" on brands;
drop policy if exists "public products" on products;
drop policy if exists "anon insert orders" on orders;
create policy "public brands" on brands for select using (true);
create policy "public products" on products for select using (published = true);
-- superadmin full (via service role / jwt claim check in app); brand_admin scoped in app layer + DB function.
-- Atomic stock decrement (prevents oversell on concurrent orders):
create or replace function decrement_stock(p_brand text, p_slug text, p_qty int)
returns void language plpgsql as $$
begin
  update products set stock_qty = stock_qty - p_qty
  where brand_id = p_brand and slug = p_slug and type = 'stock' and stock_qty >= p_qty;
  if not found then raise exception 'insufficient stock for %', p_slug; end if;
end $$;
-- Seed brand #1
insert into brands (id, name, slug, template) values ('a-private-violence','A Private Violence','a-private-violence','brutal')
on conflict (id) do nothing;
