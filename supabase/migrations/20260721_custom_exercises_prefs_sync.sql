-- Custom exercises + user prefs cloud sync for Android multi-device.

create table if not exists public.custom_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id text not null,
  name text not null,
  equipment text not null default 'any',
  muscle_groups text not null default '',
  revision integer not null default 1,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists custom_exercises_user_client_id_uidx
  on public.custom_exercises (user_id, client_id);

create index if not exists custom_exercises_user_updated_at_idx
  on public.custom_exercises (user_id, updated_at desc);

alter table public.custom_exercises enable row level security;

drop policy if exists "Users read own custom exercises" on public.custom_exercises;
drop policy if exists "Users insert own custom exercises" on public.custom_exercises;
drop policy if exists "Users update own custom exercises" on public.custom_exercises;
drop policy if exists "Users delete own custom exercises" on public.custom_exercises;

create policy "Users read own custom exercises"
  on public.custom_exercises for select using (auth.uid() = user_id);

create policy "Users insert own custom exercises"
  on public.custom_exercises for insert with check (auth.uid() = user_id);

create policy "Users update own custom exercises"
  on public.custom_exercises for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own custom exercises"
  on public.custom_exercises for delete using (auth.uid() = user_id);

create table if not exists public.mobile_user_prefs (
  user_id uuid primary key references auth.users(id) on delete cascade,
  weight_unit text not null default 'kg',
  default_rest_seconds integer not null default 60,
  equipment text not null default 'bodyweight',
  bar_weight_kg double precision not null default 20,
  bar_weight_lb double precision not null default 45,
  revision integer not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.mobile_user_prefs enable row level security;

drop policy if exists "Users read own mobile prefs" on public.mobile_user_prefs;
drop policy if exists "Users upsert own mobile prefs" on public.mobile_user_prefs;

create policy "Users read own mobile prefs"
  on public.mobile_user_prefs for select using (auth.uid() = user_id);

create policy "Users upsert own mobile prefs"
  on public.mobile_user_prefs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
