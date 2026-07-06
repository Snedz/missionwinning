-- Leads: inserts only via service role (/api/leads) — block direct anon spam.
-- Idempotent: safe to run more than once.

drop policy if exists "Anyone can submit leads" on public.leads;
drop policy if exists "Anon can submit leads" on public.leads;

-- No INSERT policy for anon/authenticated — API uses service role only.
