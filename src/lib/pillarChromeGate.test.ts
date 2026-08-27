/**
 * F-004 — six-pillar chrome stays demoted until first workout.
 *
 * The left room rail is Today · Train · Coach · History · Library. Pillars
 * are not rail rooms. MoreSheet still hides Move · Mind · Track · Learn
 * until `workoutHistory.length > 0`.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { railGroupsForNav } from '@/lib/navConfig';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const PILLAR_HREFS = ['/nutrition', '/move', '/mind', '/track', '/learn'] as const;

test('room rail never carries Pillars', () => {
  for (const opts of [{ hasFirstWorkout: false }, { hasFirstWorkout: true }, undefined]) {
    const hrefs = railGroupsForNav(opts).flatMap((g) => g.items.map((i) => i.href));
    for (const href of PILLAR_HREFS) {
      assert.ok(!hrefs.includes(href), `${href} is More, not a rail room`);
    }
    assert.ok(!hrefs.includes('/server'), 'Messenger is never a rail href');
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
