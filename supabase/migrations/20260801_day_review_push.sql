-- Evening day-review push (`.194`).
--
-- Two columns, and the restraint is the design. `day_review_hour` is a
-- preference integer of exactly the same class as `days_per_week`; the marker
-- mirrors `last_wind_down_at` from the 20260730 migration.
--
-- What is deliberately NOT here: any behavior the athlete logged, any sleep
-- figure, any session load, any part of the review text. The privacy contract
-- for this table allows timestamps, a cadence integer, an IANA zone, and
-- one-bit results of device-side computation — nothing an athlete would
-- recognise as their own data. The 20260730 migration already refused to store
-- a three-value load zone on the reasoning that a per-session stream of zones
-- is reconstructable training history through the back door; a caffeine count
-- or a sleep time is categorically worse than that.
--
-- So the push is a doorbell. It says a review is ready and nothing else; the
-- review itself is composed on the device, from data that never left it, when
-- the athlete opens the app.

alter table public.push_subscriptions
  -- Local hour the athlete chose, 18–22. NULL means never opted in — this is
  -- the one nudge in the app that is strictly opt-in with a chosen time.
  add column if not exists day_review_hour smallint
    check (day_review_hour is null or (day_review_hour >= 18 and day_review_hour <= 22)),
  -- Per-kind send marker. Its own column, not shared with last_wind_down_at:
  -- sharing a marker would let one kind silently suppress the other forever.
  add column if not exists last_day_review_at timestamptz;

-- The sweep selects opted-in rows only, so the partial index matches the query.
create index if not exists push_subscriptions_day_review_idx
  on public.push_subscriptions (day_review_hour)
  where day_review_hour is not null;
