-- Run this in Supabase SQL Editor if you hit:
--   ERROR: column "squad_code" does not exist
-- Safe to run multiple times (idempotent).

alter table public.leaderboard_snapshots add column if not exists fuel_days integer not null default 0;
alter table public.leaderboard_snapshots add column if not exists night_sessions integer not null default 0;
alter table public.leaderboard_snapshots add column if not exists dawn_sessions integer not null default 0;
alter table public.leaderboard_snapshots add column if not exists squad_code text;
alter table public.leaderboard_snapshots add column if not exists region text;
alter table public.leaderboard_snapshots add column if not exists country_code text;
alter table public.leaderboard_snapshots add column if not exists country_name text;
alter table public.leaderboard_snapshots add column if not exists locale text default 'en';
alter table public.leaderboard_snapshots add column if not exists updated_at timestamptz default now();

create index if not exists leaderboard_mission_score_idx
  on public.leaderboard_snapshots(mission_score desc);
create index if not exists leaderboard_region_idx
  on public.leaderboard_snapshots(region);
create index if not exists leaderboard_country_idx
  on public.leaderboard_snapshots(country_code);
create index if not exists leaderboard_squad_idx
  on public.leaderboard_snapshots(squad_code);

alter table public.leaderboard_snapshots enable row level security;

drop policy if exists "Anyone can read leaderboard" on public.leaderboard_snapshots;
create policy "Anyone can read leaderboard"
  on public.leaderboard_snapshots for select using (true);

drop policy if exists "Users upsert own leaderboard row" on public.leaderboard_snapshots;
create policy "Users upsert own leaderboard row"
  on public.leaderboard_snapshots for insert with check (auth.uid() = user_id);

drop policy if exists "Users update own leaderboard row" on public.leaderboard_snapshots;
create policy "Users update own leaderboard row"
  on public.leaderboard_snapshots for update using (auth.uid() = user_id);
