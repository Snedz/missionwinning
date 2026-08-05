/**
 * Next's nested `postcss` must stay on a fixed line.
 *
 * Dependabot #44–#45 flagged `postcss@8.4.31` under `next@16.2.x` (high). Root
 * app postcss was already `8.5.25`, but Next bundled its own copy. Triage
 * accepted the pin until a Next minor — see [docs/SECURITY_AUDIT_TRIAGE.md](../../docs/SECURITY_AUDIT_TRIAGE.md).
 *
 * `.489` bumped next to 16.3.0; nested postcss landed at 8.5.23 (≥ fixed
 * 8.5.18). This guard fails if a future lockfile pulls Next's copy back under
 * the floor — without waiting for Dependabot to re-open the alert.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');

/** Fixed floor from the GHSA / Dependabot fix line for 8.4.31. */
const POSTCSS_FLOOR = [8, 5, 18] as const;

function parseSemver(v: string): [number, number, number] | null {
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(v);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function gte(a: [number, number, number], b: readonly [number, number, number]): boolean {
  for (let i = 0; i < 3; i++) {
    if (a[i] > b[i]) return true;
    if (a[i] < b[i]) return false;
  }
  return true;
}

test('next nested postcss is at or above the Dependabot fix floor', () => {
  const lockPath = path.join(root, 'package-lock.json');
  assert.ok(existsSync(lockPath), 'package-lock.json required');
  const lock = JSON.parse(readFileSync(lockPath, 'utf8')) as {
    packages?: Record<string, { version?: string; dependencies?: Record<string, string> }>;
  };
  const packages = lock.packages ?? {};

  const nestedKey = 'node_modules/next/node_modules/postcss';
  const nextKey = 'node_modules/next';
  const nested = packages[nestedKey];
  const nextPkg = packages[nextKey];

  // Prefer the nested install path; fall back to next's declared dependency
  // when npm dedupes postcss up (no nested folder).
  let version = nested?.version;
  let source = nestedKey;
  if (!version) {
    const declared = nextPkg?.dependencies?.postcss;
    assert.ok(
      declared,
      'next must declare postcss — lockfile shape changed; re-check Dependabot #44–#45'
    );
    // declared may be a range; resolve via root postcss if present
    const rootPostcss = packages['node_modules/postcss']?.version;
    version = rootPostcss ?? declared.replace(/^[\^~>=\s]+/, '');
    source = 'node_modules/postcss (deduped under next)';
  }

  const parsed = parseSemver(version);
  assert.ok(parsed, `unparseable postcss version ${version} from ${source}`);
  assert.ok(
    gte(parsed, POSTCSS_FLOOR),
    `next postcss ${version} at ${source} is below floor ${POSTCSS_FLOOR.join('.')} ` +
      '(Dependabot #44–#45 / GHSA line). Do not accept a lockfile regression.'
  );
});

test('next itself is past the 16.2.x pin that bundled postcss 8.4.31', () => {
  const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')) as {
    dependencies?: Record<string, string>;
  };
  const range = pkg.dependencies?.next ?? '';
  // Soft pin: must request ≥16.3 (caret ok). Mutant: put back ^16.2.12.
  assert.match(
    range,
    /\^?16\.(?:[3-9]|\d{2,})\./,
    `package.json next is ${range}; keep ≥16.3 so nested postcss stays fixed`
  );
});
