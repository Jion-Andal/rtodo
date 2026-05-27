-- Run in Supabase Dashboard → SQL Editor

create table if not exists public.rtodo_entries (
  id uuid primary key,
  user_id uuid references auth.users (id) on delete set null,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists rtodo_entries_updated_at_idx on public.rtodo_entries (updated_at desc);

alter table public.rtodo_entries enable row level security;

-- WARNING: Do not leave this policy in production. Run groups.sql next for scoped RLS.
drop policy if exists "Authenticated users manage rtodo entries" on public.rtodo_entries;

alter table public.rtodo_entries replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'rtodo_entries'
  ) then
    alter publication supabase_realtime add table public.rtodo_entries;
  end if;
end $$;
