#!/usr/bin/env node
/**
 * `npm run gate` — everything ci.yml would have checked, on your machine.
 *
 * Originally written because GitHub Actions was billing-blocked and nothing guarded
 * `master`. **Whether Actions is currently running is recorded in one place —
 * `CONTEXT.md` `## Now`** — and not restated here: this header claimed "Actions
 * works again as of 2026-07-29" while CONTEXT recorded it re-blocked on the 30th,
 * so the repo contradicted itself about its own CI in two files. One fact, one
 * home.
 *
 * Either way this stays the faster local pre-push check, and `check-build-label` /
 * `check-display-type` / `check-token-sync` ran *only* here until `.170` wired
 * them into ci.yml.
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
  /*
   * `.198` — a placeholder so push-opt-in UI renders under test.
   *
   * `isPushSupported()` returns false without a VAPID public key, so every
   * component behind it — the wind-down offer, the day-review opt-in — rendered
   * *nothing* in every e2e run this repo has ever done. A guard written about
   * those surfaces passes vacuously, which is exactly how a second red CTA
   * shipped past a green suite.
   *
   * Safe: this is the public half of a keypair and only gates whether the UI
   * draws. Nothing can subscribe — the server has no private key, and no test
   * grants notification permission.
   */
  NEXT_PUBLIC_VAPID_PUBLIC_KEY:
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U',
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
// Route handlers import `server-only`, which throws under plain tsx — this lane
// resolves it to a no-op via node's own `react-server` export condition, so the
// spend gates (`.188`) can be tested as wiring, not just as pure decisions.
run('Route contract tests', 'npm', ['run', 'test:routes']);
/*
 * `.225` — how much of the codebase did those two lanes actually execute?
 *
 * `node --test --experimental-test-coverage` answered 92%, over the 271 of 657
 * source files it happened to load; the other 386 were absent from the report
 * rather than scored zero. This runs both lanes again with lcov and fixes the
 * denominator, so a new file with no test raises a number somebody sees.
 *
 * It re-runs the tests rather than reusing the two lanes above — coverage needs
 * the instrumentation on, and paying ~1 min to have the figure be real beats
 * threading lcov through the lanes whose job is to be the fast red/green signal.
 */
run('Coverage floors', 'npm', ['run', 'coverage']);
run('i18n parity', 'npm', ['run', 'i18n:parity']);
// `i18n:parity` compares locale packs to each other and never opens a `.tsx`, so
// it is structurally blind to a key that exists in no pack at all. `.202`.
run('i18n coverage', 'npm', ['run', 'i18n:coverage']);
/*
 * `.219` — the check that had never run.
 *
 * `security-audit` lived only in `ci.yml`, where every job dies at
 * `runner_id: 0`, so it had never executed on any PR. `.200` fixed exactly this
 * for the a11y suite and `.213` found it again here. And it could not have
 * failed usefully anyway: the old script was a bare `npm audit --audit-level=high`
 * that exits 1 unconditionally while any unfixable advisory exists, so a *new*
 * advisory was invisible behind the permanent red.
 */
run('Dependency advisories', 'npm', ['run', 'security-audit']);
/*
 * `.221` — the Modernist rules, checked rather than stated.
 *
 * `check-token-sync` pins token values and never opens a `.tsx`, which is the
 * blind spot `.202` found in `i18n-parity`: a checker that compares definitions
 * to each other cannot see what components do. That is how a chart kept drawing
 * Tailwind blue through a full-app rebrand.
 */
run('Design system', 'npm', ['run', 'check-design-system']);
/*
 * `.222` — the packs stay split.
 *
 * English was split correctly and no other language was, so 2.0 MB of content
 * shipped as 30.8 MB. `split-locale-packs.mjs` restores it; this asserts a
 * re-run would be a no-op, because a cleanup that cannot be repeated undoes
 * itself the next time the fill tool runs.
 */
run('Locale split', 'npm', ['run', 'check-locale-split']);
// Both of these existed as npm scripts and neither was in the gate, so nothing ran them.
run('Display type', 'npm', ['run', 'check-display-type']);
run('Token sync (web ↔ Android)', 'npm', ['run', 'check-token-sync']);
run('Production build (PRIVATE_MODE=false)', 'npm', ['run', 'build'], BUILD_ENV);

/*
 * `.209` — the step that would have caught 306 KB.
 *
 * The gate had every kind of check except a byte count, and that is exactly how
 * all fifteen locale packs ended up as a `<script async>` on `/`, `/log` and
 * `/active`. Runs straight after the build, off the prerendered HTML, and costs
 * about a second.
 */
run('Bundle budget (gzipped initial JS)', 'npm', ['run', 'bundle-budget']);

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

if (e2e.status !== 0) {
  stopServer();
  console.error('\n[31m✗ Hero e2e failed[0m');
  process.exit(e2e.status ?? 1);
}

/*
 * `.200` — a11y, on the same server rather than in a workflow that never ran.
 *
 * `npm run a11y` is 33 tests over 30 routes and it executed **nowhere**: not in
 * this gate, whose own closing line said so, and not in any workflow — despite
 * `ci.yml` claiming it "stays in CI extended", while
 * `grep -rn a11y .github/workflows/` returned zero hits. The first time it was
 * ever run it found a real serious violation: a scrollable comparison table no
 * keyboard could reach.
 *
 * It reuses the server the hero lane just started, so the marginal cost is the
 * run itself rather than another build.
 */
step += 1;
console.log(`\n[1m[${step}] Accessibility (@a11y)[0m`);
const a11y = spawnSync('npm', ['run', 'a11y'], {
  stdio: 'inherit',
  env: { ...BUILD_ENV, SMOKE_BASE_URL: BASE },
  shell: process.platform === 'win32',
});
stopServer();

if (a11y.status !== 0) {
  console.error('\n[31m✗ Accessibility failed[0m');
  process.exit(a11y.status ?? 1);
}

const mins = ((Date.now() - started) / 60_000).toFixed(1);
console.log(`\n[32m✓ Gate passed in ${mins} min[0m`);
console.log('  Not covered here: npm run e2e:visual (needs deliberate baselines), Lighthouse (needs Chrome).');
