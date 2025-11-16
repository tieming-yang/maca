-- allow owners to update any version (including published) and change status
drop policy if exists "owner_update_version_when_unpublished" on public.translation_versions;

create policy "owner_update_version" on public.translation_versions for
update using (created_by = auth.uid ())
with
    check (created_by = auth.uid ());

-- allow owners to edit their lines even when the version is published
drop policy if exists "owner_update_lines_of_own_unpublished_version" on public.translation_lines;

drop policy if exists "owner_delete_lines_of_own_unpublished_version" on public.translation_lines;

create policy "owner_manage_lines" on public.translation_lines for
update using (
    exists (
        select
            1
        from
            public.translation_versions v
        where
            v.id = translation_lines.version_id
            and v.created_by = auth.uid ()
    )
)
with
    check (
        exists (
            select
                1
            from
                public.translation_versions v
            where
                v.id = translation_lines.version_id
                and v.created_by = auth.uid ()
        )
    );

create policy "owner_delete_lines" on public.translation_lines for delete using (
    exists (
        select
            1
        from
            public.translation_versions v
        where
            v.id = translation_lines.version_id
            and v.created_by = auth.uid ()
    )
);