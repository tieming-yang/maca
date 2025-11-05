create policy "owner_insert_translation_lines"
on public.translation_lines
for insert
to authenticated
with check (
  exists (
    select 1
    from public.translation_versions tv
    where tv.id = translation_lines.version_id
      and tv.created_by = auth.uid()
  )
);

create policy "owner_update_translation_lines"
on public.translation_lines
for update
to authenticated
using (
  exists (
    select 1
    from public.translation_versions tv
    where tv.id = translation_lines.version_id
      and tv.created_by = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.translation_versions tv
    where tv.id = translation_lines.version_id
      and tv.created_by = auth.uid()
  )
);

create policy "owner_delete_translation_lines"
on public.translation_lines
for delete
to authenticated
using (
  exists (
    select 1
    from public.translation_versions tv
    where tv.id = translation_lines.version_id
      and tv.created_by = auth.uid()
  )
);