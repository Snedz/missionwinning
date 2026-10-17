-- Equality on leads.email only matches the casing we store.
--
-- New signups are lowercased in the route. Rows already on disk keep the
-- caller's casing until this runs, so a later unsubscribe or cooldown check
-- would miss them.
--
-- Founder apply. Do not run this from an agent lane.

update public.leads
set email = lower(btrim(email))
where email is not null
  and email <> lower(btrim(email));
