-- Staged-rollout overrides for the founder flags console (.1067).
-- Catalog keys live in src/lib/featureFlags/catalog.ts. This table stores
-- percent / allowlist / kill only. Unknown keys are ignored at evaluate time.
-- Service role only. Missing table → admin 503 (never an empty list); evaluate
-- then uses catalog defaults. Do not fold PRIVATE_MODE into this.

create table if not exists public.feature_flag_overrides (
  flag_key text primary key
    check (char_length(flag_key) > 0 and char_length(flag_key) <= 80),
  percent integer not null default 0
    check (percent >= 0 and percent <= 100),
  killed boolean not null default false,
  allowlist jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by text not null
    check (char_length(updated_by) > 0 and char_length(updated_by) <= 320)
);

create table if not exists public.feature_flag_events (
  id bigint generated always as identity primary key,
  flag_key text not null
    check (char_length(flag_key) > 0 and char_length(flag_key) <= 80),
  kind text not null
    check (kind in ('percent', 'allowlist', 'kill', 'unkill')),
  payload jsonb not null default '{}'::jsonb,
  actor text not null
    check (char_length(actor) > 0 and char_length(actor) <= 320),
  created_at timestamptz not null default now()
);

create index if not exists feature_flag_events_created_at_idx
  on public.feature_flag_events (created_at desc);

alter table public.feature_flag_overrides enable row level security;
alter table public.feature_flag_events enable row level security;

revoke all on table public.feature_flag_overrides from anon, authenticated;
revoke all on table public.feature_flag_events from anon, authenticated;
