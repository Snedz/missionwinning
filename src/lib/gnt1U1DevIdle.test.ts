/**
 * GNT-1 U1 — written instruments must finish on `npm run dev`.
 *
 * Playwright `networkidle` never settles under Turbopack HMR. Critic boot is
 * `npm run dev` (docs/GAUNTLET_LOOP.md). Discover the workbench's named files
 * plus the helpers they import, rather than hoping a list stays current.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const U1_SPECS = [
  'tests/e2e/logger-depth.spec.ts',
  'tests/e2e/first-90.spec.ts',
  'tests/e2e/mobile-nav.spec.ts',
] as const;

const NETWORKIDLE = /waitUntil:\s*['"]networkidle['"]/;

function helperImports(src: string, fromFile: string): string[] {
  const dir = path.posix.dirname(fromFile);
  const out: string[] = [];
  for (const m of src.matchAll(/from ['"](\.[^'"]+)['"]/g)) {
    const spec = m[1];
    if (!spec.includes('/helpers/') && !spec.endsWith('/gotoHydrated') && !spec.endsWith('/active')) {
      continue;
    }
    const resolved = path.posix.normalize(`${dir}/${spec}`) + '.ts';
    out.push(resolved);
  }
  return out;
}

test('U1 e2e instruments do not wait for networkidle', () => {
  const files = new Set<string>(U1_SPECS);
  for (const spec of U1_SPECS) {
    for (const helper of helperImports(read(spec), spec)) {
      files.add(helper);
    }
  }

  const offenders: string[] = [];
  for (const file of [...files].sort()) {
    const src = read(file);
    if (NETWORKIDLE.test(src)) offenders.push(file);
  }
  assert.deepEqual(
    offenders,
    [],
    `U1 instruments still wait for networkidle (never settles on npm run dev): ${offenders.join(', ')}`
  );
});

test('U1 empty-start, REACH, and thumb-sweep go through gotoHydrated', () => {
  const active = read('tests/e2e/helpers/active.ts');
  assert.match(active, /gotoHydrated\(page, '\/active'\)/);
  assert.doesNotMatch(active, NETWORKIDLE);
  assert.match(active, /mw_equipment/);
  assert.match(active, /primary-action/);
  assert.doesNotMatch(active, /name: \/start workout\/i/);

  const nav = read('tests/e2e/mobile-nav.spec.ts');
  assert.match(nav, /gotoHydrated\(page, '\/log'\)/);
  assert.match(nav, /REACH_BUDGET = 2/);
  assert.match(nav, /moreSheetRowHrefs/);
  assert.doesNotMatch(nav, /['"]\/assessments['"]/);

  const first90 = read('tests/e2e/first-90.spec.ts');
  assert.match(first90, /startEmptyActiveWorkout/);
  assert.match(first90, /const TAP_BUDGET = 5/);
  assert.doesNotMatch(first90, /name: \/start workout\/i/);
  assert.doesNotMatch(first90, /name: \/turn on\/i/);
});
