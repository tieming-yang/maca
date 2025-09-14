create
or replace function public.prevent_role_escalation () returns trigger language plpgsql security definer
set
  search_path = public as $$
begin
  if TG_OP = 'UPDATE' and new.role is distinct from old.role then
    if auth.uid() is null then
      return new;
    end if;

    if not exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    ) then 
      raise exception 'Only admin can change role';
    end if;
  end if;

    return new;
    end;
    $$;