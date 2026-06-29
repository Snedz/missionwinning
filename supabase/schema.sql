-- Mission Winning — Supabase schema (Phase C)
-- Run in Supabase SQL Editor after creating your project.
-- Matches src/lib/supabase.ts column shapes.

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  locale text default 'en',
  units text default 'metric',
  goals text,
  equipment text,
  experience text,
  primary_goal text,
  ui_mode text default 'simple',
  journey_state jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users read own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Premium enrollments (Stripe / PayPal / manual / demo webhook)
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  user_email text,
  product_id text,
  plan text default 'bundle',
  status text default 'active',
  premium_granted boolean default true,
  provider text,
  external_id text,
  purchased_at timestamptz default now(),
  expires_at timestamptz,
  pdf_urls text[] default '{}'
);

create index if not exists enrollments_user_id_idx on public.enrollments(user_id);
create index if not exists enrollments_user_email_idx on public.enrollments(user_email);
create unique index if not exists enrollments_provider_external_idx on public.enrollments(provider, external_id) where external_id is not null;

alter table public.enrollments enable row level security;

create policy "Users read own enrollments"
  on public.enrollments for select
  using (
    auth.uid() = user_id
    or user_email = (auth.jwt() ->> 'email')
  );

-- Leads (coaching, feedback, unlock requests)
create table if not exists public.leads (
  id bigserial primary key,
  name text,
  email text not null,
  goals text,
  current_training text,
  package_interest text,
  created_at timestamptz default now()
);

alter table public.leads enable row level security;

create policy "Anyone can submit leads"
  on public.leads for insert with check (true);

-- Journey analytics (beta funnel — journey_phase_complete, milestones)
create table if not exists public.journey_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_name text not null,
  payload jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists journey_events_user_id_idx on public.journey_events(user_id);
create index if not exists journey_events_name_idx on public.journey_events(event_name);

alter table public.journey_events enable row level security;

create policy "Users read own journey events"
  on public.journey_events for select using (auth.uid() = user_id);

create policy "Users insert own journey events"
  on public.journey_events for insert with check (auth.uid() = user_id);

-- Leaderboard snapshots (GT7-style rankings)
create table if not exists public.leaderboard_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  operator_name text not null default 'Mission Operator',
  mission_score integer not null default 0,
  training_streak integer not null default 0,
  weekly_volume integer not null default 0,
  fuel_days integer not null default 0,
  night_sessions integer not null default 0,
  dawn_sessions integer not null default 0,
  squad_code text,
  region text,
  country_code text,
  country_name text,
  locale text default 'en',
  updated_at timestamptz default now()
);

create index if not exists leaderboard_mission_score_idx on public.leaderboard_snapshots(mission_score desc);

alter table public.leaderboard_snapshots enable row level security;

create policy "Anyone can read leaderboard"
  on public.leaderboard_snapshots for select using (true);

create policy "Users upsert own leaderboard row"
  on public.leaderboard_snapshots for insert with check (auth.uid() = user_id);

create policy "Users update own leaderboard row"
  on public.leaderboard_snapshots for update using (auth.uid() = user_id);

-- Workout logs (cloud sync — flat columns match CloudWorkoutLog)
create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_name text not null,
  started_at timestamptz not null,
  completed_at timestamptz not null,
  duration_seconds integer not null default 0,
  exercises jsonb not null default '[]',
  total_volume numeric not null default 0,
  created_at timestamptz default now()
);

create index if not exists workout_logs_user_id_idx on public.workout_logs(user_id);
create index if not exists workout_logs_completed_at_idx on public.workout_logs(completed_at desc);

alter table public.workout_logs enable row level security;

create policy "Users read own workout logs"
  on public.workout_logs for select using (auth.uid() = user_id);

create policy "Users insert own workout logs"
  on public.workout_logs for insert with check (auth.uid() = user_id);

create policy "Users delete own workout logs"
  on public.workout_logs for delete using (auth.uid() = user_id);

-- Nutrition logs (pillar wins, macro entries)
create table if not exists public.nutrition_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  name text not null,
  protein numeric default 0,
  cals numeric default 0,
  carbs numeric,
  fat numeric,
  water_glasses integer,
  created_at timestamptz default now()
);

create index if not exists nutrition_logs_user_date_idx on public.nutrition_logs(user_id, date desc);

alter table public.nutrition_logs enable row level security;

create policy "Users manage own nutrition logs"
  on public.nutrition_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
