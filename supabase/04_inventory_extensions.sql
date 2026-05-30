-- Extensions for the existing Chekgo schema.
-- Run this after 00_reset, 01_auth_profiles, 02_schema_init, and 03_dummy_data.

create table if not exists public.wishlist_items (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id bigint not null references public.places(id) on delete cascade,
  product_id bigint not null references public.products(id) on delete restrict,
  desired_quantity numeric(10, 2) not null default 1,
  status text not null default 'active' check (status in ('active', 'purchased', 'archived')),
  created_at timestamptz not null default now(),
  unique (user_id, place_id, product_id, status)
);

alter table public.wishlist_items enable row level security;

drop policy if exists "Users can manage own wishlist items" on public.wishlist_items;

create policy "Users can manage own wishlist items"
on public.wishlist_items
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- The app can create new stores/products from receipt or manual registration.
drop policy if exists "Authenticated users can create stores" on public.stores;
drop policy if exists "Authenticated users can create products" on public.products;

create policy "Authenticated users can create stores"
on public.stores
for insert
to authenticated
with check (true);

create policy "Authenticated users can create products"
on public.products
for insert
to authenticated
with check (true);

-- 1. Wishlist candidate view:
-- each user's place/product stock where current quantity is at or below the product threshold.
create or replace view public.low_stock_items as
select
  i.id as inventory_id,
  i.user_id,
  i.place_id,
  pl.name as place_name,
  pl.place_type,
  i.product_id,
  pr.name as product_name,
  pr.brand,
  pr.unit,
  c.name as category,
  i.current_quantity,
  pr.low_stock_threshold,
  i.updated_at
from public.inventories i
join public.places pl on pl.id = i.place_id
join public.products pr on pr.id = i.product_id
join public.categories c on c.id = pr.category_id
where i.current_quantity <= pr.low_stock_threshold;

-- 2. Product insight view:
-- lowest purchase price and average interval between OUT movements.
create or replace view public.product_insights as
with out_movements as (
  select
    user_id,
    product_id,
    moved_at,
    lag(moved_at) over (
      partition by user_id, product_id
      order by moved_at
    ) as previous_moved_at
  from public.stock_movements
  where movement_type = 'OUT'
)
select
  p.id as product_id,
  p.name as product_name,
  p.brand,
  p.unit,
  c.name as category,
  poi.user_id,
  min(poi.unit_price) as lowest_unit_price,
  avg(extract(epoch from (om.moved_at - om.previous_moved_at)) / 86400.0) as average_usage_interval_days
from public.products p
join public.categories c on c.id = p.category_id
left join public.purchase_order_items poi on poi.product_id = p.id
left join out_movements om
  on om.product_id = p.id
 and om.user_id = poi.user_id
 and om.previous_moved_at is not null
group by p.id, p.name, p.brand, p.unit, c.name, poi.user_id;

-- 3. Food ledger view:
-- food expense is recognized on OUT date, not purchase date.
create or replace view public.daily_food_expenses as
select
  sm.user_id,
  sm.place_id,
  pl.name as place_name,
  sm.moved_at::date as spent_on,
  sm.product_id,
  pr.name as product_name,
  pr.brand,
  abs(sm.quantity) as consumed_quantity,
  pr.unit,
  coalesce(poi.unit_price, 0) as unit_price,
  abs(sm.quantity) * coalesce(poi.unit_price, 0) as consumed_amount,
  sm.note
from public.stock_movements sm
join public.products pr on pr.id = sm.product_id
join public.categories c on c.id = pr.category_id
join public.places pl on pl.id = sm.place_id
left join public.purchase_order_items poi on poi.id = sm.purchase_order_item_id
where sm.movement_type = 'OUT'
  and pr.is_food = true;
