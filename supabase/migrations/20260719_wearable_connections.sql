-- Wearable OAuth connections + normalized samples (service-role writes; users read own).
-- See docs/WEARABLES.md

create table if not exists public.wearable_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  status text not null default 'connected'
    check (status in ('connected', 'error', 'revoked')),
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  scopes text,
  account_label text,
  last_sync_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create index if not exists wearable_connections_user_id_idx
  on public.wearable_connections (user_id);

create table if not exists public.wearable_samples (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null,
  kind text not null
    check (kind in ('workout', 'activity', 'sleep', 'hr', 'hrv', 'steps', 'recovery')),
  started_at timestamptz not null,
  ended_at timestamptz,
  external_id text not null,
  metrics jsonb not null default '{}'::jsonb,
  raw_summary text,
  created_at timestamptz not null default now(),
  unique (user_id, source, external_id)
);

create index if not exists wearable_samples_user_started_idx
  on public.wearable_samples (user_id, started_at desc);

create index if not exists wearable_samples_user_source_idx
  on public.wearable_samples (user_id, source);

alter table public.wearable_connections enable row level security;
alter table public.wearable_samples enable row level security;

-- Tokens are written by service role from API routes only.
drop policy if exists "Users read own wearable connections" on public.wearable_connections;
create policy "Users read own wearable connections"
  on public.wearable_connections for select
  using (auth.uid() = user_id);

drop policy if exists "Users read own wearable samples" on public.wearable_samples;
create policy "Users read own wearable samples"
  on public.wearable_samples for select
  using (auth.uid() = user_id);

drop policy if exists "Users delete own wearable samples" on public.wearable_samples;
create policy "Users delete own wearable samples"
  on public.wearable_samples for delete
  using (auth.uid() = user_id);
