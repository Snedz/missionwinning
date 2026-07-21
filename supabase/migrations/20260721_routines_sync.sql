-- Cloud routines (templates) for multi-device restore — same rails as workout sync v2.

create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null,
  name text not null,
  exercises jsonb not null default '[]',
  source_workout_client_id text,
  revision integer not null default 1,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists routines_user_client_id_uidx
  on public.routines (user_id, client_id);

create index if not exists routines_user_updated_at_idx
  on public.routines (user_id, updated_at desc);

alter table public.routines enable row level security;

drop policy if exists "Users read own routines" on public.routines;
drop policy if exists "Users insert own routines" on public.routines;
drop policy if exists "Users update own routines" on public.routines;
drop policy if exists "Users delete own routines" on public.routines;

create policy "Users read own routines"
  on public.routines for select using (auth.uid() = user_id);

create policy "Users insert own routines"
  on public.routines for insert with check (auth.uid() = user_id);

create policy "Users update own routines"
  on public.routines for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own routines"
  on public.routines for delete using (auth.uid() = user_id);

comment on table public.routines is 'Saved workout templates; exercises jsonb mirrors Android RoutineExerciseDto list';
