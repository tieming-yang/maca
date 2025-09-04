create type public.app_role as enum('user', 'editor', 'admin');

-- Create a table for public profiles
create table
  profiles (
    id uuid references auth.users not null primary key,
    updated_at timestamp with time zone,
    username text unique,
    avatar_url text,
    role public.app_role not null default 'user',
    constraint username_length check (char_length(username) >= 3)
  );

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/database/postgres/row-level-security for more details.
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles for
select
  using (true);

create policy "Users can insert their own profile." on profiles for insert
with
  check (
    (
      select
        auth.uid ()
    ) = id
  );

create policy "Users can update own profile." on profiles for
update using (
  (
    select
      auth.uid ()
  ) = id
);

-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
-- See https://supabase.com/docs/guides/auth/managing-user-data#using-triggers for more details.
create function public.handle_new_user () returns trigger
set
  search_path = '' as $$
begin
  insert into public.profiles (id, username, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users for each row
execute procedure public.handle_new_user ();