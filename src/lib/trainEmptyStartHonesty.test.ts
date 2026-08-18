/**
 * Train empty Start is Start Workout.
 *
 * Pack `activeStartWorkout` is Start Workout. The empty dock defaulted
 * Start workout. First paint listed it after the Today Coach pin.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { activeWorkoutStringsFor } from '@/i18n/activeWorkoutLocales';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const EMPTY = 'src/components/workout/ActiveEmptyState.tsx';

test('activeStartWorkout pack is Start Workout', () => {
  assert.equal(activeWorkoutStringsFor('en').activeStartWorkout, 'Start Workout');
});

test('empty Train dock default matches the pack', () => {
  const src = read(EMPTY);
  const en = activeWorkoutStringsFor('en').activeStartWorkout;
  const m = /t\('activeStartWorkout',\s*\{\s*defaultValue:\s*(['"])(.*?)\1\s*\}\)/.exec(src);
  assert.ok(m, 'activeStartWorkout must carry a literal defaultValue');
  assert.equal(m[2], en);
});
