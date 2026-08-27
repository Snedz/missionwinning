/**
 * F-004 — six-pillar chrome stays demoted until first workout.
 *
 * Pillars left the rail so the house can name LOG / WEEK / CATALOG.
 * The gate now lives on More only. Pure helpers default `hasFirstWorkout`
 * to **true** so inventory guards see the full map — omitting the arg
 * at the More mount re-opens the options wall for I-Day.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { RAIL_GROUPS, railGroupsForNav } from '@/lib/navConfig';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const PILLAR_HREFS = ['/nutrition', '/move', '/mind', '/track', '/learn'] as const;

test('rail never lists pillars — F-004 is a More gate now', () => {
  const declared = RAIL_GROUPS.flatMap((g) => g.hrefs);
  for (const href of PILLAR_HREFS) {
    assert.ok(!declared.includes(href), `${href} must stay off the rail table`);
  }
  for (const live of [false, true]) {
    const hrefs = railGroupsForNav({ hasFirstWorkout: live }).flatMap((g) =>
      g.items.map((i) => i.href)
    );
    for (const href of PILLAR_HREFS) {
      assert.ok(!hrefs.includes(href), `${href} leaked onto the rail`);
    }
  }
});

test('MoreSheet gate signal is workout history length (same as basic.workout)', () => {
  const src = read('src/components/layout/MoreSheet.tsx');
  assert.match(src, /hasFirstWorkout/);
  assert.match(src, /workoutHistory\.length/);
});

test('I-Day finish uses idayFinishPath and never auto-starts a session', () => {
  const src = read('src/page-components/WelcomePage.tsx');
  const finish = src.slice(src.indexOf('const finish ='), src.indexOf('const handleBegin'));
  assert.match(
    finish,
    /idayFinishPath\(/,
    'the set-table logger / F-004: destination is one function — Today after flip, Train while gated'
  );
  assert.doesNotMatch(
    finish,
    /startWorkout\(/,
    'finish must not dump into Active with a side-effect session'
  );
});
