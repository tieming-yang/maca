alter table public.song_base_lines
drop constraint song_base_lines_song_id_line_index_key;

create unique index on public.song_base_lines (song_id, timestamp_sec);