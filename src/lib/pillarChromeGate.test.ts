/**
 * F-004 — six-pillar chrome stays demoted until first workout.
 *
 * Pure helpers default `hasFirstWorkout` to **true** so inventory guards see the
 * full map. That default is a footgun at the mount sites: omitting the arg
 * re-opens the options wall for I-Day. This guard discovers the call sites and
 * requires they pass the live signal (workout store / `basic.workout`).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { railGroupsForNav } from '@/lib/navConfig';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

test('railGroupsForNav drops Pillars when hasFirstWorkout is false', () => {
  const before = railGroupsForNav({ hasFirstWorkout: false });
  assert.ok(!before.some((g) => g.id === 'pillars'));
  assert.ok(before.some((g) => g.id === 'mission'));
  assert.ok(before.some((g) => g.id === 'toolkit'));
  const hrefs = before.flatMap((g) => g.items.map((i) => i.href));
  for (const href of ['/nutrition', '/move', '/mind', '/track', '/learn']) {
    assert.ok(!hrefs.includes(href), `${href} stays off the rail until first workout`);
  }

  const after = railGroupsForNav({ hasFirstWorkout: true });
  assert.ok(after.some((g) => g.id === 'pillars'));
});

test('Sidebar wires hasFirstWorkout into railGroupsForNav', () => {
  const src = read('src/components/layout/Sidebar.tsx');
  assert.match(src, /railGroupsForNav\(\{\s*hasFirstWorkout\s*\}\)/);
  assert.match(
    src,
    /workoutHistory\.length/,
    'gate signal must be first logged workout — do not invent a new flag'
  );
});

test('MoreSheet gate signal is workout history length (same as basic.workout)', () => {
  const src = read('src/components/layout/MoreSheet.tsx');
  assert.match(src, /hasFirstWorkout/);
  assert.match(src, /workoutHistory\.length/);
});
