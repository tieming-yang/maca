-- Grant insert/update on people to admin + editor roles
-- (assumes public.profiles.role is public.app_role enum)

drop policy if exists "staff_insert_people" on public.people;
drop policy if exists "staff_update_people" on public.people;

drop policy if exists "public_read_people" on public.people;
create policy "public_read_people"
  on public.people for select
  using (true);

create policy "staff_insert_people"
  on public.people for insert
  with check (
    auth.uid() is not null
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'editor')
    )
  );

create policy "staff_update_people"
  on public.people for update
  using (
    auth.uid() is not null
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'editor')
    )
  )
  with check (
    auth.uid() is not null
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'editor')
    )
  );
