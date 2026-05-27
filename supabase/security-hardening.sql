-- Run in Supabase SQL Editor (security fixes for production)

-- 1. Close group join bypass: membership only via SECURITY DEFINER RPCs
drop policy if exists "Users insert own membership" on public.group_members;
revoke insert on public.group_members from authenticated;
revoke insert on public.group_members from anon;

-- 2. Prevent moving entries between personal/group workspaces on update
create or replace function public.lock_rtodo_entry_scope()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.user_id is distinct from old.user_id
     or new.group_id is distinct from old.group_id then
    raise exception 'Cannot change entry ownership or workspace';
  end if;
  return new;
end;
$$;

drop trigger if exists lock_rtodo_entry_scope on public.rtodo_entries;
create trigger lock_rtodo_entry_scope
  before update on public.rtodo_entries
  for each row
  execute function public.lock_rtodo_entry_scope();

-- 3. Remove legacy open policy if it still exists
drop policy if exists "Authenticated users manage rtodo entries" on public.rtodo_entries;
