#!/usr/bin/env node
/**
 * Phase H launch readiness — static checklist + optional env/build checks.
 * Usage: npm run phase-h-readiness
 */
import { execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

async function main() {
  const { formatLaunchReadinessText, getLaunchReadinessReport } = await import(
    '../src/lib/launchReadiness.ts'
  );

  console.log('\n' + formatLaunchReadinessText() + '\n');

  console.log('▶ Unit tests');
  try {
    execSync('npm test', { cwd: root, stdio: 'inherit' });
  } catch {
    console.error('\n✗ Tests failed — fix before launch.\n');
    process.exit(1);
  }

  if (existsSync(join(root, '.env.local'))) {
    console.log('\n▶ Environment check (.env.local)');
    try {
      execSync('npm run check-env', { cwd: root, stdio: 'inherit' });
    } catch {
      console.warn('⚠ check-env reported issues');
    }
  }

  const r = getLaunchReadinessReport();
  console.log('\n▶ Launch day env (when beta gates pass):');
  console.log('  1. Rotate PRIVATE_ACCESS_SECRET in Vercel');
  console.log('  2. DEMO_PREMIUM=false');
  console.log('  3. Run Supabase migrations (PRE_LAUNCH_PLAN.md)');
  console.log('  4. Sync Vercel env from GitHub Secrets');
  console.log('  5. Deploy → npm run gate-smoke');
  console.log('  6. PRIVATE_MODE=false → redeploy → verify PWA install');
  console.log(`\n✓ Static readiness OK (${r.readyCount} automated checks green)\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
