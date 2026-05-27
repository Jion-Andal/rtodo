-- Supabase Dashboard → SQL Editor → New query
-- Paste ONLY the SQL below (do not paste the file path).

create or replace function public.list_rtodo_group_members(p_group_id uuid)
returns table (
  user_id uuid,
  username text,
  display_name text,
  is_owner boolean,
  joined_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    gm.user_id,
    p.username,
    p.display_name,
    (g.created_by = gm.user_id) as is_owner,
    gm.joined_at
  from public.group_members gm
  inner join public.groups g on g.id = gm.group_id
  inner join public.profiles p on p.id = gm.user_id
  where gm.group_id = p_group_id
    and public.is_group_member(p_group_id)
  order by (g.created_by = gm.user_id) desc, lower(p.username) asc;
$$;

revoke all on function public.list_rtodo_group_members(uuid) from public;
grant execute on function public.list_rtodo_group_members(uuid) to authenticated;
