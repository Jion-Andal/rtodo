-- Run if profiles already existed without display_name or the sign-up trigger

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

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text;
begin
  v_username := trim(coalesce(new.raw_user_meta_data->>'username', ''));

  if v_username = '' then
    v_username := split_part(new.email, '@', 1);
  end if;

  insert into public.profiles (id, username, display_name)
  values (new.id, v_username, v_username)
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
