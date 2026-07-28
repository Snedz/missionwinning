-- Anonymous return loop: a device can hold a push subscription without an account.
--
-- Why: the free logger needs no account, so the modal athlete is anonymous. Before
-- this, user_id was `not null references auth.users`, which meant every return
-- channel required a sign-up and the boss metric (week-4 retained weekly loggers)
-- could only ever be moved for the minority who created one.
--
-- Anonymous rows are deliberately NOT readable or writable through RLS: auth.uid()
-- is null for them, so `auth.uid() = user_id` is null (not true) and every existing
-- policy denies. They are reached only by the service role, via /api/push/subscribe.
-- Do not add a public policy here — an endpoint anyone can call to enumerate device
-- rows is a much worse trade than one server route.

alter table public.push_subscriptions
  alter column user_id drop not null;

alter table public.push_subscriptions
  add column if not exists device_id text,
  -- Cadence for anonymous nudge selection. Deliberately NOT workout history: the
  -- privacy contract is that sets never leave the device. These four answer "is a
  -- return nudge due, and when is it decent to send it" and nothing else.
  add column if not exists last_session_at timestamptz,
  add column if not exists days_per_week smallint,
  add column if not exists time_zone text,
  add column if not exists last_nudge_at timestamptz;

-- A row without any owner is unreachable and unattributable — reject it at the DB
-- rather than discovering orphans later.
alter table public.push_subscriptions
  drop constraint if exists push_subscriptions_owner_check;
alter table public.push_subscriptions
  add constraint push_subscriptions_owner_check
  check (user_id is not null or device_id is not null);

create index if not exists push_subscriptions_device_idx
  on public.push_subscriptions (device_id)
  where device_id is not null;

-- Candidate selection scans by quietness, so index the column it sorts on.
create index if not exists push_subscriptions_last_session_idx
  on public.push_subscriptions (last_session_at desc)
  where last_session_at is not null;

comment on column public.push_subscriptions.user_id is
  'Null for anonymous devices. Set when the athlete signs in on this device.';
comment on column public.push_subscriptions.device_id is
  'Client-generated stable device UUID (mw_device_id) — see src/lib/coach/storage.ts';
comment on column public.push_subscriptions.days_per_week is
  'Athlete cadence, not a daily expectation: a 3x/week lifter must not be judged against 7.';
comment on column public.push_subscriptions.last_session_at is
  'Last logged session. Drives the re-entry threshold and the 28-day cold cutoff.';
