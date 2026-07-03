-- Security hardening before public launch (PROTECTION.md P0 follow-up)
--
-- 1. school_classes.teacher_pin must never be readable through the anon API.
--    The SELECT RLS policy is intentionally open so students can look up a
--    class by code, but RLS is row-level only — the PIN column rode along.
--    Fix: column-level privileges. App code is unaffected: every teacher_pin
--    read/write goes through the service role (src/lib/schoolClassServer.ts),
--    and no client-side query selects from school_classes at all.
--
-- 2. leaderboard_snapshots was world-readable (using (true)) with the anon
--    key, allowing full enumeration of every operator name, score, squad,
--    region, and country. Restrict SELECT to signed-in users; signed-out
--    visitors still get local + pacer entries computed on-device
--    (src/lib/leaderboard/rank.ts) and fetchCloudLeaderboardSnapshots()
--    already degrades to [] on error.
--
-- Idempotent: safe to run more than once.

-- 1) school_classes: hide teacher_pin from the API roles ----------------------

revoke select on table public.school_classes from anon, authenticated;
grant select (code, name, created_by, created_at)
  on table public.school_classes to anon, authenticated;

-- 2) leaderboard_snapshots: authenticated readers only ------------------------

drop policy if exists "Anyone can read leaderboard" on public.leaderboard_snapshots;
drop policy if exists "Signed-in users read leaderboard" on public.leaderboard_snapshots;
create policy "Signed-in users read leaderboard"
  on public.leaderboard_snapshots for select
  using (auth.uid() is not null);
