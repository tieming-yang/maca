-- enums
create type version_status as enum('draft', 'pending', 'published');

create type credit_role as enum(
   'primary_artist',
   'featured_artist',
   'composer',
   'lyricist'
);

create type work_kind as enum(
   'movie',
   'anime',
   'tv',
   'game',
   'album',
   'single',
   'stage',
   'other'
);

-- people (artists/composers/lyricists, etc.)
create table if not exists
   public.people (
      id uuid primary key default gen_random_uuid (),
      display_name text not null,
      romaji text not null,
      furigana text,
      alt_names jsonb,
      created_at timestamptz not null default now(),
      unique (display_name)
   );

-- works / source (e.g., a movie/anime/TV/game the song comes from)
create table if not exists
   public.works (
      id uuid primary key default gen_random_uuid (),
      title text not null,
      kind work_kind not null default 'other',
      romaji text,
      furigana text,
      year int,
      notes text,
      created_at timestamptz not null default now()
   );

-- songs (owns the single base timeline; references source work if any)
create table if not exists
   public.songs (
      id uuid primary key default gen_random_uuid (),
      slug text unique not null, -- e.g. 'uchiage-hanabi'
      name text not null, -- 打上花火
      youtube_id text unique, -- video id if available
      romaji text not null,
      furigana text,
      end_seconds int,
      work_id uuid references public.works, -- origin/source work
      created_by uuid references auth.users,
      created_at timestamptz not null default now()
   );

-- song credits (many-to-many people <-> songs with roles)
create table if not exists
   public.song_credits (
      id bigserial primary key,
      song_id uuid not null references public.songs on delete cascade,
      person_id uuid not null references public.people,
      role credit_role not null, -- 'primary_artist','featured_artist','composer','lyricist'
      position int not null default 0, -- ordering when multiple credits of same role
      note text,
      unique (song_id, person_id, role)
   );

create index if not exists idx_song_credits_song_role on public.song_credits (song_id, role, position);

-- base lines (timestamps + JA tokens + optional romaji)
create table if not exists
   public.song_base_lines (
      id bigserial primary key,
      song_id uuid not null references public.songs on delete cascade,
      line_index int not null, -- 0..N
      timestamp_sec int not null, -- integer seconds
      ja_tokens jsonb not null, -- ["あの", {"kanji":"日","furigana":"ひ"}, ...]
      romaji text,
      unique (song_id, line_index)
   );

create index if not exists idx_song_base_lines_song_line on public.song_base_lines (song_id, line_index);

-- translations (per language, many community versions)
create table if not exists
   public.translation_versions (
      id uuid primary key default gen_random_uuid (),
      song_id uuid not null references public.songs on delete cascade,
      language_code text not null, -- 'zh-TW','en', ...
      version_number int not null, -- 1,2,3...
      title text,
      status version_status not null default 'draft',
      created_at timestamptz not null default now(),
      created_by uuid references auth.users,
      is_pinned_default boolean not null default false,
      unique (song_id, language_code, version_number)
   );

create index if not exists idx_translation_versions_song_lang_status on public.translation_versions (song_id, language_code, status);

-- one active draft/pending per (song, language) (optional guard)
create unique index if not exists uniq_one_active_edit_per_lang on public.translation_versions (song_id, language_code)
where
   status in ('draft', 'pending');

-- translation lines (aligned to base line_index)
create table if not exists
   public.translation_lines (
      id bigserial primary key,
      version_id uuid not null references public.translation_versions on delete cascade,
      line_index int not null,
      text_json jsonb not null, -- usually a string or array of strings
      unique (version_id, line_index)
   );

create index if not exists idx_translation_lines_version_line on public.translation_lines (version_id, line_index);

-- votes (1 per user per version)
create table if not exists
   public.translation_votes (
      version_id uuid not null references public.translation_versions on delete cascade,
      user_id uuid not null references auth.users,
      created_at timestamptz not null default now(),
      primary key (version_id, user_id)
   );

-- view: base lines as JSON array (for UI)
create or replace view
   public.song_with_base_json as
select
   s.*,
   coalesce(
      jsonb_agg(
         jsonb_build_object(
            'line_index',
            bl.line_index,
            'timestamp_sec',
            bl.timestamp_sec,
            'ja_tokens',
            bl.ja_tokens,
            'romaji',
            bl.romaji
         )
         order by
            bl.line_index
      ) filter (
         where
            bl.id is not null
      ),
      '[]'::jsonb
   ) as base_lines
from
   public.songs s
   left join public.song_base_lines bl on bl.song_id = s.id
group by
   s.id;

-- view: votes per translation version
create or replace view
   public.translation_version_stats as
select
   v.id as version_id,
   v.song_id,
   v.language_code,
   v.is_pinned_default,
   v.status,
   v.created_at,
   count(t.user_id)::int as vote_count
from
   public.translation_versions v
   left join public.translation_votes t on t.version_id = v.id
group by
   v.id;