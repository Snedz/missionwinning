#!/usr/bin/env node
/**
 * Quick env sanity check — run: node scripts/check-env.mjs
 * Does not print secret values.
 */
const required = [
  ['PRIVATE_ACCESS_SECRET', 'Private gate password (Vercel + .env.local)'],
  ['NEXT_PUBLIC_SUPABASE_URL', 'Supabase project URL'],
  ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'Supabase anon key'],
];

const optional = [
  ['PRIVATE_MODE', 'true/false — gate on in production by default'],
  ['PRIVATE_ALLOW_AUTH_BYPASS', 'Leave unset/false — magic link should not bypass gate'],
  ['DEMO_PREMIUM', 'Must be false (or unset) in production'],
  ['BETA_ADMIN_EMAILS', 'Comma-separated founder emails for beta panel'],
  ['SUPABASE_SERVICE_ROLE_KEY', 'School classes, youth consent, leaderboards'],
  ['RESEND_API_KEY', 'Parent consent emails (required for under-13 flow in prod)'],
  ['YOUTH_CONSENT_SECRET', 'HMAC for youth consent codes (defaults to PRIVATE_ACCESS_SECRET)'],
  ['NEXT_PUBLIC_COUNCIL_STATUS', 'aspirational | pending | member'],
  ['NEXT_PUBLIC_SHOW_MAHA_COPY', 'true only after legal sign-off'],
  ['NEXT_PUBLIC_AMERICA_TRACK_ENABLED', 'false to hide /america PFT track'],
];

let ok = true;

console.log('\nMission Winning — environment check\n');

for (const [key, hint] of required) {
  const val = process.env[key];
  if (!val || val.includes('YOUR-PROJECT') || val.includes('change-me')) {
    console.log(`  ✗ ${key} — missing or placeholder (${hint})`);
    ok = false;
  } else {
    console.log(`  ✓ ${key}`);
  }
}

for (const [key, hint] of optional) {
  const val = process.env[key];
  console.log(val ? `  ✓ ${key}=${val}` : `  · ${key} (optional) — ${hint}`);
}

if (process.env.DEMO_PREMIUM === 'true') {
  console.log('  ⚠ DEMO_PREMIUM=true — disable before public production deploy');
}

if (process.env.NEXT_PUBLIC_SHOW_MAHA_COPY === 'true') {
  console.log('  ⚠ NEXT_PUBLIC_SHOW_MAHA_COPY=true — confirm legal review for MAHA copy');
}

if (
  process.env.NEXT_PUBLIC_COUNCIL_STATUS === 'member' &&
  process.env.NEXT_PUBLIC_SHOW_MAHA_COPY !== 'true'
) {
  console.log('  · COUNCIL_STATUS=member — MAHA copy still off (OK if intentional)');
}

console.log(ok ? '\nReady for private gated deploy.\n' : '\nFix the items above, then redeploy Vercel.\n');
process.exit(ok ? 0 : 1);
