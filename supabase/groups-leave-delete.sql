-- Run in Supabase SQL Editor to add leave/delete group support

drop policy if exists "Users delete own membership" on public.group_members;
create policy "Users delete own membership"
  on public.group_members for delete
  using (auth.uid() = user_id);

drop policy if exists "Creators delete own groups" on public.groups;
create policy "Creators delete own groups"
  on public.groups for delete
  using (auth.uid() = created_by);

-- Return type changed (added is_owner); must drop before recreate
drop function if exists public.list_my_rtodo_groups();

create function public.list_my_rtodo_groups()
returns table (id uuid, name text, invite_code text, is_owner boolean)
language sql
stable
security definer
set search_path = public
as $$
  select g.id, g.name, g.invite_code, (g.created_by = auth.uid()) as is_owner
  from public.groups g
  inner join public.group_members gm on gm.group_id = g.id
  where gm.user_id = auth.uid()
  order by g.name asc;
$$;

revoke all on function public.list_my_rtodo_groups() from public;
grant execute on function public.list_my_rtodo_groups() to authenticated;

create or replace function public.leave_rtodo_group(p_group_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_group_member(p_group_id) then
    raise exception 'You are not a member of this group';
  end if;

  if exists (
    select 1
    from public.groups g
    where g.id = p_group_id
      and g.created_by = auth.uid()
  ) then
    raise exception 'Group creators must delete the group instead of leaving';
  end if;

  delete from public.group_members gm
  where gm.group_id = p_group_id
    and gm.user_id = auth.uid();

  update public.profiles p
  set active_group_id = null
  where p.id = auth.uid()
    and p.active_group_id = p_group_id;
end;
$$;

revoke all on function public.leave_rtodo_group(uuid) from public;
grant execute on function public.leave_rtodo_group(uuid) to authenticated;

create or replace function public.delete_rtodo_group(p_group_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1
    from public.groups g
    where g.id = p_group_id
      and g.created_by = auth.uid()
  ) then
    raise exception 'Only the group creator can delete this group';
  end if;

  update public.profiles p
  set active_group_id = null
  where p.active_group_id = p_group_id;

  delete from public.groups g
  where g.id = p_group_id;
end;
$$;

revoke all on function public.delete_rtodo_group(uuid) from public;
grant execute on function public.delete_rtodo_group(uuid) to authenticated;
