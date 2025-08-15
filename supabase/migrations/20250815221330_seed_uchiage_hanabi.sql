-- PEOPLE
insert into
  public.people (display_name, romaji, furigana, alt_names)
values
  ('DAOKO', 'Daoko', 'だをこ', '["Daoko"]'::jsonb),
  (
    '米津玄師',
    'Yonezu Kenshi',
    'よねづ けんし',
    '["Kenshi Yonezu"]'::jsonb
  ) on conflict (display_name)
do
update
set
  romaji = excluded.romaji,
  furigana = excluded.furigana;

-- WORK (source) 2017 anime film
insert into
  public.works (title, kind, romaji, furigana, year, notes)
select
  '打ち上げ花火、下から見るか？横から見るか？',
  'anime',
  'Uchiage Hanabi, Shita kara Miru ka? Yoko kara Miru ka?',
  'うちあげはなび、したからみるか？よこからみるか？',
  2017,
  null
where
  not exists (
    select
      1
    from
      public.works
    where
      title = '打ち上げ花火、下から見るか？横から見るか？'
      and year = 2017
  );

-- SONG
insert into
  public.songs (
    slug,
    name,
    youtube_id,
    romaji,
    furigana,
    end_seconds,
    work_id
  )
values
  (
    'uchiage-hanabi',
    '打上花火',
    '-tKVN2mAKRI',
    'Uchiage Hanabi',
    'うちあげはなび',
    292,
    (
      select
        id
      from
        public.works
      where
        title = '打ち上げ花火、下から見るか？横から見るか？'
        and year = 2017
      limit
        1
    )
  ) on conflict (slug)
do nothing;

-- CREDITS
-- primary artist: DAOKO
insert into
  public.song_credits (song_id, person_id, role, position)
select
  s.id,
  p.id,
  'primary_artist',
  0
from
  public.songs s,
  public.people p
where
  s.slug = 'uchiage-hanabi'
  and p.display_name = 'DAOKO' on conflict (song_id, person_id, role)
do nothing;

-- featured artist: 米津玄師
insert into
  public.song_credits (song_id, person_id, role, position)
select
  s.id,
  p.id,
  'featured_artist',
  1
from
  public.songs s,
  public.people p
where
  s.slug = 'uchiage-hanabi'
  and p.display_name = '米津玄師' on conflict (song_id, person_id, role)
do nothing;

-- composer + lyricist: 米津玄師
insert into
  public.song_credits (song_id, person_id, role, position)
select
  s.id,
  p.id,
  'composer',
  0
from
  public.songs s,
  public.people p
where
  s.slug = 'uchiage-hanabi'
  and p.display_name = '米津玄師' on conflict (song_id, person_id, role)
do nothing;

insert into
  public.song_credits (song_id, person_id, role, position)
select
  s.id,
  p.id,
  'lyricist',
  0
from
  public.songs s,
  public.people p
where
  s.slug = 'uchiage-hanabi'
  and p.display_name = '米津玄師' on conflict (song_id, person_id, role)
do nothing;

-- BASE LINES (first 3 lines for testing)
-- line_index 0 @ 00:23
insert into
  public.song_base_lines (
    song_id,
    line_index,
    timestamp_sec,
    ja_tokens,
    romaji
  )
