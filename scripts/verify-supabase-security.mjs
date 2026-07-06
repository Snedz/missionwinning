#!/usr/bin/env node
/**
 * Supabase security migration checklist — run before public launch.
 *
 * Usage:
 *   node scripts/verify-supabase-security.mjs
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/verify-supabase-security.mjs --probe
 */
const MIGRATIONS = [
  '20250629_complete_base_schema.sql',
  '20250629_fitness_test_school.sql',
  '20260702_security_hardening.sql',
  '20260705_leads_api_only.sql',
];

console.log('Supabase security migrations (apply in order via SQL editor or CLI):\n');
for (const m of MIGRATIONS) {
  console.log(`  - supabase/migrations/${m}`);
}

console.log(`
Manual verification after apply:
  1. school_classes: anon SELECT cannot read teacher_pin column (column privilege revoke)
  2. leaderboard_snapshots: anon SELECT requires auth.uid()
  3. enrollments: users can SELECT own rows only; INSERT via service role (webhooks)
  4. leads: anon INSERT removed (after security migration v2 if applied)

Env required in production:
  - YOUTH_CONSENT_SECRET (dedicated — do not rely on PRIVATE_ACCESS_SECRET)
  - NUDGE_SECRET (dedicated)
  - DEMO_PREMIUM=false
  - SUPABASE_SERVICE_ROLE_KEY (server only)

Run gate smoke after deploy:
  SMOKE_BASE_URL=https://www.missionwinning.com npm run gate-smoke
`);

if (process.argv.includes('--probe')) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for --probe');
    process.exit(1);
  }
  const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/school_classes?select=code&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  console.log(`Probe school_classes: HTTP ${res.status}`);
}
