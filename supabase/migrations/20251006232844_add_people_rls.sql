create policy "stuff_insert_people" on public.people for insert
with
  check (
    auth.uid () is not null
    and exists (
      select
        1
      from
        public.profiles p
      where
        p.id = auth.uid ()
        and p.role in ("admin", "editor")
    )
  );

create policy "staff_update_people" on public.people for
update using (
  auth.uid () is not null
  and exists (
    select
      1
    from
      public.profiles p
    where
      p.id = auth.uid ()
      and p.role in ('admin', 'editor')
  )
)
with
  check (same condition);