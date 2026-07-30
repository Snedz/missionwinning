-- Per-call LLM spend ledger (.188).
--
-- Written ONLY by the service role from API routes. Rows carry token counts and
-- outcome metadata — NEVER prompt or completion content, upholding the
-- coachLlmClient contract ("never logs prompt/completion bodies"). This is the
-- table every future paid LLM feature (voice phases, Bundle rewrites) was gated
-- on: without a per-user meter there is no per-user cost cap.
--
-- Dual identity mirrors 20260728_anonymous_push.sql: the free logger needs no
-- account, so anonymous devices meter by their mw_device_id. A row with neither
-- owner is unattributable and rejected at the DB. Privacy posture: the device id
-- already leaves the device under the anonymous-push contract; this table stores
-- strictly less-sensitive data (counts, feature name, outcome).

create table if not exists public.llm_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  device_id text,
  feature text not null check (feature in
    ('coach_chat','daily_insight','plan_voice','debrief_voice','meal_vision')),
  model text,
  prompt_tokens integer not null default 0 check (prompt_tokens >= 0),
  completion_tokens integer not null default 0 check (completion_tokens >= 0),
  total_tokens integer not null default 0 check (total_tokens >= 0),
  -- True when counts came from the char heuristic, not the provider's meter.
  estimated boolean not null default false,
  ok boolean not null default true,
  -- Failure reason ('http_error','timeout',...) when ok = false.
  reason text,
  duration_ms integer,
  day date not null default (now() at time zone 'utc')::date,
  created_at timestamptz not null default now(),
  constraint llm_usage_owner_check check (user_id is not null or device_id is not null)
);

create index if not exists llm_usage_user_day_idx
  on public.llm_usage (user_id, day) where user_id is not null;
create index if not exists llm_usage_device_day_idx
  on public.llm_usage (device_id, day) where device_id is not null;
create index if not exists llm_usage_feature_day_idx
  on public.llm_usage (feature, day);

alter table public.llm_usage enable row level security;

-- Deliberately NO insert policy: a client that can insert its own meter rows can
-- forge its own spend. Service-role writes bypass RLS. Users may read their own
-- rows (future "your usage" UI); anonymous device rows are RLS-unreachable by
-- design, exactly like anonymous push rows.
create policy "Users read own llm usage"
  on public.llm_usage for select using (auth.uid() = user_id);
