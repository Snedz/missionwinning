-- Privacy-first Android install heartbeats (opaque install id + ISO week only).
-- No email, no workout content. Service-role writes from /api/mobile/telemetry.

create table if not exists public.android_telemetry_heartbeats (
  install_id uuid not null,
  week_key text not null,
  app_version text,
  created_at timestamptz not null default now(),
  primary key (install_id, week_key)
);

create index if not exists android_telemetry_week_idx
  on public.android_telemetry_heartbeats (week_key);

alter table public.android_telemetry_heartbeats enable row level security;
-- No client policies: writes only via service role on the API route.

comment on table public.android_telemetry_heartbeats is
  'Anonymous Android weekly active installs for week-4 denominator (no PII)';
