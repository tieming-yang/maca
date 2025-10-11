alter table public.song_base_lines
add column lyric text;

update public.song_base_lines
set
    lyric = coalesce(
        (
            select
                string_agg(
                    case
                        when jsonb_typeof(elem.value) = 'string' then elem.value #>> '{}'
                        else coalesce(
                            elem.value ->> 'kanji',
                            elem.value ->> 'text',
                            elem.value ->> 'value',
                            ''
                        )
                    end,
                    ''
                    order by
                        elem.ordinality
                )
            from
                jsonb_array_elements(ja_tokens)
            with
                ordinality as elem (value, ordinality)
        ),
        ''
    )
where
    lyric is null;

alter table public.song_base_lines
alter column lyric
set not null;

alter table public.song_base_lines
alter column ja_tokens
drop not null;

create or replace view
    public.song_base_lines_view as
select
    bl.id,
    bl.song_id,
    s.slug,
    s.name,
    s.youtube_id,
    bl.line_index,
    bl.timestamp_sec,
    bl.lyric
from
    public.song_base_lines bl
    join public.songs s on s.id = bl.song_id;