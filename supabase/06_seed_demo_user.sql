-- Demo data for one shared test user.
-- Replace REPLACE_WITH_USER_UID with the UID from Authentication > Users.
-- This resets only the selected user's app data, then inserts demo places,
-- purchases, stock movements, and calculated inventories.

drop table if exists temp_demo_user;

create temporary table temp_demo_user (
  user_id uuid not null
);

insert into temp_demo_user (user_id)
values ('REPLACE_WITH_USER_UID'::uuid);

-- Reset only this user's app data.
delete from public.wishlist_items
where user_id in (select user_id from temp_demo_user);

delete from public.stock_movements
where user_id in (select user_id from temp_demo_user);

delete from public.purchase_order_items
where user_id in (select user_id from temp_demo_user);

delete from public.purchase_orders
where user_id in (select user_id from temp_demo_user);

delete from public.inventories
where user_id in (select user_id from temp_demo_user);

delete from public.places
where user_id in (select user_id from temp_demo_user);

-- Shared reference data.
insert into public.categories (name)
select category_name
from (
  values
    ('식품'),
    ('생활용품'),
    ('화장품'),
    ('의약품')
) as v(category_name)
where not exists (
  select 1 from public.categories c where c.name = v.category_name
);

insert into public.stores (name)
select store_name
from (
  values
    ('쿠팡'),
    ('이마트'),
    ('네이버쇼핑'),
    ('올리브영'),
    ('다이소'),
    ('동네마트')
) as v(store_name)
where not exists (
  select 1 from public.stores s where s.name = v.store_name
);

insert into public.products (
  category_id,
  name,
  brand,
  unit,
  is_food,
  low_stock_threshold
)
select
  c.id,
  v.name,
  v.brand,
  v.unit,
  v.is_food,
  v.low_stock_threshold
from (
  values
    ('식품', '닭가슴살', '하림', '개', true, 2),
    ('식품', '계란', '풀무원', '개', true, 4),
    ('식품', '쌀', '농협', 'kg', true, 1),
    ('식품', '우유', '서울우유', '팩', true, 1),
    ('식품', '두부', '풀무원', '개', true, 1),
    ('생활용품', '샴푸', '려', '개', false, 1),
    ('생활용품', '세탁세제', '퍼실', '개', false, 1),
    ('생활용품', '휴지', '크리넥스', '롤', false, 3),
    ('화장품', '핸드크림', '카밀', '개', false, 1),
    ('화장품', '토너', '라운드랩', '개', false, 1),
    ('화장품', '클렌징폼', '이니스프리', '개', false, 1)
) as v(category_name, name, brand, unit, is_food, low_stock_threshold)
join public.categories c on c.name = v.category_name
where not exists (
  select 1
  from public.products p
  where p.category_id = c.id
    and p.name = v.name
    and coalesce(p.brand, '') = coalesce(v.brand, '')
);

-- App places. These place_type values match src/data/mockData.jsx.
insert into public.places (
  user_id,
  name,
  place_type
)
select
  t.user_id,
  v.name,
  v.place_type
from temp_demo_user t,
(
  values
    ('집', 'home'),
    ('기숙사', 'dorm'),
    ('회사', 'office')
) as v(name, place_type);

-- Purchase orders.
insert into public.purchase_orders (
  user_id,
  place_id,
  store_id,
  purchased_at,
  total_amount,
  note
)
select
  t.user_id,
  pl.id,
  st.id,
  v.purchased_at::timestamptz,
  v.total_amount,
  v.note
from temp_demo_user t
join (
  values
    ('dorm', '쿠팡', '2026-05-01 10:10:00+09', 29900, '닭가슴살 대량 구매'),
    ('dorm', '이마트', '2026-05-03 18:40:00+09', 12800, '계란과 우유 구매'),
    ('dorm', '동네마트', '2026-05-07 19:00:00+09', 8900, '두부와 우유 구매'),
    ('home', '이마트', '2026-05-10 15:00:00+09', 36000, '생활용품 보충'),
    ('home', '네이버쇼핑', '2026-05-12 21:00:00+09', 7900, '핸드크림 구매'),
    ('office', '다이소', '2026-05-15 13:00:00+09', 5000, '휴지 보충'),
    ('dorm', '쿠팡', '2026-05-20 11:00:00+09', 25900, '닭가슴살 재구매')
) as v(place_type, store_name, purchased_at, total_amount, note)
on true
join public.places pl
  on pl.user_id = t.user_id
 and pl.place_type = v.place_type
join public.stores st on st.name = v.store_name;

-- Purchase order line items.
insert into public.purchase_order_items (
  user_id,
  purchase_order_id,
  product_id,
  quantity,
  unit_price,
  line_total
)
select
  t.user_id,
  po.id,
  pr.id,
  v.quantity,
  v.unit_price,
  v.quantity * v.unit_price
