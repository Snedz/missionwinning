#!/usr/bin/env node
/**
 * `npm run gate` — everything ci.yml would have checked, on your machine.
 *
 * Exists because GitHub Actions is currently blocked (see
 * docs/VERCEL_DEPLOY_CHECKLIST.md §1.4), so nothing else guards `master`. Run it
 * before pushing.
 *
 * It builds with PRIVATE_MODE=false on purpose: that is what compiles the service
 * worker, and tests/e2e/offline.spec.ts needs one. It also starts and stops the
 * production server itself, because `e2e:gate` needs something to point at and a
 * safety net nobody can run in one command is not a safety net.
 */

import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import process from 'node:process';

const PORT = Number(process.env.GATE_PORT ?? 3000);
const BASE = `http://127.0.0.1:${PORT}`;

/** PRIVATE_MODE=false so the SW is built; placeholders keep Supabase from being required. */
const BUILD_ENV = {
  ...process.env,
  PRIVATE_MODE: 'false',
  NEXT_PUBLIC_SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ci-placeholder.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'ci-placeholder-anon-key',
};

let step = 0;
const started = Date.now();

function run(label, cmd, args, env = process.env) {
  step += 1;
  console.log(`\n[1m[${step}] ${label}[0m`);
  const r = spawnSync(cmd, args, { stdio: 'inherit', env, shell: process.platform === 'win32' });
  if (r.status !== 0) {
    console.error(`\n[31m✗ ${label} failed[0m`);
    process.exit(r.status ?? 1);
  }
}

async function waitForServer(timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/log`, { signal: AbortSignal.timeout(4_000) });
      if (res.ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 1_000));
  }
  return false;
}

/**
 * Refuse to run against a server this script did not start.
 *
 * `next start` cannot bind an occupied port, but `waitForServer()` only asks
 * whether *something* answers on it — so a dev server left running on 3000 was
 * enough to make the whole @gate suite silently test a stale build. That happened:
 * 34 tests failed against a pre-`.159` server while the same suite passed against a
 * clean one. Red was the lucky direction; a compatible-but-wrong build would have
 * gone green, which is the failure this repo has now hit four times
 * (`.129` sitemap, `.157` a11y routes, `.162` viewport, this).
 *
 * Checked before the build, not after, so the 3-minute compile is not wasted.
 */
async function assertPortFree() {
  step += 1;
  console.log(`\n\x1b[1m[${step}] Port ${PORT} unoccupied?\x1b[0m`);
  try {
    await fetch(BASE, { signal: AbortSignal.timeout(2_000) });
  } catch {
    console.log(`  nothing listening on ${PORT} — ok`);
    return;
  }
  console.error(
    `\n\x1b[31m✗ Something is already listening on ${PORT}.\x1b[0m\n` +
      `  The gate would test that server instead of the build it just made.\n` +
      `  Free it:            lsof -ti:${PORT} | xargs kill\n` +
      `  Or use another:     GATE_PORT=3222 npm run gate`
  );
  process.exit(1);
}

await assertPortFree();

/**
 * `playwright --version` succeeds even when no browser has been downloaded, which
 * turns a missing binary into a wall of cryptic test failures. Check the actual
 * executable so the hint is one clear line instead.
 */
function chromiumPath() {
  const probe = "import { chromium } from '@playwright/test'; process.stdout.write(chromium.executablePath());";
  const r = spawnSync(process.execPath, ['--input-type=module', '-e', probe], { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : '';
}

function hasChromium() {
  const p = chromiumPath();
  return !!p && existsSync(p);
}

// Cheap and early, next to the port guard: catching an unbumped label after a
// three-minute build wastes the build, and an unbumped label is what makes two
// branches announce the same version.
run('Build label + hard rule 5', 'npm', ['run', 'check-build-label']);
run('Lint', 'npm', ['run', 'lint']);
run('Typecheck', 'npm', ['run', 'typecheck']);
run('Unit tests', 'npm', ['test']);
run('i18n parity', 'npm', ['run', 'i18n:parity']);
// Both of these existed as npm scripts and neither was in the gate, so nothing ran them.
run('Display type', 'npm', ['run', 'check-display-type']);
run('Token sync (web ↔ Android)', 'npm', ['run', 'check-token-sync']);
run('Production build (PRIVATE_MODE=false)', 'npm', ['run', 'build'], BUILD_ENV);

if (!hasChromium()) {
  console.error('\n[31m✗ Playwright is unavailable — run: npx playwright install chromium[0m');
  process.exit(1);
}

step += 1;
console.log(`\n[1m[${step}] Hero e2e (@gate)[0m`);
const server = spawn('npm', ['run', 'start', '--', '--port', String(PORT)], {
  env: BUILD_ENV,
  stdio: 'ignore',
  detached: process.platform !== 'win32',
  shell: process.platform === 'win32',
});

const stopServer = () => {
  try {
    if (process.platform !== 'win32' && server.pid) process.kill(-server.pid, 'SIGKILL');
    else server.kill('SIGKILL');
  } catch {
    /* already gone */
  }
};
process.on('exit', stopServer);
process.on('SIGINT', () => {
  stopServer();
  process.exit(130);
});

if (!(await waitForServer())) {
  console.error(`\n[31m✗ Server never became ready on ${BASE}[0m`);
  process.exit(1);
}

const e2e = spawnSync('npm', ['run', 'e2e:gate'], {
  stdio: 'inherit',
  env: { ...BUILD_ENV, SMOKE_BASE_URL: BASE },
  shell: process.platform === 'win32',
});
stopServer();

if (e2e.status !== 0) {
  console.error('\n[31m✗ Hero e2e failed[0m');
  process.exit(e2e.status ?? 1);
}

const mins = ((Date.now() - started) / 60_000).toFixed(1);
console.log(`\n[32m✓ Gate passed in ${mins} min[0m`);
console.log('  Not covered here: npm run a11y, npm run e2e:visual, Lighthouse (needs Chrome).');
