#!/usr/bin/env node
/**
 * Phase H / Track D launch verification — chains founder-ops smoke scripts.
 *
 * Usage:
 *   npm run launch-verify
 *   npm run check-env -- --launch
 *   SMOKE_BASE_URL=https://www.missionwinning.com SMOKE_ACCESS_SECRET=... npm run launch-verify
 *
 * After PRIVATE_MODE=false (public + PWA):
 *   SMOKE_BASE_URL=... SMOKE_ALLOW_PUBLIC=true SMOKE_EXPECT_PWA=true npm run launch-verify
 *   LAUNCH_STRICT=true npm run launch-verify   # fail on incomplete launch env
 *
 * Stripe webhook smoke (local or prod):
 *   SMOKE_BASE_URL=... STRIPE_WEBHOOK_SECRET=whsec_... node scripts/verify-stripe-enrollment.mjs --ping-webhook
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/verify-stripe-enrollment.mjs --verify-enrollment verify-test@missionwinning.com
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = process.env.SMOKE_BASE_URL?.replace(/\/$/, '');
const envLocal = join(root, '.env.local');

function run(label, cmd, args = [], { optional = false } = {}) {
  console.log(`\n${label}`);
  const result = spawnSync(cmd, args, { cwd: root, stdio: 'inherit', env: process.env });
  if (result.status !== 0) {
    if (optional) {
      console.warn(`\n⚠ ${label} — skipped or failed (optional)\n`);
      return false;
    }
    console.error(`\n✗ ${label} failed.\n`);
    process.exit(result.status ?? 1);
  }
  return true;
}

console.log('\n=== Mission Winning — Launch verification (Track D) ===\n');

const checkEnvArgs = existsSync(envLocal)
  ? ['--env-file', envLocal, 'scripts/check-env.mjs', '--launch']
  : ['scripts/check-env.mjs', '--launch'];

const strict = process.env.LAUNCH_STRICT === 'true';

run('0. Launch env checklist (local or CI secrets)', 'node', checkEnvArgs, {
  optional: !strict,
});

if (strict) {
  run('0b. Pre-deploy smoke (LAUNCH_STRICT)', 'npm', ['run', 'predeploy']);
} else {
  console.log('\n0b. Pre-deploy smoke — skipped (set LAUNCH_STRICT=true to require)\n');
}

run('1. Supabase security migrations + probe', 'node', [
  'scripts/verify-supabase-security.mjs',
  ...(process.env.SUPABASE_SERVICE_ROLE_KEY ? ['--probe'] : []),
]);

run('2a. Stripe enrollment shape (reference)', 'node', ['scripts/verify-stripe-enrollment.mjs']);

if (base) {
  run('2b. Premium API gates (remote)', 'node', ['scripts/verify-stripe-enrollment.mjs', '--check-gates']);
} else {
  console.log('\n2b. Premium API gates — SKIPPED (set SMOKE_BASE_URL)\n');
}

if (!base) {
  console.log('3. Gate smoke — SKIPPED (set SMOKE_BASE_URL)');
  console.log('4. Critical E2E — SKIPPED (set SMOKE_BASE_URL)');
  console.log('\nDone (local checklist). Full verify:');
  console.log('  SMOKE_BASE_URL=https://your-domain SMOKE_ACCESS_SECRET=... npm run launch-verify');
  console.log('\nPublic + PWA after PRIVATE_MODE=false:');
  console.log(
    '  SMOKE_BASE_URL=... SMOKE_ALLOW_PUBLIC=true SMOKE_EXPECT_PWA=true npm run launch-verify\n'
  );
  process.exit(0);
}

run(`3. Gate smoke — ${base}`, 'npm', ['run', 'gate-smoke']);

const e2eOk = run('4. Critical path E2E (Playwright)', 'npm', ['run', 'e2e:critical'], { optional: true });
if (!e2eOk) {
  console.log('   Tip: run against a local prod server:');
  console.log('   PRIVATE_MODE=false npm run build && npm run start');
  console.log('   SMOKE_BASE_URL=http://127.0.0.1:3000 npm run e2e:critical\n');
}

console.log('\n=== Launch verification passed ===\n');
console.log('Founder ops still manual:');
console.log('  • Rotate PRIVATE_ACCESS_SECRET on Vercel (never reuse dev placeholders)');
console.log('  • Apply all supabase/migrations/ in SQL editor');
console.log('  • Stripe test purchase → enrollments row → npm run verify-premium');
console.log('  • Beta gates (PLAN.md) before PRIVATE_MODE=false');
console.log('  • Then: PRIVATE_MODE=false, redeploy, re-run with SMOKE_ALLOW_PUBLIC=true SMOKE_EXPECT_PWA=true\n');
