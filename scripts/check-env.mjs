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

console.log(ok ? '\nReady for private gated deploy.\n' : '\nFix the items above, then redeploy Vercel.\n');
process.exit(ok ? 0 : 1);
