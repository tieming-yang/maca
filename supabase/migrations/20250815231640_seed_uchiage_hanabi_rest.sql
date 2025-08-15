-- === ADD REMAINING 打上花火 BASE LINES & TRANSLATIONS (line_index 3..32) ===
-- BASE LINES --------------------------------------------------------------
-- line_index 3 @ 00:53
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
  3,
  53,
  jsonb_build_array(
    jsonb_build_object('kanji', '夕凪', 'furigana', 'ゆうなぎ'),
    'の',
    jsonb_build_object('kanji', '中', 'furigana', 'なか'),
    '　',
    jsonb_build_object('kanji', '日暮', 'furigana', 'ひぐ'),
    'れだけが',
    jsonb_build_object('kanji', '通', 'furigana', 'とお'),
    'り',
    jsonb_build_object('kanji', '過', 'furigana', 'す'),
    'ぎて',
    jsonb_build_object('kanji', '行', 'furigana', 'い'),
    'く'
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 4 @ 01:03
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
  4,
  63,
  jsonb_build_array(
    'パッと',
    jsonb_build_object('kanji', '光', 'furigana', 'ひか'),
    'って',
    jsonb_build_object('kanji', '咲', 'furigana', 'さ'),
    'いた　',
    jsonb_build_object('kanji', '花火', 'furigana', 'はなび'),
    'を',
    jsonb_build_object('kanji', '見', 'furigana', 'み'),
    'ていた'
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 5 @ 01:08
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
  5,
  68,
  jsonb_build_array(
    'きっとまだ　',
    jsonb_build_object('kanji', '終', 'furigana', 'お'),
    'わらない',
    jsonb_build_object('kanji', '夏', 'furigana', 'なつ'),
    'が'
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 6 @ 01:13
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
  6,
  73,
  jsonb_build_array(
    jsonb_build_object('kanji', '曖昧', 'furigana', 'あいまい'),
    'な',
    jsonb_build_object('kanji', '心', 'furigana', 'こころ'),
    'を　',
    jsonb_build_object('kanji', '解', 'furigana', 'とか'),
    'かして',
    jsonb_build_object('kanji', '繋', 'furigana', 'つな'),
    'いだ'
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 7 @ 01:18
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
  7,
  78,
  jsonb_build_array(
    'この',
    jsonb_build_object('kanji', '夜', 'furigana', 'よる'),
    'が　',
    jsonb_build_object('kanji', '続', 'furigana', 'つづ'),
    'いて',
    jsonb_build_object('kanji', '欲', 'furigana', 'ほ'),
    'しかった'
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 8 @ 01:33
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
  8,
  93,
  jsonb_build_array(
    '「',
    jsonb_build_object('kanji', 'あと何度', 'furigana', 'あとなんど'),
    jsonb_build_object('kanji', '君', 'furigana', 'きみ'),
    'と',
    jsonb_build_object('kanji', '同', 'furigana', 'おな'),
    'じ',
    jsonb_build_object('kanji', '花火', 'furigana', 'はなび'),
    'を',
    jsonb_build_object('kanji', '見', 'furigana', 'み'),
    'られるかな」って'
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 9 @ 01:38
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
  9,
  98,
  jsonb_build_array(
    jsonb_build_object('kanji', '笑', 'furigana', 'わら'),
    'う',
    jsonb_build_object('kanji', '顔', 'furigana', 'かお'),
    'に',
    jsonb_build_object('kanji', '何', 'furigana', 'なに'),
    'ができるだろうか'
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 10 @ 01:43
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
  10,
  103,
  jsonb_build_array(
    jsonb_build_object('kanji', '傷', 'furigana', 'きず'),
    'つくこと　',
    jsonb_build_object('kanji', '喜', 'furigana', 'よろこ'),
    'ぶこと　',
    jsonb_build_object('kanji', '繰', 'furigana', 'く'),
    'り',
    jsonb_build_object('kanji', '返', 'furigana', 'かえ'),
    'す',
    jsonb_build_object('kanji', '波', 'furigana', 'なみ'),
    'と',
    jsonb_build_object('kanji', '情動', 'furigana', 'じょうどう')
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 11 @ 01:48
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
  11,
  108,
  jsonb_build_array(
    jsonb_build_object('kanji', '焦燥', 'furigana', 'しょうそう'),
    '　',
    jsonb_build_object('kanji', '最終', 'furigana', 'さいしゅう'),
    jsonb_build_object('kanji', '列車', 'furigana', 'れっしゃ'),
    'の',
    jsonb_build_object('kanji', '音', 'furigana', 'おと')
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 12 @ 01:53
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
  12,
  113,
  jsonb_build_array(
    jsonb_build_object('kanji', '何度', 'furigana', 'なんど'),
    'でも　',
    jsonb_build_object('kanji', '言葉', 'furigana', 'ことば'),
    'にして',
    jsonb_build_object('kanji', '君', 'furigana', 'きみ'),
    'を',
    jsonb_build_object('kanji', '呼', 'furigana', 'よ'),
    'ぶよ'
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 13 @ 01:58
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
  13,
  118,
  jsonb_build_array(
    jsonb_build_object('kanji', '波間', 'furigana', 'なみま'),
    'を',
    jsonb_build_object('kanji', '選', 'furigana', 'えら'),
    'び　もう',
    jsonb_build_object('kanji', '一度', 'furigana', 'いちど')
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 14 @ 02:03
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
  14,
  123,
  jsonb_build_array(
    'もう',
    jsonb_build_object('kanji', '二度', 'furigana', 'にど'),
    'と',
    jsonb_build_object('kanji', '悲', 'furigana', 'かな'),
    'しまずに',
    jsonb_build_object('kanji', '済', 'furigana', 'す'),
    'むように'
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 15 @ 02:20
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
  15,
  140,
  jsonb_build_array(
    'はっと',
    jsonb_build_object('kanji', '息', 'furigana', 'いき'),
    'を',
    jsonb_build_object('kanji', '飲', 'furigana', 'の'),
    'めば　',
    jsonb_build_object('kanji', '消', 'furigana', 'き'),
    'えちゃいそうな',
    jsonb_build_object('kanji', '光', 'furigana', 'ひかり'),
    'が'
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 16 @ 02:26
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
  16,
  146,
  jsonb_build_array(
    'きっとまだ　',
    jsonb_build_object('kanji', '胸', 'furigana', 'むね'),
    'に',
    jsonb_build_object('kanji', '住', 'furigana', 'す'),
    'んでいた'
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 17 @ 02:30
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
  17,
  150,
  jsonb_build_array(
    jsonb_build_object('kanji', '手', 'furigana', 'て'),
    'を',
    jsonb_build_object('kanji', '伸', 'furigana', 'の'),
    'ばせば',
    jsonb_build_object('kanji', '触', 'furigana', 'ふ'),
    'れた　あったかい',
    jsonb_build_object('kanji', '未来', 'furigana', 'みらい'),
    'は'
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 18 @ 02:36
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
  18,
  156,
  jsonb_build_array(
    'ひそかに',
    jsonb_build_object('kanji', '二人', 'furigana', 'ふたり'),
    'を',
    jsonb_build_object('kanji', '見', 'furigana', 'み'),
    'ていた'
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 19 @ 02:41
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
  19,
  161,
  jsonb_build_array(
    'パッと',
    jsonb_build_object('kanji', '花火', 'furigana', 'はなび'),
    'が'
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 20 @ 02:44
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
  20,
  164,
  jsonb_build_array(
    jsonb_build_object('kanji', '夜', 'furigana', 'よる'),
    'に',
    jsonb_build_object('kanji', '咲', 'furigana', 'さ'),
    'いた'
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 21 @ 02:46
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
  21,
  166,
  jsonb_build_array(
    jsonb_build_object('kanji', '夜', 'furigana', 'よる'),
    'に',
    jsonb_build_object('kanji', '咲', 'furigana', 'さ'),
    'いて'
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 22 @ 02:49
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
  22,
  169,
  jsonb_build_array(
    jsonb_build_object('kanji', '静', 'furigana', 'しず'),
    'かに',
    jsonb_build_object('kanji', '消', 'furigana', 'き'),
    'えた'
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 23 @ 02:51
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
  23,
  171,
  jsonb_build_array(
    jsonb_build_object('kanji', '離', 'furigana', 'はな'),
    'さないで'
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 24 @ 02:54
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
  24,
  174,
  jsonb_build_array(
    'もう',
    jsonb_build_object('kanji', '少', 'furigana', 'すこ'),
    'しだけ'
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 25 @ 02:56
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
  25,
  176,
  jsonb_build_array(
    'もう',
    jsonb_build_object('kanji', '少', 'furigana', 'すこ'),
    'しだけ'
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 26 @ 02:58
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
  26,
  178,
  jsonb_build_array('このままで'),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 27 @ 03:11
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
  27,
  191,
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

-- line_index 28 @ 03:20
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
  28,
  200,
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

-- line_index 29 @ 03:30
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
  29,
  210,
  jsonb_build_array(
    'パッと',
    jsonb_build_object('kanji', '光', 'furigana', 'ひか'),
    'って',
    jsonb_build_object('kanji', '咲', 'furigana', 'さ'),
    'いた　',
    jsonb_build_object('kanji', '花火', 'furigana', 'はなび'),
    'を',
    jsonb_build_object('kanji', '見', 'furigana', 'み'),
    'ていた'
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 30 @ 03:35
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
  30,
  215,
  jsonb_build_array(
    'きっとまだ　',
    jsonb_build_object('kanji', '終', 'furigana', 'お'),
    'わらない',
    jsonb_build_object('kanji', '夏', 'furigana', 'なつ'),
    'が'
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 31 @ 03:40
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
  31,
  220,
  jsonb_build_array(
    jsonb_build_object('kanji', '曖昧', 'furigana', 'あいまい'),
    'な',
    jsonb_build_object('kanji', '心', 'furigana', 'こころ'),
    'を　',
    jsonb_build_object('kanji', '解', 'furigana', 'とか'),
    'かして',
    jsonb_build_object('kanji', '繋', 'furigana', 'つな'),
    'いだ'
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- line_index 32 @ 03:45
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
  32,
  225,
  jsonb_build_array(
    'この',
    jsonb_build_object('kanji', '夜', 'furigana', 'よる'),
    'が　',
    jsonb_build_object('kanji', '続', 'furigana', 'つづ'),
    'いて',
    jsonb_build_object('kanji', '欲', 'furigana', 'ほ'),
    'しかった'
  ),
  null
from
  public.songs s
where
  s.slug = 'uchiage-hanabi' on conflict (song_id, line_index)
do nothing;

-- zh-TW TRANSLATION LINES -----------------------------------------------
insert into
  public.translation_lines (version_id, line_index, text_json)
select
  v.id,
  3,
  to_jsonb('風平浪靜之中　日暮獨自溜走'::text)
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
  4,
  to_jsonb('啪一聲綻放光芒　我們看著煙花'::text)
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
  5,
  to_jsonb('還未結束的夏天　一定會將'::text)
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
  6,
  to_jsonb('曖昧的心　融化後相繫一起'::text)
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
  7,
  to_jsonb('多希望　這個夜晚繼續下去'::text)
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
  8,
  to_jsonb('「還能再與你共賞幾次同樣的煙花呢」'::text)
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
  9,
  to_jsonb('為那笑臉我又能做些什麼'::text)
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
  10,
  to_jsonb('受傷 喜悅 浪來浪去與情動'::text)
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
  11,
  to_jsonb('焦躁 末班列車的聲音'::text)
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
  12,
  to_jsonb('無論幾次 我都會化作話語呼喚你'::text)
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
  13,
  to_jsonb('待浪退時 再一次'::text)
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
  14,
  to_jsonb('是為了讓悲傷不再繼續就此而終'::text)
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
  15,
  to_jsonb('深深倒吸一口氣 那即將消失的光芒'::text)
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
  16,
  to_jsonb('一定仍會 久留在胸中'::text)
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
  17,
  to_jsonb('只要伸出手便能觸碰 那溫暖的未來'::text)
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
  18,
  to_jsonb('正暗中窺伺著我倆'::text)
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
  19,
  to_jsonb('啪一聲煙花'::text)
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
  20,
  to_jsonb('於夜裡綻放'::text)
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
  21,
  to_jsonb('夜裡綻放後'::text)
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
  22,
  to_jsonb('悄悄消失無蹤'::text)
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
  23,
  to_jsonb('別讓我走'::text)
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
  24,
  to_jsonb('再一下下就好'::text)
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
  25,
  to_jsonb('再一下下就好'::text)
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
  26,
  to_jsonb('維持現在這樣'::text)
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
  27,
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
  28,
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
  29,
  to_jsonb('啪一聲綻放光芒　我們看著煙花'::text)
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
  30,
  to_jsonb('還未結束的夏天　一定會將'::text)
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
  31,
  to_jsonb('曖昧的心　融化後相繫一起'::text)
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
  32,
  to_jsonb('多希望　這個夜晚繼續下去'::text)
from
  public.translation_versions v
  join public.songs s on v.song_id = s.id
where
  s.slug = 'uchiage-hanabi'
  and v.language_code = 'zh-TW'
  and v.version_number = 1 on conflict (version_id, line_index)
do nothing;

-- EN TRANSLATION LINES ---------------------------------------------------
insert into
  public.translation_lines (version_id, line_index, text_json)
select
  v.id,
  3,
  to_jsonb('In the evening calm, only dusk slips by.'::text)
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
  4,
  to_jsonb(
    'A flash—and fireworks bloom; we watched them.'::text
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
  5,
  to_jsonb('Surely the summer that hasn’t ended yet—'::text)
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
  6,
  to_jsonb(
    'will melt our vague hearts and link them together.'::text
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
  7,
  to_jsonb('I wished this night would keep on going.'::text)
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
  8,
  to_jsonb(
    '“How many more times can we watch the same fireworks together?”'::text
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
  9,
  to_jsonb('What could I do for that smiling face?'::text)
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
  10,
  to_jsonb(
    'Getting hurt, rejoicing—the ebb and flow of waves and feelings.'::text
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
  11,
  to_jsonb(
    'Restlessness, and the sound of the last train.'::text
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
  12,
  to_jsonb(
    'Again and again, I’ll turn it into words and call your name.'::text
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
  13,
  to_jsonb(
    'Choosing the space between the waves—just once more.'::text
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
  14,
  to_jsonb(
    'So that sorrow won’t have to go on anymore.'::text
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
  15,
  to_jsonb(
    'When I gasp, that light seems about to vanish,'::text
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
  16,
  to_jsonb(
    'and yet it surely still lives in my chest.'::text
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
  17,
  to_jsonb(
    'If I reached out, I could touch that warm future,'::text
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
  18,
  to_jsonb('quietly watching over the two of us.'::text)
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
  19,
  to_jsonb('Pop—the fireworks'::text)
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
  20,
  to_jsonb('bloomed in the night,'::text)
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
  21,
  to_jsonb('blooming into the night,'::text)
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
  22,
  to_jsonb('then faded away quietly.'::text)
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
  23,
  to_jsonb('Don’t let go.'::text)
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
  24,
  to_jsonb('Just a little longer,'::text)
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
  25,
  to_jsonb('just a little longer,'::text)
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
  26,
  to_jsonb('let’s stay like this.'::text)
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
  27,
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
  28,
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
  29,
  to_jsonb(
    'A flash—and fireworks bloom; we watched them.'::text
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
  30,
  to_jsonb('Surely the summer that hasn’t ended yet—'::text)
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
  31,
  to_jsonb(
    'will melt our vague hearts and tie them together.'::text
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
  32,
  to_jsonb('I wished this night would go on.'::text)
from
  public.translation_versions v
  join public.songs s on v.song_id = s.id
where
  s.slug = 'uchiage-hanabi'
  and v.language_code = 'en'
  and v.version_number = 1 on conflict (version_id, line_index)
do nothing;