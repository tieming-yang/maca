create policy "staff_insert_song_base_lines" on public.song_base_lines for insert
with
    check (
        auth.uid () is not null
        and exists (
            select
                1
            from
                public.profiles profile
            where
                profile.id = auth.uid ()
                and profile.role in ('admin', 'editor')
        )
    );

create policy "staff_update_song_base_lines" on public.song_base_lines for
update using (
    auth.uid () is not null
    and exists (
        select
            1
        from
            public.profiles profile
        where
            profile.id = auth.uid ()
            and profile.role in ('admin', 'editor')
    )
)
with
    check (
        auth.uid () is not null
        and exists (
            select
                1
            from
                public.profiles profile
            where
                profile.id = auth.uid ()
                and profile.role in ('admin', 'editor')
        )
    );