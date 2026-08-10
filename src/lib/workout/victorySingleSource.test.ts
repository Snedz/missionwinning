/**
 * Victory next-action has one home: packages/mw-core.
 * Web re-exports it — this guard fails if a second private copy creeps back.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pickVictoryNextAction as pickWeb } from './workoutVictory.ts';
import { pickVictoryNextAction as pickCore } from '../../../packages/mw-core/src/workout/victory.ts';

const root = join(import.meta.dirname, '..', '..', '..');

test('web workoutVictory re-exports mw-core pickVictoryNextAction', () => {
  const src = readFileSync(join(root, 'src/lib/workout/workoutVictory.ts'), 'utf8');
  assert.match(src, /packages\/mw-core\/src\/workout\/victory/);
  assert.match(src, /pickVictoryNextActionCore/);
  // No second private decision tree in the web file.
  assert.doesNotMatch(src, /COACH_VICTORY_EARLY_WORKOUTS\s*=\s*3/);
});

test('web and core agree on week-1 session 2 and early coach', () => {
  const s2 = { completedWorkouts: 1 as const, hasCoachPlan: true as const };
  assert.equal(pickWeb(s2).href, pickCore(s2).href);
  assert.equal(pickWeb(s2).labelKey, 'week1SecondSessionCta');
  assert.equal(pickWeb(s2).href, '/active');

  const early = { completedWorkouts: 2 as const, hasCoachPlan: false as const };
  assert.equal(pickWeb(early).href, '/coach');
  assert.equal(pickCore(early).href, '/coach');
});
