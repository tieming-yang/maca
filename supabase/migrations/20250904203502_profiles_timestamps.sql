-- 1) Add timestamps to profiles
alter table public.profiles
  add column if not exists created_at timestamptz not null default now();

alter table public.profiles
  alter column updated_at set default now();

-- 2) Backfill from auth.users for existing rows
update public.profiles p
set
  created_at = coalesce(p.created_at, u.created_at),
  updated_at = coalesce(p.updated_at, u.created_at)
from auth.users u
where p.id = u.id;

-- 3) Auto-update updated_at on any profile change
create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_profiles_updated_at();

-- 4) Ensure the signup trigger populates created_at/updated_at from auth.users
--    (and still ignores any client-supplied role)
create or replace function public.handle_new_user()
returns trigger
set search_path = ''        -- harden search_path
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, username, avatar_url, role, created_at, updated_at)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'avatar_url',
    'user',                -- force default role
    new.created_at,        -- from auth.users
    new.created_at
  )
  on conflict (id) do update
    set username   = excluded.username,
        avatar_url = excluded.avatar_url;
  return new;
end;
$$;

-- (No need to recreate the trigger; CREATE OR REPLACE updates the function used.)