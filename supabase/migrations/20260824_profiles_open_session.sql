-- `.958` desk → gym: one in-progress Train session per identity.
-- Latest-state JSON. Null / tombstone (`deletedAt`) means no open session.
-- History stays on `workout_logs`. RLS already owner-only on profiles.

alter table public.profiles
  add column if not exists open_session jsonb;

comment on column public.profiles.open_session is
  'In-progress Train session snapshot (client_id, revision, workout). Tombstone or null when closed. Not history.';
