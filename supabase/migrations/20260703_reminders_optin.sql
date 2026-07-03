-- Training reminder emails (Track C2): explicit opt-in + send throttling.
-- Users control this from Profile; every email carries an unsubscribe link.

alter table public.profiles add column if not exists reminders_opt_in boolean not null default false;
alter table public.profiles add column if not exists last_nudge_at timestamptz;

-- Existing "Users update own profile" RLS policy already covers these columns.
create index if not exists profiles_reminders_idx
  on public.profiles(reminders_opt_in)
  where reminders_opt_in = true;
