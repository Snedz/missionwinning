#!/usr/bin/env tsx
/**
 * Horizon W excellence process ratchet (diff-based).
 *
 * Mirrors check-build-label: compare base...HEAD changed paths against
 * docs/EXCELLENCE_RESULT.md status. Surface paths require status:pass or
 * Excellence-Override trailer (PR body / any commit in range).
 *
 * Local only: EXCELLENCE_OVERRIDE=1 (ignored when CI=true / GITHUB_ACTIONS).
 *
 * Run: npm run check-excellence-gate  (also gate.mjs + PR ci.yml)
 *
 * Needs full history so origin/master (or GITHUB_BASE_REF) exists — same as
 * check-build-label. Shallow clones that lack the base fail loudly.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  EXCELLENCE_RESULT_PATH,
  blockedSurfacePaths,
  classifyPath,
  readExcellenceOverride,
  readExcellenceStatus,
  topLevelClassificationGaps,
} from '../src/lib/excellenceGate.ts';

function git(...args: string[]): string | null {
  const r = spawnSync('git', args, { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : null;
}

function fail(msg: string): never {
  console.error(`\x1b[31m✗ ${msg}\x1b[0m`);
  process.exit(1);
}

const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

// Staleness on the live tree (mutant F class) — cheap and always on.
const gaps = topLevelClassificationGaps(process.cwd());
if (gaps.missingFromMap.length || gaps.staleInMap.length) {
  fail(
    `Excellence gate path map is stale.\n` +
      (gaps.missingFromMap.length
        ? `  Missing from KNOWN_TOP_LEVELS: ${gaps.missingFromMap.join(', ')}\n`
        : '') +
      (gaps.staleInMap.length
        ? `  Stale in KNOWN_TOP_LEVELS: ${gaps.staleInMap.join(', ')}\n`
        : '') +
      `  Update src/lib/excellenceGate.ts KNOWN_TOP_LEVELS.`
  );
}

const resultPath = resolve(process.cwd(), EXCELLENCE_RESULT_PATH);
const raw = existsSync(resultPath) ? readFileSync(resultPath, 'utf8') : '';
const status = readExcellenceStatus(raw, (m) => console.warn(`  ${m}`));
if (!existsSync(resultPath)) {
  console.warn(`  ${EXCELLENCE_RESULT_PATH} missing — treating status as unscored`);
}

// Base ref: PR base from Actions, else origin/master, else master.
const ghBase = process.env.GITHUB_BASE_REF
  ? `origin/${process.env.GITHUB_BASE_REF}`
  : null;
const base =
  (ghBase && git('rev-parse', '--verify', '--quiet', ghBase) && ghBase) ||
  ['origin/master', 'master'].find((r) => git('rev-parse', '--verify', '--quiet', r));

if (!base) {
  fail(
    `Excellence gate: no base branch to diff against.\n` +
      `  Fetch master: git fetch origin master\n` +
      `  PR CI must use fetch-depth: 0 (same as check-build-label).`
  );
}

const head = git('rev-parse', 'HEAD');
const baseSha = git('rev-parse', base);
if (head && baseSha && head === baseSha) {
  console.log(
    `  HEAD is ${base} — nothing to compare (status ${status}); path map ok`
  );
  process.exit(0);
}

const changedRaw = git('diff', '--name-only', `${base}...HEAD`);
if (changedRaw === null) {
  fail(
    `Excellence gate: git diff ${base}...HEAD failed.\n` +
      `  Ensure ${base} exists locally (git fetch origin master).`
  );
}

const changed = changedRaw.split('\n').map((s) => s.trim()).filter(Boolean);
if (changed.length === 0) {
  console.log(`  no file changes vs ${base} (status ${status})`);
  process.exit(0);
}

const logRange = git('log', '--format=%B', `${base}...HEAD`) ?? '';
const commitMessages = logRange ? [logRange] : [];

let prBody = process.env.EXCELLENCE_PR_BODY ?? '';
if (!prBody && process.env.GITHUB_EVENT_PATH && existsSync(process.env.GITHUB_EVENT_PATH)) {
  try {
    const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')) as {
      pull_request?: { body?: string | null };
    };
    prBody = event.pull_request?.body ?? '';
  } catch {
    /* ignore */
  }
}

const override = readExcellenceOverride({
  commitMessages,
  prBody,
  envOverride: process.env.EXCELLENCE_OVERRIDE === '1',
  isCI,
});

const blocked = blockedSurfacePaths(changed, status, override);
if (blocked.length > 0) {
  fail(
    `Excellence gate: surface paths changed while ${EXCELLENCE_RESULT_PATH} status is ${status}.\n` +
      `  Score the phone path (status: pass) or add trailer Excellence-Override: <reason>.\n` +
      `  Surface files:\n` +
      blocked.map((f) => `    - ${f}`).join('\n')
  );
}

const surfaceCount = changed.filter((f) => classifyPath(f) === 'surface').length;

console.log(
  `  ✓ excellence ${status}${override ? ' (override)' : ''} · ${changed.length} changed · ${surfaceCount} surface allowed · base ${base}`
);
