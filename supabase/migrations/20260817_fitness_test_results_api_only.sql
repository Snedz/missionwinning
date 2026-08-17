-- fitness_test_results: inserts only via service role (/api/pft/results).
-- The client INSERT policy checked only auth.uid() = user_id, so a signed-in
-- PostgREST insert could attach an attacker-chosen class_code and overall_tier
-- to any class. There is no server membership table for PE class joins.
-- Idempotent: safe to run more than once.
-- SELECT of own rows stays (Users read own fitness test results).

drop policy if exists "Users insert own fitness test results" on public.fitness_test_results;

revoke insert on table public.fitness_test_results from anon, authenticated;
