-- Close world-readable PE class join codes.
--
-- 20250629_fitness_test_school.sql opened SELECT using (true) for PUBLIC
-- (anon + authenticated). 20260702_security_hardening.sql hid teacher_pin
-- but re-GRANTed SELECT (code, name, created_by, created_at), so
-- GET /rest/v1/school_classes?select=code with the published anon key
-- still listed every class.
--
-- Lookups stay on the service-role path in src/lib/schoolClassServer.ts.
-- Teacher INSERT/UPDATE policies are unchanged — they do not grant SELECT.
-- Idempotent: safe to run more than once.

drop policy if exists "Anyone can read school class names" on public.school_classes;

revoke all on table public.school_classes from anon, authenticated;
revoke select on table public.school_classes from anon, authenticated;
revoke select (code, name, created_by, created_at)
  on table public.school_classes from anon, authenticated;
