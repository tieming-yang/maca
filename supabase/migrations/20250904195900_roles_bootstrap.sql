-- === 1) App roles enum ============================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('user','editor','admin');
  end if;
end$$;

-- === 2) profiles.role column (default 'user') =====================
alter table public.profiles
  add column if not exists role public.app_role not null default 'user';

-- === 3) new-user trigger: force role='user' =======================
create or replace function public.handle_new_user()
returns trigger
set search_path = ''
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, username, avatar_url, role)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'avatar_url',
    'user'         -- ignore any metadata.role
  )
  on conflict (id) do update
  set username   = excluded.username,
      avatar_url = excluded.avatar_url;  -- do NOT override role here
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- === 4) helpers to check role (used by policies/triggers) =========
create or replace function public.current_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'user'::public.app_role);
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select public.current_role() = 'admin' $$;

-- === 5) prevent role escalation on profile updates ================
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only admin can change role';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_no_role_escalation on public.profiles;
create trigger trg_no_role_escalation
before update on public.profiles
for each row execute function public.prevent_role_escalation();

-- Optional extra safety: limit column updates at SQL permission level
-- (RLS + this grant combo ensures non-admins cannot update 'role')
revoke update on public.profiles from anon, authenticated;
grant  update (username, avatar_url, updated_at) on public.profiles to authenticated;

-- === 6) admin promotion helper (run manually when needed) =========
create or replace function public.promote_user_to_admin(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
begin
  select id into v_uid from auth.users where lower(email) = lower(p_email);
  if v_uid is null then
    raise exception 'No auth.user with that email: %', p_email;
  end if;

  update public.profiles set role = 'admin' where id = v_uid;
end;
$$;

-- Do not expose this to client roles
revoke all on function public.promote_user_to_admin(text) from public, anon, authenticated;

-- === 7) (Optional) seed an initial admin by email =================
-- Replace the placeholder email if the user already exists in auth.users.
-- If not present yet, this block no-ops; you can call promote_user_to_admin later.
do $$
declare
  v_uid uuid;
begin
  select id into v_uid from auth.users where email = 'ytm199891@gmail.com';
  if v_uid is not null then
    update public.profiles set role = 'admin' where id = v_uid;
  end if;
end $$;