create type song_visibility as enum('public', 'private');

alter table public.songs
add column visibility song_visibility not null default 'private';

update public.songs
set
    visibility = 'public'
where
    visibility = 'private';