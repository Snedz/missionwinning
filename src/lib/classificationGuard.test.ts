/**
 * Classification hygiene — paths that must never re-enter product git as full war-room text.
 *
 * docs/CLASSIFICATION.md · docs/DUAL_REPO.md
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');

/** Full text must live only in mission-ops; product tip keeps stubs. */
const RELOCATED_INTERNAL = [
  'docs/STRATEGY.md',
  'docs/REDTEAM.md',
  'docs/PRELAUNCH_CAPITAL.md',
  'docs/OUTREACH_VA_BRIEF.md',
  'docs/YC_THESIS.md',
  'docs/ACCELERATOR_SPRINT.md',
  'docs/PRICING_REVIEW_2026-08.md',
] as const;

function gitLsFiles(): string[] {
  try {
    const out = execFileSync('git', ['ls-files', '-z'], {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    });
    return out.split('\0').filter(Boolean);
  } catch {
    return [];
  }
}

function isRelocatedStub(content: string): boolean {
  return (
    content.includes('RELOCATED_TO_MISSION_OPS') ||
    content.includes('Full text was removed from the public product tree')
  );
}

test('LOCAL session plans under .hermes/ are not tracked', () => {
  const tracked = gitLsFiles().filter((f) => f === '.hermes' || f.startsWith('.hermes/'));
  assert.deepEqual(
    tracked,
    [],
    `.hermes/ is LOCAL (session plans). Tracked paths:\n  ${tracked.join('\n  ')}\n` +
      `Remove with: git rm -r --cached .hermes && ensure .gitignore lists .hermes/`
  );
});

test('ops/ private war-room staging is not tracked', () => {
  const tracked = gitLsFiles().filter((f) => f === 'ops' || f.startsWith('ops/'));
  assert.deepEqual(
    tracked,
    [],
    `ops/ is LOCAL staging for mission-ops. Tracked:\n  ${tracked.join('\n  ')}`
  );
});

test('.gitignore forbids hermes and ops', () => {
  const gi = readFileSync(path.join(root, '.gitignore'), 'utf8');
  assert.match(gi, /^\.hermes\/?$/m, '.gitignore must list .hermes/');
  assert.match(gi, /^ops\/?$/m, '.gitignore must list ops/');
});

test('classification + dual-repo docs exist', () => {
  for (const p of [
    'docs/CLASSIFICATION.md',
    'docs/DUAL_REPO.md',
    'docs/contracts/INDEX.md',
    'docs/contracts/HABIT.md',
  ]) {
    assert.ok(existsSync(path.join(root, p)), `missing ${p}`);
  }
});

test('relocated INTERNAL docs are stubs, not full war-room memos', () => {
  const fat: string[] = [];
  const missing: string[] = [];
  for (const rel of RELOCATED_INTERNAL) {
    const abs = path.join(root, rel);
    if (!existsSync(abs)) {
      missing.push(rel);
      continue;
    }
    const body = readFileSync(abs, 'utf8');
    if (!isRelocatedStub(body)) {
      fat.push(`${rel} (${body.length} chars, missing RELOCATED_TO_MISSION_OPS marker)`);
    }
    // Hard size cap so a "stub" cannot quietly grow into a full memo again.
    if (body.length > 1200) {
      fat.push(`${rel} is ${body.length} bytes — stub budget is 1200`);
    }
  }
  assert.deepEqual(missing, [], `missing stub files:\n  ${missing.join('\n  ')}`);
  assert.deepEqual(
    fat,
    [],
    `INTERNAL war-room text must not live in the product tree. Move full text to ` +
      `mission-ops/strategy/ and keep a RELOCATED_TO_MISSION_OPS stub:\n  ${fat.join('\n  ')}`
  );
});
