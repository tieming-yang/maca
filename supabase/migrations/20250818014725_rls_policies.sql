alter view public.song_with_base_json
set
  (security_invoker = on);

alter view public.translation_version_stats
set
  (security_invoker = on);

grant usage on schema public to anon,
authenticated;

grant
select
  on public.song_with_base_json,
  public.translation_version_stats to anon,
  authenticated;

-- with security_invoker=on, also grant select on base tables (RLS still enforces):
grant
select
  on public.songs,
  public.song_base_lines,
  public.translation_versions,
  public.translation_lines to anon,
  authenticated;
  