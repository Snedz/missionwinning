/**
 * The ratchet on the coverage floors, and the two ways this check could quietly
 * stop meaning anything.
 *
 * `scripts/coverage.mjs` exists because the suite reported **92%** while reaching
 * **271 of 657** source files — a percentage computed over whatever happened to
 * get imported, which is the same defect as `.213`'s `ciTruth` counting
 * billing-blocked workflows as coverage. A number that cannot see what it is
 * missing is worse than no number, because it is quoted.
 *
 * Fixing the denominator is only half of it. A floor that follows reality is not a
 * floor, it is a changelog of the debt (`.202`), so the high-water marks live here
 * and loosening one means editing this file in the same commit, with the reason
 * visible in the diff.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const SCRIPT = 'scripts/coverage.mjs';

/**
 * The floors as first set, measured 2026-08-01 against the suite that shipped
 * with them.
 *
 * `untestedFiles` may only go **down**; the two percentages may only go **up**.
 * They start at the measured values with no slack, because a floor set below where
 * you already are cannot fail — `.219`'s saturated `npm audit`, which spent its
 * whole life exiting 1 and therefore said nothing.
 */
const HIGH_WATER = {
  /**
   * 393 of ~694 source files are loaded by no test. Lower it by writing one.
   *
   * `.262` took this from 386 to 381 (the revenue path, then the launch gate),
   * then master merged in twelve new source files and it rose to 389: ten are
   * Playwright-covered UI, two were logic and got tests. D11–D13 raised it to
   * 393 for four more Playwright Coach/Profile sheets — see
   * `FLOORS.untestedFiles`. 407 for Kaizen peels (Active list/dock/sheets,
   * Victory strips, CoachChat peels) that landed without a floor bump. 390 once
   * ten logic modules got colocated tests here and `master` repaid three more
   * independently — see `FLOORS.untestedFiles` for why the number had drifted to
   * 415 unnoticed, and why 390 is measured against `.594` rather than carried
   * over from an earlier revision of this branch. 391 for `.598`'s
   * `useStartCoachSession` — a wiring-only hook whose decision lives in the
   * unit-tested `resolveCoachSessionStart`; see `FLOORS.untestedFiles`. 394 for
   * `.606`'s Account/You split — four Playwright-covered surfaces; the logic
   * behind them is unit-tested and therefore absent from this count.
   */
  untestedFiles: 394,
  /**
   * Held at its original value on purpose — see the note at `FLOORS.linePct`.
   * Reaching a previously-unloaded file *lowers* this, because its unexecuted
   * branches join the denominator, so ratcheting it would penalise the change the
   * other two floors reward. This one is a collapse guard, not a high-water mark.
   */
  linePct: 91.5,
  funcPct: 68.8,
};

function declaredFloors(): Record<string, number> {
  const src = read(SCRIPT);
  const start = src.indexOf('const FLOORS = {');
  assert.notEqual(start, -1, 'coverage.mjs no longer declares FLOORS');
  const block = src.slice(start, src.indexOf('};', start));
  const out: Record<string, number> = {};
  for (const m of block.matchAll(/^\s*(\w+):\s*([\d.]+),/gm)) out[m[1]] = Number(m[2]);
  return out;
}

test('every floor still exists', () => {
  assert.deepEqual(
    Object.keys(declaredFloors()).sort(),
    Object.keys(HIGH_WATER).sort(),
    'a floor was dropped from FLOORS — deleting the threshold is the quietest way to pass it'
  );
});

test('the floors only ever move in the improving direction', () => {
  const declared = declaredFloors();

  assert.ok(
    declared.untestedFiles <= HIGH_WATER.untestedFiles,
    `untestedFiles floor raised to ${declared.untestedFiles} (high-water ${HIGH_WATER.untestedFiles}). ` +
      'Raising it admits a new source file that no test loads. If that is genuinely right — a ' +
      'Playwright-covered component, say — raise HIGH_WATER here in the same commit so a reviewer sees it.'
  );

  for (const key of ['linePct', 'funcPct'] as const) {
    assert.ok(
      declared[key] >= HIGH_WATER[key],
      `${key} floor lowered to ${declared[key]} (high-water ${HIGH_WATER[key]}). ` +
        'A coverage floor that follows the code down is a record of how far it fell.'
    );
  }
});

/**
 * `.200`, `.213`, `.219` — three times now, the same defect: a check that exists,
 * is documented, and runs nowhere. `security-audit` lived only in a
 * billing-blocked workflow; the a11y suite ran in no lane at all while `ci.yml`'s
 * comment claimed otherwise. Both halves are asserted, because being in the local
 * gate and being in CI are different guarantees and only one of them survives a
 * human forgetting.
 */
test('the coverage check runs in the gate and in CI', () => {
  assert.match(
    read('scripts/gate.mjs'),
    /\[\s*'run',\s*'coverage'\s*\]/,
    'coverage must run in `npm run gate` — a floor nobody evaluates is not a floor'
  );
  assert.match(
    read('.github/workflows/ci.yml'),
    /npm run coverage/,
    'coverage must run in ci.yml too. `.200` and `.219` were both checks that existed and executed ' +
      'nowhere, and `.213` found the gate and CI had silently diverged.'
  );
});

/**
 * The helper filter is load-bearing.
 *
 * `tsx` transforms through esbuild, whose CJS interop banner (`__name`, `__export`,
 * `__copyProps`, …) lcov reports as functions — and they are always called, so they
 * only ever inflate. On `fuelStreak.ts` they are 6 of 10 reported functions: 80%
 * where the real answer is 50%.
 *
 * Deleting this filter would raise function coverage across the board without a
 * line of test being written, and the floor would sail over its own ratchet. That
 * is `.212`'s shape — a guard keyed to an artifact of the tooling rather than to
 * the thing it claims to measure.
 */
test('function coverage still excludes the transform’s own helpers', () => {
  const src = read(SCRIPT);
  const block = src.slice(src.indexOf('const ESBUILD_HELPERS'), src.indexOf('const IS_TEST'));
  for (const helper of ['__name', '__export', '__copyProps', '__toCommonJS']) {
    assert.ok(
      block.includes(`'${helper}'`),
      `${helper} dropped out of the esbuild helper list — function coverage would count the ` +
        'transform instead of the code, and every file would appear to improve at once'
    );
  }
  assert.match(
    src,
    /anonymous_\\d\+/,
    'the anonymous_N filter is gone; esbuild emits one per module and they are always hit'
  );
});

/**
 * And the measurement must keep looking at the whole tree. Narrowing the walk is
 * the other way to make the number go up without writing a test — it is exactly
 * what the old report did by accident, and `packages/mw-core` is the part most
 * easily lost: it is excluded from `tsconfig.json`, from `npm run lint`, and from
 * `npm test`'s own glob, so nothing else in this repo would notice its absence.
 */
test('the walk still covers src and the shared core', () => {
  const src = read(SCRIPT);
  assert.match(src, /walk\('src'\)/, 'coverage.mjs no longer enumerates src/');
  assert.match(
    src,
    /walk\('packages\/mw-core\/src'\)/,
    'coverage.mjs no longer enumerates packages/mw-core — the one place a dropped file is invisible ' +
      'to typecheck, lint and the test glob alike'
  );
});
