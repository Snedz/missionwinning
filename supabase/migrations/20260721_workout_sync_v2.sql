-- Sync v2: client_id, revision, tombstones, set fidelity in exercises jsonb.
-- Applied for multi-device full-fidelity workout push/pull.

alter table public.workout_logs
  add column if not exists client_id uuid,
  add column if not exists revision integer not null default 1,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists deleted_at timestamptz,
  add column if not exists weight_unit text not null default 'kg',
  add column if not exists session_id text,
  add column if not exists set_count integer not null default 0;

-- Unique client id per user (null client_id allowed for legacy web rows)
create unique index if not exists workout_logs_user_client_id_uidx
  on public.workout_logs (user_id, client_id)
  where client_id is not null;

create index if not exists workout_logs_user_updated_at_idx
  on public.workout_logs (user_id, updated_at desc);

-- Pull cursor helper for active (non-tombstoned) queries still use completed_at
create index if not exists workout_logs_user_completed_client_idx
  on public.workout_logs (user_id, completed_at desc);

drop policy if exists "Users update own workout logs" on public.workout_logs;
create policy "Users update own workout logs"
  on public.workout_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

comment on column public.workout_logs.client_id is 'Client-generated workout UUID (Room SoT id)';
comment on column public.workout_logs.revision is 'Monotonic revision; highest wins on conflict';
comment on column public.workout_logs.exercises is 'jsonb array of set rows (id, exerciseId, reps, weight, rpe, setKind, ...)';
