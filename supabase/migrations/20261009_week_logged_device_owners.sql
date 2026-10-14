-- Device-keyed `week_logged`: the boss metric finally able to see the athlete.
--
-- Why: Mission Winning's promise is "no account required, offline-first, local storage".
-- The north-star metric is "week-4 retained weekly loggers". Those two were in direct
-- conflict and the conflict had never been resolved:
--
--   * `week_logged.user_id` was `not null references auth.users`, so only an account
--     could ever produce a server row (`app/api/metrics/week-logged` answered 401 to
--     guests), and
--   * `mw_week4_retention()` reads `workout_logs.user_id`, whose every write path is
--     session-gated too (`app/api/mobile/sync/workouts/route.ts`).
--
-- So the modal athlete — the free logger user with no account — was structurally
-- invisible to both instruments. Applying the pending migration would have produced a
-- real number measuring the minority who violated the core promise. A flattering
-- number is worse than an absent one, because it closes the question without answering it.
--
-- This mirrors `20260728_anonymous_push.sql`, which already solved the identical problem
-- for the push return channel. The design rule carried over deliberately:
--
--   * anonymous rows are NOT readable or writable through RLS (auth.uid() is null for
--     them, so every policy denies). Do NOT add a public policy here — an endpoint
--     anyone can call to enumerate device rows is a worse trade than one server route.
--   * service role writes only, via /api/metrics/week-logged.
--
-- Do not apply from an agent — the founder applies via MCP, per the header on
-- 20260813_week_logged.sql.
--
-- ---------------------------------------------------------------------------
-- PRIVACY DECISION (recorded here deliberately, not by omission)
-- ---------------------------------------------------------------------------
-- `20260728_anonymous_push.sql:8-12` and docs/RETURN_LOOP_PLAN.md:73-74 draw the line:
-- **no workout history leaves the device; cadence and a last-session date may.**
--
-- A device-keyed ISO-week rollup stores *which weeks a person trained* — that is
-- behavioral history, one step past that line. It is accepted here, on three grounds,
-- and it is the narrowest form that makes the metric work:
--
--   1. CONSENT IS IMPLICIT IN THE RETURN CHANNEL. A row is only written for a device
--      that opted into reminders (push subscribe carries device_id). That is a stronger
--      signal than an analytics cookie, which can be set by accident and cleared at will.
--   2. IT IS A WEEK KEY, NOT A LOG. No exercise, no set, no weight, no timestamp, no
--      email, no EIN, no device model. One row per calendar week; a person who trains
--      6 times a week is indistinguishable from one who trains once.
--   3. IT IS ALREADY ON DEVICE. `src/lib/week4Logger.ts` writes the same week list to
--      localStorage under STORAGE_KEYS.week4Retention before anything is sent. This
--      migration does not create new knowledge about the athlete; it makes a fact the
--      device already holds server-aggregatable.
--
-- Classified in docs/help/privacy-and-data.md and docs/security/PROGRAM_STATUS.md.
-- `src/lib/privacyInstill.test.ts` failing on this is the correct signal, not a defect.
-- ---------------------------------------------------------------------------

alter table public.week_logged drop constraint if exists week_logged_pkey;

-- `not null` cannot survive an accountless owner. The PK moves to owner_key below.
alter table public.week_logged alter column user_id drop not null;

alter table public.week_logged add column if not exists device_id text;

-- One stable upsert target for both owner kinds.
--
-- A nullable column cannot be part of a primary key (PK columns are implicitly NOT
-- NULL), and two partial unique indexes cannot be addressed by a single
-- `onConflict: 'user_id,iso_week'` / `onConflict: 'device_id,iso_week'` — PostgREST
-- needs a real constraint to target. A generated key gives one constraint for both
-- kinds, and it is the same expression the reader uses to resolve cohorts, so the
-- write-side and read-side owner can never drift.
--
-- If both columns are null this yields NULL, which the PK rejects. The explicit CHECK
-- below is still added so the failure names its cause instead of surfacing as an
-- opaque primary-key violation.
alter table public.week_logged
  add column if not exists owner_key text
    generated always as (
      case
        when user_id is not null then 'u:' || user_id::text
        when device_id is not null then 'd:' || device_id
      end
    ) stored;

-- A row without any owner is unreachable and unattributable — reject it at the DB
-- rather than discovering orphans in a retention number months later.
alter table public.week_logged
  drop constraint if exists week_logged_owner_check;
alter table public.week_logged
  add constraint week_logged_owner_check
  check (user_id is not null or device_id is not null);

alter table public.week_logged
  add constraint week_logged_pkey primary key (owner_key, iso_week);

-- Cohort resolution scans one owner kind at a time.
create index if not exists week_logged_device_idx
  on public.week_logged (device_id)
  where device_id is not null;

comment on column public.week_logged.user_id is
  'Null for an accountless device. Set when the athlete signs in on this device; rows already written under device_id stay device-keyed and are resolved to this owner by mw_week4_retention_weekly().';
