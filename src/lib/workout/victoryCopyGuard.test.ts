import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', '..');

/** Default English on Victory must stay plain — not coach-bro / AI slop. */
const BANNED =
  /\b(unlock your|elevate|crush it|beast mode|journey to|transform your|supercharge|game.?changer)\b/i;

test('Victory sheet defaults avoid AI-slop phrases', () => {
  const sheet = readFileSync(
    join(root, 'src/components/workout/WorkoutVictorySheet.tsx'),
    'utf8'
  );
  assert.doesNotMatch(sheet, BANNED);
  assert.match(sheet, /Session locked/);
});

test('empty-finish copy is calm guidance', () => {
  const finish = readFileSync(join(root, 'src/lib/workout/activeSessionFinish.ts'), 'utf8');
  assert.match(finish, /Log a set first/);
  assert.doesNotMatch(finish, /variant: 'destructive'/);
  assert.match(finish, /finishBlockedReason/);
});

test('Victory collapses long details; Active gates empty finish', () => {
  const sheet = readFileSync(
    join(root, 'src/components/workout/WorkoutVictorySheet.tsx'),
    'utf8'
  );
  assert.match(sheet, /shouldCollapseVictoryDetails/);
  assert.match(sheet, /victorySessionDetails|Session details/);

  const active = readFileSync(
    join(root, 'src/page-components/ActiveWorkoutPage.tsx'),
    'utf8'
  );
  assert.match(active, /finishBlockedReason/);

  const store = readFileSync(join(root, 'src/store/workoutStore.ts'), 'utf8');
  assert.match(store, /empty Finish is a no-op/);
});
