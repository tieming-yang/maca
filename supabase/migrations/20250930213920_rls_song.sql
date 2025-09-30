-- 1. Make sure RLS is on (only needs to run once)
alter table public.songs enable row level security;

-- 2. Fill created_by automatically, just like you do for translations
create or replace function public.set_song_created_by()
returns trigger language plpgsql as $$
begin
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_created_by_songs on public.songs;
create trigger trg_set_created_by_songs
before insert on public.songs
for each row execute procedure public.set_song_created_by();

create trigger trg_set_created_by_songs_update
before update on public.songs
for each row execute procedure public.set_created_by();


-- 3. READ policy (you may already have this)
drop policy if exists "public_read_songs" on public.songs;
create policy "public_read_songs"
  on public.songs for select
  using (true);

-- 4. INSERT – allow admins (and optionally editors) to create songs
drop policy if exists "staff_insert_songs" on public.songs;
create policy "staff_insert_songs"
  on public.songs for insert
  with check (
    auth.uid() is not null
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin','editor')
    )
    and created_by = auth.uid()
  );

-- 5. UPDATE – allow the creator and admins to modify songs
drop policy if exists "owner_or_admin_update_songs" on public.songs;
create policy "owner_or_admin_update_songs"
  on public.songs for update
  using (
    auth.uid() is not null
    and (
      created_by = auth.uid() or
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role = 'admin'
      )
    )
  )
  with check (
    auth.uid() is not null
    and (
      created_by = auth.uid() or
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role = 'admin'
      )
    )
  );

-- 6. DELETE – usually only admins (or optionally owners)
drop policy if exists "admin_delete_songs" on public.songs;
create policy "admin_delete_songs"
  on public.songs for delete
  using (
    auth.uid() is not null
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );
