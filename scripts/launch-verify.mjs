#!/usr/bin/env node
/**
 * Phase H / Track D launch verification — chains founder-ops smoke scripts.
 *
 * Usage:
 *   npm run launch-verify
 *   npm run check-env -- --launch              # Horizon 0 (FREE_BETA: no Stripe)
 *   npm run check-env -- --launch --paid       # Horizon 1 (Stripe webhook + Checkout)
 *   LAUNCH_PAID=true npm run launch-verify     # same Horizon 1 profile
 *   SMOKE_BASE_URL=https://www.missionwinning.com SMOKE_ACCESS_SECRET=... npm run launch-verify
 *
 * After PRIVATE_MODE=false (public + PWA):
 *   SMOKE_BASE_URL=... SMOKE_ALLOW_PUBLIC=true SMOKE_EXPECT_PWA=true npm run launch-verify
 *   LAUNCH_STRICT=true npm run launch-verify   # fail on incomplete H0 launch env + require growth/rate-limit
 *   LAUNCH_STRICT=true LAUNCH_PAID=true npm run launch-verify  # H1 + smokes
 *
 * Optional skips (non-strict only recommended):
 *   SKIP_GROWTH_SMOKE=true SKIP_RATE_LIMIT_SMOKE=true npm run launch-verify
 *
 * Stripe webhook smoke (local or prod):
 *   SMOKE_BASE_URL=... STRIPE_WEBHOOK_SECRET=whsec_... node scripts/verify-stripe-enrollment.mjs --ping-webhook
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/verify-stripe-enrollment.mjs --verify-enrollment verify-test@missionwinning.com
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { checkEnvNodeArgs, launchPaidRequested } from './check-env.mjs';

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

const checkEnvArgs = checkEnvNodeArgs({
  envFile: existsSync(envLocal) ? envLocal : null,
  paid: launchPaidRequested(process.argv, process.env),
});

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
  console.log('3b. Growth smoke — SKIPPED (set SMOKE_BASE_URL)');
  console.log('3c. Rate-limit smoke — SKIPPED (set SMOKE_BASE_URL)');
  console.log('4. Critical E2E — SKIPPED (set SMOKE_BASE_URL)');
  console.log('\nDone (local checklist). Full verify:');
  console.log('  SMOKE_BASE_URL=https://your-domain SMOKE_ACCESS_SECRET=... npm run launch-verify');
  console.log('  LAUNCH_STRICT=true … npm run launch-verify  # require growth + rate-limit');
  console.log('\nPublic + PWA after PRIVATE_MODE=false:');
  console.log(
    '  SMOKE_BASE_URL=... SMOKE_ALLOW_PUBLIC=true SMOKE_EXPECT_PWA=true npm run launch-verify\n'
  );
  process.exit(0);
}

run(`3. Gate smoke — ${base}`, 'npm', ['run', 'gate-smoke']);

const skipGrowth = process.env.SKIP_GROWTH_SMOKE === 'true';
if (skipGrowth) {
  console.log('\n3b. Growth smoke — SKIPPED (SKIP_GROWTH_SMOKE=true)\n');
} else {
  run(`3b. Growth smoke — ${base}`, 'npm', ['run', 'growth-smoke'], {
    optional: !strict,
  });
}

const skipRateLimit = process.env.SKIP_RATE_LIMIT_SMOKE === 'true';
if (skipRateLimit) {
  console.log('\n3c. Rate-limit smoke — SKIPPED (SKIP_RATE_LIMIT_SMOKE=true)\n');
} else {
  const rateOk = run(`3c. Rate-limit smoke — ${base}`, 'npm', ['run', 'rate-limit-smoke'], {
    optional: !strict,
  });
  if (!rateOk && !strict) {
    console.log('   Tip: Wave A needs Upstash on Production for 429s.');
    console.log('   Set LAUNCH_STRICT=true to require rate-limit-smoke before flip.\n');
  }
}

if (process.env.CRON_SECRET && process.env.SKIP_WEEK4_SMOKE !== 'true') {
  run(`3d. Week-4 / digest smoke — ${base}`, 'npm', ['run', 'week4-smoke'], {
    optional: !strict,
  });
} else {
  console.log(
    '\n3d. Week-4 smoke — SKIPPED (set CRON_SECRET; SKIP_WEEK4_SMOKE=true to force skip)\n'
  );
}

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
console.log('  • MAIL_POSTAL_ADDRESS (required for invites — hard-blocked without it)');
console.log('  • Pending Supabase migrations (LAUNCH_RUNBOOK §2–§3; migrationLedger)');
console.log('  • Beta gates (docs/PLAN.md) before PRIVATE_MODE=false');
console.log('  • Then: PRIVATE_MODE=false, redeploy, re-run with SMOKE_ALLOW_PUBLIC=true SMOKE_EXPECT_PWA=true');
console.log('  • Agents never flip PRIVATE_MODE or invent traction — founder only\n');
