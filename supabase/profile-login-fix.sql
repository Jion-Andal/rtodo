-- Run this in Supabase SQL Editor to fix login after email confirmation

alter table public.profiles
  add column if not exists display_name text;

update public.profiles
set display_name = username
where display_name is null or display_name = '';

alter table public.profiles
  alter column display_name set not null;

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.get_email_for_username(p_username text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text;
  v_user_id uuid;
  v_username text;
  v_display_name text;
begin
  select u.email into v_email
  from public.profiles p
  join auth.users u on u.id = p.id
  where lower(p.username) = lower(trim(p_username));

  if v_email is not null then
    return v_email;
  end if;

  select
    u.email,
    u.id,
    trim(coalesce(u.raw_user_meta_data->>'username', '')),
    trim(coalesce(u.raw_user_meta_data->>'display_name', ''))
  into v_email, v_user_id, v_username, v_display_name
  from auth.users u
  where lower(u.raw_user_meta_data->>'username') = lower(trim(p_username))
  limit 1;

  if v_email is null then
    return null;
  end if;

  if v_username = '' then
    v_username := trim(p_username);
  end if;

  if v_display_name = '' then
    v_display_name := v_username;
  end if;

  insert into public.profiles (id, username, display_name)
  values (v_user_id, v_username, v_display_name)
  on conflict (id) do update
  set username = excluded.username,
      display_name = excluded.display_name;

  return v_email;
end;
$$;

revoke all on function public.get_email_for_username(text) from public;
grant execute on function public.get_email_for_username(text) to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text;
  v_display_name text;
begin
  v_username := trim(coalesce(new.raw_user_meta_data->>'username', ''));
  v_display_name := trim(coalesce(new.raw_user_meta_data->>'display_name', ''));

  if v_username = '' then
    v_username := split_part(new.email, '@', 1);
  end if;

  if v_display_name = '' then
    v_display_name := v_username;
  end if;

  insert into public.profiles (id, username, display_name)
  values (new.id, v_username, v_display_name)
  on conflict (id) do update
  set username = excluded.username,
      display_name = excluded.display_name;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, username, display_name)
select
  u.id,
  coalesce(
    nullif(trim(u.raw_user_meta_data->>'username'), ''),
    split_part(u.email, '@', 1)
  ),
  coalesce(
    nullif(trim(u.raw_user_meta_data->>'display_name'), ''),
    nullif(trim(u.raw_user_meta_data->>'username'), ''),
    split_part(u.email, '@', 1)
  )
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
)
on conflict (id) do nothing;
