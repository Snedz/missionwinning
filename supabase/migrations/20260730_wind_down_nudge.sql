-- Wind-down nudge: a same-evening note after a session that ran hot.
--
-- The privacy contract from 20260728_anonymous_push.sql holds — the server learns
-- cadence, never workout content. So this stores ONE BIT, not a zone and not a load.
--
-- Why a bit rather than the `light | steady | high` zone: an enum would store two
-- states nothing reads, and a per-session stream of zones is reconstructable training
-- history through the back door. "Was the most recent session above this athlete's own
-- band" is the coarsest signal that can time an evening message, and it self-heals —
-- every completed session overwrites it, so a steady session clears the flag with no
-- expiry logic anywhere.
--
-- The zone itself is computed ON THE DEVICE by `coach/load.ts` from history the server
-- never sees. This column is the one-bit result, not the inputs.

alter table public.push_subscriptions
  add column if not exists last_session_high boolean not null default false,
  add column if not exists last_wind_down_at timestamptz;

-- Candidate selection reads "high, and recent" — index the pair it filters on.
create index if not exists push_subscriptions_wind_down_idx
  on public.push_subscriptions (last_session_at desc)
  where last_session_high;

comment on column public.push_subscriptions.last_session_high is
  'One bit: the most recent synced session ran above this athlete''s own recent band. Set from the on-device debrief zone — never the zone itself, never sets, never load. Exists solely to time a same-evening recovery note.';

comment on column public.push_subscriptions.last_wind_down_at is
  'Per-kind send marker. A wind-down is due when this is null or older than last_session_at. Deliberately separate from last_nudge_at: sharing the 44h comeback cooldown would suppress exactly the success case — an athlete brought back by a morning comeback who then trains hard that evening.';
