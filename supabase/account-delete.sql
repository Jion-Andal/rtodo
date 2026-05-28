-- Run in Supabase Dashboard → SQL Editor (once per project)
-- Allows authenticated users to permanently delete their own account.

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  delete from public.rtodo_entries
  where user_id = v_user_id
    and group_id is null;

  delete from auth.users
  where id = v_user_id;
end;
$$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
