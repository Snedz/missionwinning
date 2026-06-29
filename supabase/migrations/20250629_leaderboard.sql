-- Leaderboard snapshots (GT7-style global / regional / local rankings)
create table if not exists public.leaderboard_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  operator_name text not null default 'Mission Operator',
  mission_score integer not null default 0,
  training_streak integer not null default 0,
  weekly_volume integer not null default 0,
  fuel_days integer not null default 0,
  squad_code text,
  region text,
  country_code text,
  country_name text,
  locale text default 'en',
  updated_at timestamptz default now()
);

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

-- If upgrading from night_sessions column:
alter table public.leaderboard_snapshots drop column if exists night_sessions;
alter table public.leaderboard_snapshots add column if not exists fuel_days integer not null default 0;
alter table public.leaderboard_snapshots add column if not exists squad_code text;
