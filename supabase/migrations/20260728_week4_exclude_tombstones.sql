-- The boss metric was counting deleted workouts.
--
-- `mw_week4_retention()` shipped in 20260720_referrals.sql. `workout_logs.deleted_at`
-- arrived the next day in 20260721_workout_sync_v2.sql, and the function was never
-- revisited — so a soft-deleted session still enters the cohort and can still mark an
-- athlete as week-4 retained.
--
-- This is not a rounding error. Deletes propagate across devices (the `updated_at`
-- cursor, `.127`), so tombstones are a live path rather than a rarity, and the bias is
-- not even directional: a deleted first session inflates the denominator (hurting the
-- ratio) while a deleted week-4 session inflates the numerator (helping it). A number
-- you cannot sign is worse than one you know is high.
--
-- Window is unchanged and deliberate: `first_at + 21 days` inclusive to
-- `first_at + 28 days` exclusive is the fourth 7-day block when the first workout is
-- day 0 (weeks are 0-6, 7-13, 14-20, 21-27).

create or replace function public.mw_week4_retention()
returns table (cohort_eligible bigint, week4_retained bigint)
language sql
security definer
set search_path = public
as $$
  with live as (
    select user_id, completed_at
    from workout_logs
    where deleted_at is null
  ),
  first_workout as (
    select user_id, min(completed_at) as first_at
    from live
    group by user_id
  ),
  eligible as (
    select user_id, first_at
    from first_workout
    where first_at < now() - interval '28 days'
  ),
  week4 as (
    select e.user_id
    from eligible e
    join live w on w.user_id = e.user_id
    where w.completed_at >= e.first_at + interval '21 days'
      and w.completed_at < e.first_at + interval '28 days'
    group by e.user_id
  )
  select
    (select count(*)::bigint from eligible),
    (select count(*)::bigint from week4);
$$;

revoke all on function public.mw_week4_retention() from public;
revoke all on function public.mw_week4_retention() from anon, authenticated;

comment on function public.mw_week4_retention() is
  'Week-4 retained weekly loggers. Excludes tombstoned logs (deleted_at). Window is days 21-27 inclusive after the first live workout. See docs/POST_LAUNCH_CADENCE.md.';
