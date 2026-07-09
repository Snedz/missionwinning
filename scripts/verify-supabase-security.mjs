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
  '20250629_journey_events.sql',
  '20250629_journey_state.sql',
  '20250629_leaderboard.sql',
  '20250629_leaderboard_squad_patch.sql',
  '20250629_fitness_test_school.sql',
  '20250629_pft_leaderboard_teacher_pin.sql',
  '20250629_youth_consent_records.sql',
  '20260702_security_hardening.sql',
  '20260703_reminders_optin.sql',
  '20260704_coach_plan.sql',
  '20260705_leads_api_only.sql',
];

console.log('Supabase migrations (apply in filename order via SQL editor or CLI):\n');
for (const m of MIGRATIONS) {
  console.log(`  - supabase/migrations/${m}`);
}

console.log(`
Manual verification after apply:
  1. school_classes: anon SELECT cannot read teacher_pin column (column privilege revoke)
  2. leaderboard_snapshots: anon SELECT requires auth.uid()
  3. enrollments: users can SELECT own rows only; INSERT via service role (webhooks)
  4. leads: anon INSERT removed (20260705_leads_api_only.sql)

Env required in production:
  - YOUTH_CONSENT_SECRET (dedicated — do not rely on PRIVATE_ACCESS_SECRET)
  - NUDGE_SECRET (dedicated)
  - DEMO_PREMIUM=false
  - SUPABASE_SERVICE_ROLE_KEY (server only)

Run gate smoke after deploy:
  SMOKE_BASE_URL=https://www.missionwinning.com npm run gate-smoke
`);

if (!process.argv.includes('--probe')) {
  process.exit(0);
}

const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(
  /\/$/,
  ''
);
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('\n--probe requires SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY\n');
  process.exit(1);
}

const headers = { apikey: key, Authorization: `Bearer ${key}` };
let failed = 0;

async function probe(name, path, expectStatus = 200) {
  const res = await fetch(`${url}/rest/v1/${path}`, { headers });
  const ok = res.status === expectStatus;
  console.log(`${ok ? '✓' : '✗'} ${name}: HTTP ${res.status}${ok ? '' : ` (expected ${expectStatus})`}`);
  if (!ok) failed++;
  return res;
}

console.log('\nProbing Supabase REST (service role)…\n');

try {
  await probe('school_classes readable', 'school_classes?select=code&limit=1');
  await probe('enrollments readable', 'enrollments?select=user_email&limit=1');
  await probe('leads readable', 'leads?select=email&limit=1');
} catch (e) {
  console.error('Probe failed:', e instanceof Error ? e.message : e);
  process.exit(1);
}

console.log(failed ? `\n${failed} probe(s) failed.\n` : '\nSupabase probe OK.\n');
process.exit(failed ? 1 : 0);
