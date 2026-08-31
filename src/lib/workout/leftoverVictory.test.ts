/**
 * Victory is a receipt, not a tour — title + stats + one next.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

test('Victory first paint is title + stats + one next', () => {
  const src = stripComments(read('src/components/workout/WorkoutVictorySheet.tsx'));
  const jsx = src.slice(src.indexOf('return ('));
  assert.match(src, /Session locked/);
  assert.match(jsx, /<VictoryStatsStrip\b/);
  assert.match(jsx, /<VictoryNextActionStrip\b/);
  assert.match(jsx, /data-testid="victory-next-dock"/);
  assert.match(jsx, /data-testid="victory-scroll"/);
  for (const leftover of [
    'VictoryFeelStrip',
    'VictoryRewardsLine',
    'VictorySecondaryLinks',
    'VictoryReceiptStrip',
    'VictoryBodyDeltaStrip',
    'SessionDebriefCard',
    'SessionJotField',
    'HistorySessionName',
    'FieldTestReceiptStrip',
    'SaveHonoredRoutineDoor',
  ]) {
    assert.doesNotMatch(jsx, new RegExp(`<${leftover}\\b`), `${leftover} is leftover on Victory`);
  }
  assert.doesNotMatch(jsx, /data-testid="victory-show-all"/);
  assert.doesNotMatch(jsx, /data-testid="victory-start-again"/);
  assert.doesNotMatch(jsx, /data-testid="victory-save-routine"/);
  assert.doesNotMatch(jsx, /handleShare|kalligator-celebrate/);
  assert.doesNotMatch(jsx, /<details\b/);
});

test('empty Finish stays a no-op; Log set stays filled', () => {
  const finish = read('src/lib/workout/activeSessionFinish.ts');
  assert.match(finish, /finishBlockedReason/);
  assert.match(finish, /Log a set first/);
  const store = read('src/store/workoutStore.ts');
  assert.match(store, /empty Finish is a no-op/);
  const active = stripComments(read('src/page-components/ActiveWorkoutPage.tsx'));
  assert.match(active, /finishBlockedReason/);
  assert.doesNotMatch(active, /\bgenerateWeek\s*\(/);
});
