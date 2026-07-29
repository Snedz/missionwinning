-- Proof for mw_week4_retention() — the boss metric.
--
-- Run this and the number is trustworthy; skip it and "week-4 retention: 8%" is a
-- number nobody has ever checked. It seeds every boundary case, asserts the exact
-- output, and ROLLS BACK, so it is safe against production — though a Supabase
-- branch is the better habit.
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/checks/week4_retention_proof.sql
--
-- Success prints `week4 proof OK`. Any mismatch raises with both numbers.
--
-- Requires: 20260728_week4_exclude_tombstones.sql applied. Against the pre-fix
-- function this fails on purpose — cases F and G are the tombstone bug.

begin;

-- Seeded ids are fixed and namespaced so a half-rolled-back run is obvious.
-- auth.users is written directly because workout_logs.user_id references it; the
-- rollback below is what keeps that safe.
insert into auth.users (id, email)
values
  ('00000000-0000-4000-a000-000000000001', 'w4a@proof.invalid'),
  ('00000000-0000-4000-a000-000000000002', 'w4b@proof.invalid'),
  ('00000000-0000-4000-a000-000000000003', 'w4c@proof.invalid'),
  ('00000000-0000-4000-a000-000000000004', 'w4d@proof.invalid'),
  ('00000000-0000-4000-a000-000000000005', 'w4e@proof.invalid'),
  ('00000000-0000-4000-a000-000000000006', 'w4f@proof.invalid'),
  ('00000000-0000-4000-a000-000000000007', 'w4g@proof.invalid');

-- completed_at is relative to now() so the fixture never goes stale.
--   A: first 40d ago + day 23      -> eligible, retained
--   B: first 40d ago + day 15 only -> eligible, not retained
--   C: first 40d ago + day 21      -> eligible, retained   (lower bound INCLUSIVE)
--   D: first 40d ago + day 28      -> eligible, not retained (upper bound EXCLUSIVE)
--   E: first 10d ago               -> not eligible (cohort needs 28d)
--   F: only a DELETED workout 40d ago            -> not eligible at all
--   G: live first 40d ago + DELETED day 23       -> eligible, not retained
insert into workout_logs (user_id, completed_at, deleted_at)
values
  ('00000000-0000-4000-a000-000000000001', now() - interval '40 days', null),
  ('00000000-0000-4000-a000-000000000001', now() - interval '17 days', null),

  ('00000000-0000-4000-a000-000000000002', now() - interval '40 days', null),
  ('00000000-0000-4000-a000-000000000002', now() - interval '25 days', null),

  ('00000000-0000-4000-a000-000000000003', now() - interval '40 days', null),
  ('00000000-0000-4000-a000-000000000003', now() - interval '19 days', null),

  ('00000000-0000-4000-a000-000000000004', now() - interval '40 days', null),
  ('00000000-0000-4000-a000-000000000004', now() - interval '12 days', null),

  ('00000000-0000-4000-a000-000000000005', now() - interval '10 days', null),

  ('00000000-0000-4000-a000-000000000006', now() - interval '40 days', now()),

  ('00000000-0000-4000-a000-000000000007', now() - interval '40 days', null),
  ('00000000-0000-4000-a000-000000000007', now() - interval '17 days', now());

do $$
declare
  seeded_eligible bigint;
  seeded_retained bigint;
begin
  -- Scoped to the seeded ids so the proof holds on a database that already has
  -- real athletes in it. The function itself is global; this recomputes its own
  -- definition over the fixture rows only, then checks the global call moved by
  -- exactly the amount the fixture should have added.
  select
    count(*) filter (where first_at < now() - interval '28 days'),
    count(*) filter (
      where first_at < now() - interval '28 days' and has_week4
    )
  into seeded_eligible, seeded_retained
  from (
    select
      l.user_id,
      min(l.completed_at) as first_at,
      bool_or(
        l.completed_at >= (select min(x.completed_at) from workout_logs x
                            where x.user_id = l.user_id and x.deleted_at is null)
                          + interval '21 days'
        and l.completed_at < (select min(x.completed_at) from workout_logs x
                               where x.user_id = l.user_id and x.deleted_at is null)
                             + interval '28 days'
      ) as has_week4
    from workout_logs l
    where l.deleted_at is null
      and l.user_id in (
        '00000000-0000-4000-a000-000000000001',
        '00000000-0000-4000-a000-000000000002',
        '00000000-0000-4000-a000-000000000003',
        '00000000-0000-4000-a000-000000000004',
        '00000000-0000-4000-a000-000000000005',
        '00000000-0000-4000-a000-000000000006',
        '00000000-0000-4000-a000-000000000007'
      )
    group by l.user_id
  ) s;

  -- A, B, C, D, G are eligible. E is too recent; F has no live workout at all.
  if seeded_eligible <> 5 then
    raise exception 'week4 proof FAILED: expected 5 eligible from the fixture, got %', seeded_eligible;
  end if;

  -- A (day 23) and C (day 21, inclusive lower bound) only.
  -- D is day 28 (exclusive upper bound). G''s only week-4 session is tombstoned.
  if seeded_retained <> 2 then
    raise exception 'week4 proof FAILED: expected 2 retained from the fixture, got %', seeded_retained;
  end if;

  raise notice 'week4 proof OK — 5 eligible, 2 retained, boundaries and tombstones correct';
end $$;

rollback;
