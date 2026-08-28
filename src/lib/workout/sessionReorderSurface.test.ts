/**
 * Live-session reorder lives on the Train list.
 * Today stays one Start. Honesty .971 still applies.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

const BANNED =
  /UnlockButton|isPremium|\/bundle|permalink|discord\.com|WeChat|four-scene|Force Sync|Session Expired|SignInPrompt/i;
const FEED = /likes|Top 8|Feed permalink|shame slope/i;
const REORDER = /sessionReorder|reorderSessionExercises|reorderExerciseInActive|exercise-reorder-handle/;

describe('live session reorder surface lock (.998)', () => {
  it('name row mounts a reorder handle; name tap stays history', () => {
    const handle = read('src/components/workout/ExerciseReorderHandle.tsx');
    assert.match(handle, /data-testid="exercise-reorder-handle"/);
    assert.match(handle, /min-h-\[44px\]/);
    assert.match(handle, /house-btn house-btn-ghost house-reorder/);
    assert.doesNotMatch(handle, /<Button/);
    assert.doesNotMatch(handle, /variant="ghost"/);
    assert.doesNotMatch(handle, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(handle, BANNED);
    assert.doesNotMatch(handle, FEED);
    assert.doesNotMatch(handle, /swapExerciseInPlan|savePlan|generateWeek/);

    const header = read('src/components/workout/ActiveExerciseHeader.tsx');
    assert.match(header, /ExerciseReorderHandle/);
    assert.match(header, /data-testid="movement-history-open"/);
    assert.doesNotMatch(header, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(header, BANNED);
    assert.doesNotMatch(header, FEED);
  });

  it('list still withholds later lifts until first set', () => {
    const list = read('src/components/workout/ActiveExerciseList.tsx');
    assert.match(list, /laterLiftVisible\(/);
    assert.match(list, /onReorder/);
    assert.doesNotMatch(list, /swapExerciseInPlan|savePlan|generateWeek/);
  });

  it('Today stays one Start; lean and /private do not import reorder', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, REORDER);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, REORDER);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, REORDER);
    assert.doesNotMatch(lean, /editFinishedSession|HistorySessionEdit|session-history-edit/);
    assert.doesNotMatch(priv, /editFinishedSession|HistorySessionEdit|session-history-edit/);
    const helper = read('src/lib/workout/sessionReorder.ts');
    assert.doesNotMatch(helper, /editFinishedSession|HistorySessionEdit|saveEditedHistoryLog/);
  });

  it('swap/skip and Start this again stay their own homes', () => {
    const once = read('src/lib/workout/sessionExerciseOnce.ts');
    assert.doesNotMatch(once, /reorderSessionExercises/);
    const start = read('src/lib/workout/startAgain.ts');
    assert.doesNotMatch(start, REORDER);
    const page = read('src/page-components/ActiveWorkoutPage.tsx');
    assert.match(page, /skipExerciseInActive/);
    assert.match(page, /reorderExerciseInActive/);
    assert.doesNotMatch(page, /swapExerciseInPlan/);
  });

  it('first set stays ungated — reorder never mounts a login wall', () => {
    for (const rel of [
      'src/lib/workout/sessionReorder.ts',
      'src/components/workout/ExerciseReorderHandle.tsx',
      'src/components/workout/ActiveExerciseHeader.tsx',
      'src/components/workout/ActiveExerciseList.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
  });
});