comment on column public.week_logged.device_id is
  'Client-generated stable device UUID (STORAGE_KEYS.deviceId), same value sent to /api/push/subscribe. Present only with push/reminder consent.';
comment on column public.week_logged.owner_key is
  'Generated upsert target: ''u:<uuid>'' when signed in, ''d:<device uuid>'' otherwise. Never sent by a client.';

-- ---------------------------------------------------------------------------
-- The reader.
--
-- `week_logged` was write-only. No select, no aggregate, no RPC consumed it anywhere
-- in the repo: the product was instrumented for a metric it could never compute, and
-- the missing reader was invisible because nothing failed when it stayed missing.
--
-- Rule: retained at week 4 = the athlete has a row for `first logged week + 3`.
-- That is exactly `computeRetainedWeek4()` in src/lib/week4Logger.ts:71-79, evaluated
-- with thisWeek := first_week + 3, and it lands on the same window as
-- mw_week4_retention()'s `first_at + 21 days .. + 28 days` block. Note the two are
-- deliberately NOT the same instrument — see the note on that function below.
-- ---------------------------------------------------------------------------

create or replace function public.mw_week4_retention_weekly()
returns table (
  cohort_iso_week text,
  cohort_eligible bigint,
  week4_retained bigint
)
language sql
security definer
set search_path = public
as $$
  -- A device that later signs in produces BOTH 'd:' rows (written while anonymous)
  -- and 'u:' rows (written after). Left alone that athlete becomes two cohorts and the
  -- denominator silently double-counts them. Collapse the device side onto the account
  -- side wherever the same device appears in both.
  with owner_link as (
    select distinct device_id::text as device_id, user_id::text as user_id
    from public.week_logged
    where device_id is not null and user_id is not null
  ),
  raw as (
    select
      coalesce(w.user_id::text, l.user_id, w.device_id::text) as owner_key,
      -- 'YYYY-Www': positions 1-4 are the year, 5 is the dash, 7-8 are the week.
      -- Off-by-one here is a silent failure, not a visible one: `from 6 for 2` yields
      -- 'W3', which raises on the int cast only when the function is first called.
      substring(w.iso_week from 1 for 4)::int as iso_year,
      substring(w.iso_week from 7 for 2)::int as iso_wk
    from public.week_logged w
    left join owner_link l on l.device_id = w.device_id
  ),
  weeks as (
    select
      r.owner_key,
      -- Monday of the ISO week. Jan 4 is always in ISO week 1, so step back to that
      -- week's Monday and add whole weeks. Returns a real date, so the +21 below is
      -- plain day arithmetic and never has to reason about 52/53-week years.
      (
        make_date(r.iso_year, 1, 4)
        - (extract(isodow from make_date(r.iso_year, 1, 4))::int - 1)
        + ((r.iso_wk - 1) * 7)
      )::date as week_monday
    from raw r
  ),
  firsts as (
    select owner_key, min(week_monday) as first_monday
    from weeks
    group by owner_key
  ),
  eligible as (
    select f.owner_key, f.first_monday
    from firsts f
    -- Week 4 has already opened. Before that the athlete cannot have been retained yet.
    where f.first_monday + 21 <= date_trunc('week', now())::date
  ),
  cohort as (
    select
      e.owner_key,
      e.first_monday,
      case when w.owner_key is null then 0 else 1 end as retained
    from eligible e
    left join weeks w
      on w.owner_key = e.owner_key
     and w.week_monday = e.first_monday + 21
  )
  select
    to_char(c.first_monday, 'IYYY-"W"IW') as cohort_iso_week,
    count(*)::bigint as cohort_eligible,
    sum(c.retained)::bigint as week4_retained
  from cohort c
  group by c.first_monday
  order by c.first_monday;
$$;

revoke all on function public.mw_week4_retention_weekly() from public;
revoke all on function public.mw_week4_retention_weekly() from anon, authenticated;

comment on function public.mw_week4_retention_weekly() is
  'Week-4 retention over week_logged, for accountless and signed-in athletes alike. One row per cohort ISO week: cohort_eligible = owners whose week 4 has opened; week4_retained = those with a log in week 4 (first logged week + 3). Use THIS over mw_week4_retention(), which measures signed-in athletes only.';

-- ---------------------------------------------------------------------------
-- Population declaration for the two instruments
-- ---------------------------------------------------------------------------

comment on function public.mw_week4_retention() is
  'SIGNED-IN ATHLETES ONLY. Counts accounts with a live workout_logs row, so it excludes every guest — the population the product is built for. Retained for continuity only; mw_week4_retention_weekly() is the boss metric. Excludes tombstoned logs (deleted_at). Window is days 21-27 inclusive after the first live workout. See docs/POST_LAUNCH_CADENCE.md.';

comment on table public.week_logged is
  'ISO-week logger rollup for accountless and signed-in athletes. One row per owner per local ISO week. No exercise, no set, no weight, no timestamp, no email, no EIN. Device rows exist only with push/reminder consent. See the privacy decision in 20261009_week_logged_device_owners.sql.';