-- Leaderboard standings are computed on the server from logs.
-- Client INSERT/UPDATE let any signed-in JWT upsert an arbitrary mission_score.
-- SELECT for signed-in readers stays (20260702_security_hardening.sql).

drop policy if exists "Users upsert own leaderboard row" on public.leaderboard_snapshots;
drop policy if exists "Users update own leaderboard row" on public.leaderboard_snapshots;

revoke insert, update on table public.leaderboard_snapshots from anon, authenticated;
