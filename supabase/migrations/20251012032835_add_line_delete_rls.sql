create policy "staff_delete_song_base_lines"
  on public.song_base_lines for delete
  using (
    auth.uid() is not null
    and exists (
      select 1
      from public.profiles profile
      where profile.id = auth.uid()
        and profile.role in ('admin', 'editor')
    )
  );
