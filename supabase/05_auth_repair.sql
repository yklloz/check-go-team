-- Repair auth signup trigger.
-- Run this if email signup or OAuth signup fails with "Database error saving new user".
-- This version never blocks auth.users creation if app-side profile/place sync fails.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  begin
    insert into public.profiles (
      id,
      email,
      full_name,
      avatar_url,
      provider
    )
    values (
      new.id,
      new.email,
      coalesce(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name'
      ),
      new.raw_user_meta_data->>'avatar_url',
      new.app_metadata->>'provider'
    )
    on conflict (id) do update
    set
      email = excluded.email,
      full_name = coalesce(excluded.full_name, public.profiles.full_name),
      avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
      provider = coalesce(excluded.provider, public.profiles.provider),
      updated_at = now();
  exception
    when others then
      raise warning 'handle_new_user profile sync failed for user %: %', new.id, sqlerrm;
  end;

  begin
    insert into public.places (user_id, name, place_type)
    select new.id, place_name, place_type
    from (
      values
        ('기숙사', 'dorm'),
        ('본가', 'home'),
        ('학교 사물함', 'school'),
        ('자취방', 'room')
    ) as default_places(place_name, place_type)
    where not exists (
      select 1
      from public.places p
      where p.user_id = new.id
        and p.name = default_places.place_name
    );
  exception
    when others then
      raise warning 'handle_new_user place sync failed for user %: %', new.id, sqlerrm;
  end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
