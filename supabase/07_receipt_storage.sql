-- Private receipt image storage.
-- Run once in the Supabase SQL Editor for project beiiwykdmvqoovbetjnl.

alter table public.purchase_orders
add column if not exists receipt_image_path text;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'receipt-images',
  'receipt-images',
  false,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can upload own receipt images" on storage.objects;
drop policy if exists "Users can read own receipt images" on storage.objects;
drop policy if exists "Users can update own receipt images" on storage.objects;
drop policy if exists "Users can delete own receipt images" on storage.objects;

create policy "Users can upload own receipt images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'receipt-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can read own receipt images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'receipt-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update own receipt images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'receipt-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'receipt-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete own receipt images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'receipt-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
