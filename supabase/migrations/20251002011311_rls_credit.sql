-- Allow authenticated users to insert rows they own
create policy "Allow authenticated insert song credits"
on public.song_credits for insert
to authenticated
with check (
  exists (
    select 1
    from public.songs s
    where s.id = song_credits.song_id
    and s.created_by = auth.uid()
  )
);

-- Let the same users update their own credits
create policy "Allow authenticated update song credits"
on public.song_credits for update
to authenticated
using (
  exists (
    select 1
    from public.songs s
    where s.id = song_credits.song_id
    and s.created_by = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.songs s
    where s.id = song_credits.song_id
    and s.created_by = auth.uid()
  )
);

-- Optionally allow deletes as well
create policy "Allow authenticated delete song credits"
on public.song_credits for delete
to authenticated
using (
  exists (
    select 1
    from public.songs s
    where s.id = song_credits.song_id
    and s.created_by = auth.uid()
  )
);
