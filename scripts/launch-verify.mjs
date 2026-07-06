#!/usr/bin/env node
/**
 * Phase H launch verification — chains founder-ops smoke scripts.
 *
 * Usage:
 *   node scripts/launch-verify.mjs
 *   SMOKE_BASE_URL=https://www.missionwinning.com SMOKE_ACCESS_SECRET=... npm run launch-verify
 *   SMOKE_EXPECT_PWA=true SMOKE_BASE_URL=... npm run launch-verify  # after PRIVATE_MODE=false
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = process.env.SMOKE_BASE_URL?.replace(/\/$/, '');

console.log('\n=== Mission Winning — Launch verification (Phase H) ===\n');

console.log('1. Supabase security migration checklist');
spawnSync('node', ['scripts/verify-supabase-security.mjs'], { cwd: root, stdio: 'inherit' });

console.log('\n2. Stripe enrollment + premium gates');
spawnSync('node', ['scripts/verify-stripe-enrollment.mjs'], { cwd: root, stdio: 'inherit' });
if (process.env.SMOKE_BASE_URL) {
  spawnSync('node', ['scripts/verify-stripe-enrollment.mjs', '--check-gates'], {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  });
}

if (!base) {
  console.log('\n3. Gate smoke — SKIPPED (set SMOKE_BASE_URL)');
  console.log('\n4. E2E hero flow — SKIPPED (set SMOKE_BASE_URL)');
  console.log('\nDone (local checklist only). For full verify:');
  console.log('  SMOKE_BASE_URL=https://your-domain SMOKE_ACCESS_SECRET=... npm run launch-verify\n');
  process.exit(0);
}

console.log(`\n3. Gate smoke — ${base}`);
const gate = spawnSync('npm', ['run', 'gate-smoke'], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});
if (gate.status !== 0) {
  console.error('\nGate smoke failed.');
  process.exit(gate.status ?? 1);
}

console.log('\n4. E2E hero flow (optional — requires Playwright)');
const e2e = spawnSync('npm', ['run', 'e2e'], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});
if (e2e.status !== 0) {
  console.error('\nE2E smoke failed (install Playwright if missing).');
  process.exit(e2e.status ?? 1);
}

console.log('\n=== Launch verification passed ===\n');
console.log('Founder ops still required: rotate secrets, apply migrations, DEMO_PREMIUM=false,');
console.log('DEPLOY_READINESS_TARGET=production on Vercel prod build, then PRIVATE_MODE=false.\n');
