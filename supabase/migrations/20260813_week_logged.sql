-- Signed-in weekly logger rollup for the week-4 boss metric.
-- One row per account per local ISO week. No email, no EIN, no workout content.
-- Guests stay on-device (mw_week4_retention). Writes via /api/metrics/week-logged
-- (session + service role). Do not apply from an agent — CoS applies via MCP.

create table if not exists public.week_logged (
  user_id uuid not null references auth.users (id) on delete cascade,
  iso_week text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, iso_week)
);

create index if not exists week_logged_iso_week_idx
  on public.week_logged (iso_week);

alter table public.week_logged enable row level security;
-- No client policies: service-role upsert from the authenticated API route only.

comment on table public.week_logged is
  'Signed-in ISO-week logger rollup (working set saved). No PII beyond user_id. Guests stay local-only.';
