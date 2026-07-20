-- Performance indexes: composite workout history + leaderboard board sorts.
-- Apply on prod via Supabase SQL editor or CLI (same path as wave 7–8).

-- History / nudges / week-4 retention: user + time
CREATE INDEX IF NOT EXISTS workout_logs_user_completed_at_idx
  ON public.workout_logs (user_id, completed_at DESC);

-- Leaderboard boards (each .limit(200) ordered by these columns)
CREATE INDEX IF NOT EXISTS leaderboard_training_streak_idx
  ON public.leaderboard_snapshots (training_streak DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS leaderboard_weekly_volume_idx
  ON public.leaderboard_snapshots (weekly_volume DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS leaderboard_fuel_days_idx
  ON public.leaderboard_snapshots (fuel_days DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS leaderboard_night_sessions_idx
  ON public.leaderboard_snapshots (night_sessions DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS leaderboard_dawn_sessions_idx
  ON public.leaderboard_snapshots (dawn_sessions DESC NULLS LAST);

-- Leads broadcast / cooldown scans
CREATE INDEX IF NOT EXISTS leads_confirmed_at_idx
  ON public.leads (confirmed_at)
  WHERE confirmed_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS leads_unsubscribed_at_idx
  ON public.leads (unsubscribed_at)
  WHERE unsubscribed_at IS NOT NULL;
