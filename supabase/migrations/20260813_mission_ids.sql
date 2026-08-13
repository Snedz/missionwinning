-- Mission ID (.732): monotonic integer per signed-in account.
--
-- ID 1 is reserved for the founder (claimed in application code when GitHub
-- login is Snedz or BETA_ADMIN_EMAILS matches). Sequential ids start at 2 so
-- the sequence cannot issue 1. Authenticated clients may SELECT their own row
-- and nothing else — a client insert is a forged early id (ECONOMY: no client grant).

create sequence if not exists public.mission_id_seq
  as integer
  start with 2
  increment by 1
  minvalue 2
  no cycle;

create table if not exists public.mission_ids (
  user_id uuid primary key references auth.users(id) on delete cascade,
  mission_id integer not null unique check (mission_id >= 1),
  claimed_at timestamptz not null default now()
);

alter table public.mission_ids enable row level security;

drop policy if exists "Users read own mission id" on public.mission_ids;
create policy "Users read own mission id"
  on public.mission_ids for select
  using (auth.uid() = user_id);

-- No insert/update/delete policies for authenticated/anon. service_role bypasses RLS.

revoke all on table public.mission_ids from public, anon, authenticated;
grant select on table public.mission_ids to authenticated;

revoke all on sequence public.mission_id_seq from public, anon, authenticated;

create or replace function public.mw_next_mission_id()
returns integer
language sql
security definer
set search_path = public
as $$
  select nextval('public.mission_id_seq')::integer;
$$;

revoke all on function public.mw_next_mission_id() from public, anon, authenticated;
