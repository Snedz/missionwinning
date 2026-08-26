/**
 * Add a lift to a finished session lives on History edit.
 * Today stays one Start. Replace / reorder / duration / copy / move stay.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const BANNED =
  /UnlockButton|isPremium|\/bundle|discord\.com|WeChat|four-scene|Force Sync|Session Expired/i;
const FEED = /likes|Top 8|Feed permalink|shame slope/i;
const APPEND =
  /decideAppendFinishedExercise|session-history-add-lift/;
const REPLACE =
  /decideReplaceFinishedExercise|session-history-replace/;
const REORDER =
  /decideReorderFinishedExercises|session-history-reorder-up|session-history-reorder-down/;
const DURATION =
  /decideEditSessionDuration|HistorySessionDuration|session-history-duration|editSessionDuration/;
const COPY = /HistorySessionCopy|decideCopySessionDay|copyFinishedHistoryLog/;
const MOVE = /HistorySessionMove|decideMoveSessionDay|moveFinishedHistoryLog/;

describe('append finished exercise surface lock (.1037)', () => {
  it('HistorySessionEdit mounts session-history-add-lift / decideAppendFinishedExercise / ExercisePicker', () => {
    const fields = read('src/components/history/HistorySessionEdit.tsx');
    assert.match(fields, /ExercisePicker/);
    assert.match(fields, /from '@\/components\/library\/ExercisePicker'/);
    assert.match(fields, /decideAppendFinishedExercise/);
    assert.match(fields, /session-history-add-lift/);
    assert.match(fields, /historyAddLift|Add a lift/);
    assert.doesNotMatch(fields, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(fields, BANNED);
    assert.doesNotMatch(fields, FEED);
    assert.doesNotMatch(fields, /decideThisDeviceResume|protectLiveStart|startWorkout/);
    assert.match(fields, /session-history-edit-save|onSaveRequest/);
    assert.doesNotMatch(fields, /data-testid="session-history-add-lift-save"/);
    const helper = read('src/lib/workout/appendFinishedExercise.ts');
    assert.match(helper, /decideAppendFinishedExercise/);
    assert.doesNotMatch(helper, /from ['"]@\/store\/workoutStore['"]/);
    const backfill = read('src/components/history/HistoryBackfill.tsx');
    assert.match(backfill, /ExercisePicker/);
  });

  it('Today stays one Start; lean and /private do not import this', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, APPEND);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, APPEND);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, APPEND);
  });

  it('replace / reorder testids stay; copy / move stay on HistoryPage', () => {
    const edit = read('src/components/history/HistorySessionEdit.tsx');
    assert.match(edit, REPLACE);
    assert.match(edit, /session-history-replace-/);
    assert.match(edit, REORDER);
    assert.match(edit, /session-history-reorder-up/);
    assert.match(edit, /session-history-reorder-down/);
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, DURATION);
    assert.match(page, COPY);
    assert.match(page, MOVE);
    assert.match(page, /HistorySessionEdit/);
    assert.match(page, /decideEditSave/);
  });

  it('first set stays ungated — append never mounts a login wall', () => {
    for (const rel of [
      'src/lib/workout/appendFinishedExercise.ts',
      'src/components/history/HistorySessionEdit.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
  });

  it('.1037 line in firstSetUngated', () => {
    const src = read('src/lib/firstSetUngated.ts');
    assert.match(src, /`\.1037` — add a lift to this finished History session/);
  });
});