select
  s.id,
  0,
  23,
  jsonb_build_array(
    'あの',
    jsonb_build_object('kanji', '日', 'furigana', 'ひ'),
    jsonb_build_object('kanji', '見渡', 'furigana', 'みわた'),
    'した',
    jsonb_build_object('kanji', '渚', 'furigana', 'なぎさ'),
    'を　',
    jsonb_build_object('kanji', '今', 'furigana', 'いま'),
    'も',
    jsonb_build_object('kanji', '思', 'furigana', 'おも'),
    'い',
    jsonb_build_object('kanji', '出', 'furigana', 'だ'),
    'すんだ'
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 1 @ 00:33
insert into
  public.song_base_lines (
    song_id,
    line_index,
    timestamp_sec,
    ja_tokens,
    romaji
  )
select
  s.id,
  1,
  33,
  jsonb_build_array(
    jsonb_build_object('kanji', '砂', 'furigana', 'すな'),
    'の',
    jsonb_build_object('kanji', '上', 'furigana', 'うえ'),
    'に',
    jsonb_build_object('kanji', '刻', 'furigana', 'きざ'),
    'んだ',
    jsonb_build_object('kanji', '言葉', 'furigana', 'ことば'),
    '　',
    jsonb_build_object('kanji', '君', 'furigana', 'きみ'),
    'の',
    jsonb_build_object('kanji', '後ろ姿', 'furigana', 'うしろすがた')
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 2 @ 00:43
insert into
  public.song_base_lines (
    song_id,
    line_index,
    timestamp_sec,
    ja_tokens,
    romaji
  )
select
  s.id,
  2,
  43,
  jsonb_build_array(
    '寄り',
    jsonb_build_object('kanji', '返', 'furigana', 'かえ'),
    'す',
    jsonb_build_object('kanji', '波', 'furigana', 'なみ'),
    'が　',
    jsonb_build_object('kanji', '足元', 'furigana', 'あしもと'),
    'をよぎり',
    jsonb_build_object('kanji', '何', 'furigana', 'なに'),
    'かを',
    jsonb_build_object('kanji', '攫', 'furigana', 'さら'),
    'う'
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- TRANSLATION VERSIONS
-- zh-TW v1 (published)
insert into
  public.translation_versions (
    song_id,
    language_code,
    version_number,
    title,
    status,
    is_pinned_default
  )
select
  s.id,
  'zh-TW',
  1,
  '社群版 v1',
  'published',
  true
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, language_code, version_number)
do nothing;

-- en v1 (published)
insert into
  public.translation_versions (
    song_id,
    language_code,
    version_number,
    title,
    status,
    is_pinned_default
  )
select
  s.id,
  'en',
  1,
  'Community v1',
  'published',
  true
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, language_code, version_number)
do nothing;

-- TRANSLATION LINES (zh-TW)
insert into
  public.translation_lines (version_id, line_index, text_json)
select
  v.id,
  0,
  to_jsonb('那日眺望過的海岸　如今仍能憶起'::text)
from
  public.translation_versions v
  join public.songs s on v.song_id = s.id
where
  s.slug = 'uchiage-hanabi'
  and v.language_code = 'zh-TW'
  and v.version_number = 1 on conflict (version_id, line_index)
do nothing;

insert into
  public.translation_lines (version_id, line_index, text_json)
select
  v.id,
  1,
  to_jsonb('沙灘上刻劃下的文字　你的背影'::text)
from
  public.translation_versions v
  join public.songs s on v.song_id = s.id
where
  s.slug = 'uchiage-hanabi'
  and v.language_code = 'zh-TW'
  and v.version_number = 1 on conflict (version_id, line_index)
do nothing;

insert into
  public.translation_lines (version_id, line_index, text_json)
select
  v.id,
  2,
  to_jsonb('浪花往返　沖過腳邊帶走了些什麼'::text)
from
  public.translation_versions v
  join public.songs s on v.song_id = s.id
where
  s.slug = 'uchiage-hanabi'
  and v.language_code = 'zh-TW'
  and v.version_number = 1 on conflict (version_id, line_index)
do nothing;

-- TRANSLATION LINES (en)
insert into
  public.translation_lines (version_id, line_index, text_json)
select
  v.id,
  0,
  to_jsonb(
    'That shoreline we looked over—I still remember it now.'::text
  )
from
  public.translation_versions v
  join public.songs s on v.song_id = s.id
where
  s.slug = 'uchiage-hanabi'
  and v.language_code = 'en'
  and v.version_number = 1 on conflict (version_id, line_index)
do nothing;

insert into
  public.translation_lines (version_id, line_index, text_json)
select
  v.id,
  1,
  to_jsonb(
    'Words carved into the sand—your figure from behind.'::text
  )
from
  public.translation_versions v
  join public.songs s on v.song_id = s.id
where
  s.slug = 'uchiage-hanabi'
  and v.language_code = 'en'
  and v.version_number = 1 on conflict (version_id, line_index)
do nothing;

insert into
  public.translation_lines (version_id, line_index, text_json)
select
  v.id,
  2,
  to_jsonb(
    'Waves coming and going brush my feet and carry something away.'::text
  )
from
  public.translation_versions v
  join public.songs s on v.song_id = s.id
where
  s.slug = 'uchiage-hanabi'
  and v.language_code = 'en'
  and v.version_number = 1 on conflict (version_id, line_index)
do nothing;