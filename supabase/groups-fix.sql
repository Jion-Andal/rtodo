-- Run in Supabase SQL Editor if group creation fails with a generic error

-- group_members had SELECT policies but no INSERT policy; RLS blocked membership rows
drop policy if exists "Users insert own membership" on public.group_members;
create policy "Users insert own membership"
  on public.group_members for insert
  with check (auth.uid() = user_id);

-- Avoid pgcrypto dependency for invite codes
alter table public.groups
  alter column invite_code set default replace(gen_random_uuid()::text, '-', '');

-- Re-apply create function (unchanged logic, ensures it exists)
create or replace function public.create_rtodo_group(p_name text)
returns table (group_id uuid, group_name text, invite_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_group_id uuid;
  v_invite text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  v_name := trim(p_name);
  if v_name = '' then
    raise exception 'Group name is required';
  end if;

  if exists (
    select 1
    from public.groups g
    inner join public.group_members gm on gm.group_id = g.id
    where gm.user_id = auth.uid()
      and lower(g.name) = lower(v_name)
  ) then
    raise exception 'You already have a group with this name';
  end if;

  insert into public.groups as ins (name, created_by)
  values (v_name, auth.uid())
  returning ins.id, ins.name, ins.invite_code
  into v_group_id, v_name, v_invite;

  insert into public.group_members (group_id, user_id)
  values (v_group_id, auth.uid());

  update public.profiles
  set active_group_id = v_group_id
  where id = auth.uid();

  group_id := v_group_id;
  group_name := v_name;
  invite_code := v_invite;
  return next;
end;
$$;

revoke all on function public.create_rtodo_group(text) from public;
grant execute on function public.create_rtodo_group(text) to authenticated;
