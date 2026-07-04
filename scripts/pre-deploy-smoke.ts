#!/usr/bin/env node
/**
 * Pre-deploy smoke — run before merging to master or triggering Vercel deploy.
 * Usage: npm run predeploy
 */
import { execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { assertDeployReady, getDeployReadinessReport } from '../src/lib/deployReadiness';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function run(label: string, command: string) {
  console.log(`\n▶ ${label}`);
  execSync(command, { cwd: root, stdio: 'inherit' });
}

console.log('Mission Winning — pre-deploy smoke\n');

run('Unit tests', 'npm test');
run('Locale export', 'npm run export-locales');
run('Lint', 'npm run lint');
assertDeployReady();
const report = getDeployReadinessReport();
console.log(`\n✓ Static checks — build ${report.buildLabel}, ${report.localeFiles} locale files planned`);

const envPath = join(root, '.env.local');
if (existsSync(envPath)) {
  console.log('\n▶ Environment check (.env.local)');
  try {
    execSync('npm run check-env', { cwd: root, stdio: 'inherit' });
  } catch {
    console.warn('⚠ check-env failed — fix before production deploy');
    process.exit(1);
  }
} else {
  console.log('\n· Skipping check-env (no .env.local) — run on Vercel deploy day');
}

run('Production build', 'npm run build');

console.log('\n✅ Pre-deploy smoke passed.');
console.log(`   Profile footer should show: ${report.buildLabel}`);
console.log('   After deploy: SMOKE_BASE_URL=https://your-domain npm run gate-smoke\n');
