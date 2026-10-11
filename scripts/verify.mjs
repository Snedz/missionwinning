#!/usr/bin/env node
/**
 * `npm run verify` — the merge bar for every builder and the merge bot.
 *
 * Chains the existing cheap checks, then smoke-checks a server this process
 * started. It does not nest `npm run gate` (coverage, production build,
 * Playwright). That command stays the full local gate. See docs/CI_LOCAL.md
 * and docs/agents/PLAN-verify.md.
 *
 * Exit 0 only when every step passes. Prints PASS/FAIL per step and a summary.
 */

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import process from 'node:process';

const PORT = Number(process.env.VERIFY_PORT ?? 3099);
const HEALTH_TIMEOUT_MS = 180_000;

const STEPS = [
  { name: 'check-build-label', cmd: 'npm', args: ['run', 'check-build-label'] },
  { name: 'check-excellence-gate', cmd: 'npm', args: ['run', 'check-excellence-gate'] },
  { name: 'lint', cmd: 'npm', args: ['run', 'lint'] },
  { name: 'typecheck', cmd: 'npm', args: ['run', 'typecheck'] },
  { name: 'test', cmd: 'npm', args: ['test'] },
  { name: 'health', kind: 'health' },
];

const results = [];
const started = Date.now();

function seconds(ms) {
  return `${(ms / 1000).toFixed(1)}s`;
}

function runNpm(step) {
  const r = spawnSync(step.cmd, step.args, {
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32',
  });
  return r.status === 0;
}

function stopServer(child) {
  if (!child?.pid) return;
  try {
    if (process.platform !== 'win32') process.kill(-child.pid, 'SIGKILL');
    else child.kill('SIGKILL');
  } catch {
    /* already gone */
  }
}

function pause(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/**
 * `next dev` appends a rules block to AGENTS.md (or CLAUDE.md) when it
 * is missing. The smoke must not leave that edit behind.
 */
const AGENT_DOC_NAMES = ['AGENTS.md', 'CLAUDE.md'];
let agentDocs = null;

function snapshotAgentDocs() {
  agentDocs = new Map(
    AGENT_DOC_NAMES.map((name) => [name, existsSync(name) ? readFileSync(name) : null])
  );
}

function restoreAgentDocs() {
  if (!agentDocs) return;
  for (const [name, before] of agentDocs) {
    const exists = existsSync(name);
    if (before === null) {
      if (exists) unlinkSync(name);
      continue;
    }
    const now = exists ? readFileSync(name) : null;
    if (now === null || !now.equals(before)) writeFileSync(name, before);
  }
}

async function portBusy(port) {
  try {
    await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(1500) });
    return true;
  } catch {
    return false;
  }
}

/**
 * Boot next dev ourselves and require a shallow /api/health.
 * Deep mode needs CRON_SECRET and is out of this bar.
 * The process group is killed on success, failure, and signals.
 */
async function smokeHealth() {
  if (await portBusy(PORT)) {
    console.error(
      `\nSomething is already listening on ${PORT}.\n` +
        `  verify would smoke that server instead of the one it starts.\n` +
        `  Free it, or pick another: VERIFY_PORT=3199 npm run verify`
    );
    return false;
  }

  snapshotAgentDocs();
  const logs = [];
  const child = spawn(
    process.execPath,
    ['node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', String(PORT)],
    {
      env: process.env,
      detached: process.platform !== 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );
  const keep = (chunk) => {
    for (const line of chunk.toString().split('\n')) {
      if (!line) continue;
      logs.push(line);
      if (logs.length > 80) logs.shift();
    }
  };
  child.stdout?.on('data', keep);
  child.stderr?.on('data', keep);

  const stop = () => {
    stopServer(child);
    // Let SIGKILL land before we put the agent docs back.
    pause(50);
    restoreAgentDocs();
  };
  process.on('exit', stop);
  process.on('SIGINT', () => {
    stop();
    process.exit(130);
  });
  process.on('SIGTERM', () => {
    stop();
    process.exit(143);
  });

  const url = `http://127.0.0.1:${PORT}/api/health`;
  const deadline = Date.now() + HEALTH_TIMEOUT_MS;
  let last = 'no response yet';
  let ok = false;
  try {
    while (Date.now() < deadline) {
      if (child.exitCode !== null || child.signalCode) {
        last = `next dev exited (${child.exitCode ?? child.signalCode}) before /api/health answered`;
        break;
      }
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(4_000) });
        const text = await res.text();
        let body = null;
        try {
          body = JSON.parse(text);
        } catch {
          body = null;
        }
        const buildOk = typeof body?.build === 'string' && body.build.length > 0;
        if (res.status === 200 && body?.ok === true && buildOk) {
          console.log(`  /api/health 200 ok build=${body.build}`);
          ok = true;
          break;
        }
        last = `HTTP ${res.status} ${text.slice(0, 180)}`;
      } catch (e) {
        last = e instanceof Error ? e.message : String(e);
      }
      await new Promise((r) => setTimeout(r, 1_000));
    }
    if (!ok) {
      console.error(`\n/api/health smoke failed: ${last}`);
      if (logs.length) console.error(logs.slice(-20).join('\n'));
    }
    return ok;
  } finally {
    stop();
  }
}

function printSummary(failed) {
  console.log('\n======== verify ========');
  for (const row of results) {
    const timing = row.status === 'SKIP' ? 'skipped' : seconds(row.ms);
    console.log(`${row.status.padEnd(4)}  ${row.name.padEnd(22)}  ${timing}`);
  }
  const total = seconds(Date.now() - started);
  console.log(failed ? `\nVERIFY FAIL  ${total}` : `\nVERIFY PASS  ${total}`);
}

let failed = false;
for (const step of STEPS) {
  if (failed) {
    results.push({ name: step.name, status: 'SKIP', ms: 0 });
    continue;
  }
  console.log(`\n======== verify: ${step.name} ========`);
  const t0 = Date.now();
  const ok = step.kind === 'health' ? await smokeHealth() : runNpm(step);
  const ms = Date.now() - t0;
  results.push({ name: step.name, status: ok ? 'PASS' : 'FAIL', ms });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${step.name}  ${seconds(ms)}`);
  if (!ok) failed = true;
}

printSummary(failed);
process.exit(failed ? 1 : 0);