from temp_demo_user t
join (
  values
    ('2026-05-01 10:10:00+09', '닭가슴살', 10, 2990),
    ('2026-05-03 18:40:00+09', '계란', 10, 780),
    ('2026-05-03 18:40:00+09', '우유', 2, 2500),
    ('2026-05-07 19:00:00+09', '두부', 2, 1900),
    ('2026-05-07 19:00:00+09', '우유', 2, 2550),
    ('2026-05-10 15:00:00+09', '샴푸', 1, 12000),
    ('2026-05-10 15:00:00+09', '세탁세제', 1, 18000),
    ('2026-05-10 15:00:00+09', '휴지', 12, 500),
    ('2026-05-12 21:00:00+09', '핸드크림', 1, 7900),
    ('2026-05-15 13:00:00+09', '휴지', 10, 500),
    ('2026-05-20 11:00:00+09', '닭가슴살', 10, 2590)
) as v(purchased_at, product_name, quantity, unit_price)
on true
join public.purchase_orders po
  on po.user_id = t.user_id
 and po.purchased_at = v.purchased_at::timestamptz
join lateral (
  select p.id
  from public.products p
  where p.name = v.product_name
  order by p.id
  limit 1
) pr on true;

-- Stock movements: purchases become IN movements.
insert into public.stock_movements (
  user_id,
  product_id,
  place_id,
  movement_type,
  quantity,
  moved_at,
  purchase_order_item_id,
  note
)
select
  t.user_id,
  poi.product_id,
  po.place_id,
  'IN',
  poi.quantity,
  po.purchased_at,
  poi.id,
  '구매 입고'
from temp_demo_user t
join public.purchase_order_items poi on poi.user_id = t.user_id
join public.purchase_orders po on po.id = poi.purchase_order_id;

-- Stock movements: demo food consumption for ledger and usage interval.
insert into public.stock_movements (
  user_id,
  product_id,
  place_id,
  movement_type,
  quantity,
  moved_at,
  purchase_order_item_id,
  note
)
select
  t.user_id,
  pr.id,
  pl.id,
  'OUT',
  v.quantity,
  v.moved_at::timestamptz,
  source_item.id,
  v.note
from temp_demo_user t
join (
  values
    ('dorm', '닭가슴살', '2026-05-02 12:30:00+09', 1, '점심 식사'),
    ('dorm', '닭가슴살', '2026-05-04 12:30:00+09', 1, '점심 식사'),
    ('dorm', '닭가슴살', '2026-05-06 18:30:00+09', 1, '저녁 식사'),
    ('dorm', '닭가슴살', '2026-05-22 12:10:00+09', 2, '점심 도시락'),
    ('dorm', '계란', '2026-05-04 08:30:00+09', 2, '아침 식사'),
    ('dorm', '계란', '2026-05-06 08:20:00+09', 2, '아침 식사'),
    ('dorm', '계란', '2026-05-09 08:10:00+09', 2, '아침 식사'),
    ('dorm', '우유', '2026-05-04 09:00:00+09', 1, '아침'),
    ('dorm', '우유', '2026-05-08 09:00:00+09', 1, '아침'),
    ('dorm', '우유', '2026-05-10 09:00:00+09', 1, '아침'),
    ('dorm', '두부', '2026-05-08 19:00:00+09', 1, '저녁 식사'),
    ('home', '샴푸', '2026-05-18 21:00:00+09', 1, '욕실 사용 시작'),
    ('office', '휴지', '2026-05-20 13:00:00+09', 8, '사무실 비품 사용')
) as v(place_type, product_name, moved_at, quantity, note)
on true
join public.places pl
  on pl.user_id = t.user_id
 and pl.place_type = v.place_type
join lateral (
  select p.id
  from public.products p
  where p.name = v.product_name
  order by p.id
  limit 1
) pr on true
left join lateral (
  select poi.id
  from public.purchase_order_items poi
  join public.purchase_orders po on po.id = poi.purchase_order_id
  where poi.user_id = t.user_id
    and poi.product_id = pr.id
    and po.place_id = pl.id
    and po.purchased_at <= v.moved_at::timestamptz
  order by po.purchased_at desc, poi.id desc
  limit 1
) source_item on true;

-- Current inventories are derived from IN/OUT movements.
insert into public.inventories (
  user_id,
  place_id,
  product_id,
  current_quantity,
  updated_at
)
select
  sm.user_id,
  sm.place_id,
  sm.product_id,
  greatest(
    sum(
      case
        when sm.movement_type = 'IN' then sm.quantity
        when sm.movement_type = 'OUT' then -sm.quantity
        else sm.quantity
      end
    ),
    0
  ) as current_quantity,
  now()
from public.stock_movements sm
where sm.user_id in (select user_id from temp_demo_user)
group by sm.user_id, sm.place_id, sm.product_id;

drop table if exists temp_demo_user;
