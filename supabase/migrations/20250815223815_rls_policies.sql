-- Enable RLS on all tables we expose
alter table public.songs                 enable row level security;
alter table public.song_base_lines       enable row level security;
alter table public.people                enable row level security;
alter table public.works                 enable row level security;
alter table public.song_credits          enable row level security;
alter table public.translation_versions  enable row level security;
alter table public.translation_lines     enable row level security;
alter table public.translation_votes     enable row level security;

-- ===== READ-ONLY PUBLIC DATA =====
-- Everyone can read base catalog/timeline
create policy "public_read_songs"
  on public.songs for select
  using (true);

create policy "public_read_base_lines"
  on public.song_base_lines for select
  using (true);

create policy "public_read_people"
  on public.people for select
  using (true);

create policy "public_read_works"
  on public.works for select
  using (true);

create policy "public_read_song_credits"
  on public.song_credits for select
  using (true);

-- No public writes to the above (omit insert/update/delete policies)

-- ===== TRANSLATION VERSIONS =====
-- Public can read PUBLISHED translations
create policy "public_read_published_versions"
  on public.translation_versions for select
  using (status = 'published');

-- Owner can read their own drafts/pending
create policy "owner_read_own_versions"
  on public.translation_versions for select
  using (created_by = auth.uid());

-- Helper trigger: set created_by on insert if null
create or replace function public.set_created_by()
returns trigger language plpgsql as $$
begin
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_created_by_versions on public.translation_versions;
create trigger trg_set_created_by_versions
before insert on public.translation_versions
for each row execute procedure public.set_created_by();

-- Auth users can create a version; it becomes theirs
create policy "auth_insert_version"
  on public.translation_versions for insert
  with check (auth.uid() is not null and created_by = auth.uid());

-- Owner can update/delete their version while it's draft/pending
create policy "owner_update_version_when_unpublished"
  on public.translation_versions for update
  using (created_by = auth.uid() and status in ('draft','pending'))
  with check (created_by = auth.uid());

create policy "owner_delete_version_when_unpublished"
  on public.translation_versions for delete
  using (created_by = auth.uid() and status in ('draft','pending'));

-- ===== TRANSLATION LINES =====
-- Public can read lines of PUBLISHED versions
create policy "public_read_lines_of_published_versions"
  on public.translation_lines for select
  using (
    exists (
      select 1 from public.translation_versions v
      where v.id = translation_lines.version_id
        and v.status = 'published'
    )
  );

-- Owner can read their own draft/pending lines
create policy "owner_read_lines_of_own_unpublished_versions"
  on public.translation_lines for select
  using (
    exists (
      select 1 from public.translation_versions v
      where v.id = translation_lines.version_id
        and v.created_by = auth.uid()
    )
  );

-- Auth can insert/update/delete lines only for their own draft/pending version
create policy "owner_insert_lines_to_own_unpublished_version"
  on public.translation_lines for insert
  with check (
    exists (
      select 1 from public.translation_versions v
      where v.id = translation_lines.version_id
        and v.created_by = auth.uid()
        and v.status in ('draft','pending')
    )
  );

create policy "owner_update_lines_of_own_unpublished_version"
  on public.translation_lines for update
  using (
    exists (
      select 1 from public.translation_versions v
      where v.id = translation_lines.version_id
        and v.created_by = auth.uid()
        and v.status in ('draft','pending')
    )
  )
  with check (
    exists (
      select 1 from public.translation_versions v
      where v.id = translation_lines.version_id
        and v.created_by = auth.uid()
        and v.status in ('draft','pending')
    )
  );

create policy "owner_delete_lines_of_own_unpublished_version"
  on public.translation_lines for delete
  using (
    exists (
      select 1 from public.translation_versions v
      where v.id = translation_lines.version_id
        and v.created_by = auth.uid()
        and v.status in ('draft','pending')
    )
  );

-- ===== VOTES =====
-- Let everyone read vote counts
create policy "public_read_votes"
  on public.translation_votes for select
  using (true);

-- Auto-fill user_id on insert; enforce one per user via PK
create or replace function public.set_vote_user()
returns trigger language plpgsql as $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_vote_user on public.translation_votes;
create trigger trg_set_vote_user
before insert on public.translation_votes
for each row execute procedure public.set_vote_user();

-- Only authenticated users can vote; vote must belong to them
create policy "auth_insert_vote"
  on public.translation_votes for insert
  with check (auth.uid() is not null and user_id = auth.uid());

-- Users can remove their own vote
create policy "owner_delete_vote"
  on public.translation_votes for delete
  using (user_id = auth.uid());
  