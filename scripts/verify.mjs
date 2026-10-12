#!/usr/bin/env node
/**
 * `npm run verify` — the single merge gate for agents and humans.
 *
 * Chains the repo's existing checks in order, then builds, boots the production
 * server on a free port and smoke-checks GET /api/health (shallow, no secrets).
 * Prints a PASS/FAIL summary and exits non-zero if any step fails.
 *
 * Flags: --no-build   skip build + health smoke (fast inner loop only; not a merge gate)
 *        --keep-going run every step even after a failure (default: stop at first FAIL)
 *
 * Build env mirrors scripts/gate.mjs: placeholder public Supabase values only so
 * the build does not need real secrets. It never reads or writes .env files.
 */
import { spawn, spawnSync } from 'node:child_process';
import process from 'node:process';

const args = new Set(process.argv.slice(2));
const NO_BUILD = args.has('--no-build');
const KEEP_GOING = args.has('--keep-going');
const PORT = Number(process.env.VERIFY_PORT ?? 3917);

const BUILD_ENV = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ci-placeholder.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'ci-placeholder-anon-key',
};

const results = [];
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function run(name, cmd, cmdArgs, env = process.env) {
  const t0 = Date.now();
  console.log(`\n▶ ${name}: ${cmd} ${cmdArgs.join(' ')}`);
  const r = spawnSync(cmd, cmdArgs, { stdio: 'inherit', env });
  const ok = r.status === 0;
  results.push({ name, ok, ms: Date.now() - t0 });
  return ok;
}

async function healthSmoke() {
  const t0 = Date.now();
  console.log(`\n▶ health: next start -p ${PORT} → GET /api/health`);
  const srv = spawn(npm, ['run', 'start', '--', '-p', String(PORT)], { env: BUILD_ENV, stdio: 'ignore', detached: true });
  let ok = false;
  let detail = 'no response';
  for (let i = 0; i < 60 && !ok; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/api/health`);
      const body = await res.json().catch(() => ({}));
      detail = `HTTP ${res.status} ok=${body.ok}`;
      ok = res.status === 200 && body.ok === true;
      if (res.status) break;
    } catch {}
  }
  try { process.kill(-srv.pid, 'SIGTERM'); } catch {}
  console.log(`  ${detail}`);
  results.push({ name: 'health', ok, ms: Date.now() - t0 });
  return ok;
}

const steps = [
  ['typecheck', () => run('typecheck', npm, ['run', 'typecheck'])],
  ['lint', () => run('lint', npm, ['run', 'lint'])],
  ['test', () => run('test', npm, ['test'])],
];
if (!NO_BUILD) {
  steps.push(['build', () => run('build', npm, ['run', 'build'], BUILD_ENV)]);
  steps.push(['health', healthSmoke]);
}

for (const [, step] of steps) {
  const ok = await step();
  if (!ok && !KEEP_GOING) break;
}

const ran = new Set(results.map((r) => r.name));
console.log('\n── verify summary ──');
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name.padEnd(10)} ${(r.ms / 1000).toFixed(1)}s`);
for (const [name] of steps) if (!ran.has(name)) console.log(`SKIP  ${name}`);
const pass = results.length === steps.length && results.every((r) => r.ok);
console.log(pass ? '\nVERIFY: PASS' : '\nVERIFY: FAIL');
process.exit(pass ? 0 : 1);
