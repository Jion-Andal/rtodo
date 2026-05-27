-- Run in Supabase Dashboard → SQL Editor (after schema.sql and rtodo-entries.sql)

-- Groups
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique default replace(gen_random_uuid()::text, '-', ''),
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists groups_created_by_idx on public.groups (created_by);
create unique index if not exists groups_invite_code_idx on public.groups (invite_code);

-- Membership
create table if not exists public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index if not exists group_members_user_id_idx on public.group_members (user_id);

-- Active group preference (synced per user)
alter table public.profiles
  add column if not exists active_group_id uuid references public.groups (id) on delete set null;

-- Entries belong to a group (null = personal workspace)
alter table public.rtodo_entries
  add column if not exists group_id uuid references public.groups (id) on delete cascade;

create index if not exists rtodo_entries_group_id_idx on public.rtodo_entries (group_id);

-- Helpers
create or replace function public.is_group_member(p_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = p_group_id
      and gm.user_id = auth.uid()
  );
$$;

revoke all on function public.is_group_member(uuid) from public;
grant execute on function public.is_group_member(uuid) to authenticated;

-- RLS: groups
alter table public.groups enable row level security;

drop policy if exists "Members read groups" on public.groups;
create policy "Members read groups"
  on public.groups for select
  using (public.is_group_member(id));

drop policy if exists "Authenticated users create groups" on public.groups;
create policy "Authenticated users create groups"
  on public.groups for insert
  with check (auth.uid() = created_by);

-- RLS: group_members
alter table public.group_members enable row level security;

drop policy if exists "Members read group_members" on public.group_members;
create policy "Members read group_members"
  on public.group_members for select
  using (public.is_group_member(group_id));

drop policy if exists "Users read own memberships" on public.group_members;
create policy "Users read own memberships"
  on public.group_members for select
  using (auth.uid() = user_id);

-- Membership inserts only via SECURITY DEFINER RPCs (prevents join-by-guessing group_id)
revoke insert on public.group_members from authenticated;
revoke insert on public.group_members from anon;

drop policy if exists "Users delete own membership" on public.group_members;
create policy "Users delete own membership"
  on public.group_members for delete
  using (auth.uid() = user_id);

drop policy if exists "Creators delete own groups" on public.groups;
create policy "Creators delete own groups"
  on public.groups for delete
  using (auth.uid() = created_by);

-- RLS: rtodo_entries (replace open policy)
drop policy if exists "Authenticated users manage rtodo entries" on public.rtodo_entries;

drop policy if exists "Users read scoped rtodo entries" on public.rtodo_entries;
create policy "Users read scoped rtodo entries"
  on public.rtodo_entries for select
  using (
    (group_id is null and user_id = auth.uid())
    or (group_id is not null and public.is_group_member(group_id))
  );

drop policy if exists "Users insert scoped rtodo entries" on public.rtodo_entries;
create policy "Users insert scoped rtodo entries"
  on public.rtodo_entries for insert
  with check (
    auth.uid() is not null
    and (
      (group_id is null and user_id = auth.uid())
      or (group_id is not null and public.is_group_member(group_id) and user_id = auth.uid())
    )
  );

drop policy if exists "Users update scoped rtodo entries" on public.rtodo_entries;
create policy "Users update scoped rtodo entries"
  on public.rtodo_entries for update
  using (
    (group_id is null and user_id = auth.uid())
    or (group_id is not null and public.is_group_member(group_id))
  )
  with check (
    (group_id is null and user_id = auth.uid())
    or (group_id is not null and public.is_group_member(group_id))
  );

drop policy if exists "Users delete scoped rtodo entries" on public.rtodo_entries;
create policy "Users delete scoped rtodo entries"
  on public.rtodo_entries for delete
  using (
    (group_id is null and user_id = auth.uid())
    or (group_id is not null and public.is_group_member(group_id))
  );

-- Create group (unique name per user among their groups)
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

-- Join group via invite link
create or replace function public.join_rtodo_group_by_invite(p_invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group_id uuid;
  v_code text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  v_code := lower(trim(p_invite_code));
  if v_code = '' then
    raise exception 'Invalid invite code';
  end if;

  select g.id into v_group_id
  from public.groups g
  where lower(g.invite_code) = v_code;

  if v_group_id is null then
    raise exception 'Group not found';
  end if;

  insert into public.group_members (group_id, user_id)
  values (v_group_id, auth.uid())
  on conflict do nothing;

  update public.profiles
  set active_group_id = v_group_id
  where id = auth.uid();

  return v_group_id;
end;
$$;

revoke all on function public.join_rtodo_group_by_invite(text) from public;
grant execute on function public.join_rtodo_group_by_invite(text) to authenticated;

-- List groups for current user
create or replace function public.list_my_rtodo_groups()
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

-- Leave a group (members only; creators must delete)
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

-- Delete a group (creator only; removes all members and shared entries)
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

-- List members of a group (caller must be a member)
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

-- Prevent changing entry workspace or owner on update
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
