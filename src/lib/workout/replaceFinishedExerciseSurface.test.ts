/**
 * Replace a lift on a finished session lives on History edit.
 * Today stays one Start. Reorder / duration / copy / move stay.
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
const REPLACE =
  /decideReplaceFinishedExercise|session-history-replace/;
const REORDER =
  /decideReorderFinishedExercises|session-history-reorder-up|session-history-reorder-down/;
const DURATION =
  /decideEditSessionDuration|HistorySessionDuration|session-history-duration|editSessionDuration/;
const COPY = /HistorySessionCopy|decideCopySessionDay|copyFinishedHistoryLog/;
const MOVE = /HistorySessionMove|decideMoveSessionDay|moveFinishedHistoryLog/;

describe('replace finished exercise surface lock (.1036)', () => {
  it('History edit mounts ExercisePicker / decideReplaceFinishedExercise / session-history-replace', () => {
    const fields = read('src/components/history/HistorySessionEdit.tsx');
    assert.match(fields, /ExercisePicker/);
    assert.match(fields, /from '@\/components\/library\/ExercisePicker'/);
    assert.match(fields, /decideReplaceFinishedExercise/);
    assert.match(fields, /session-history-replace-/);
    assert.match(fields, /historyReplaceLift|Replace lift/);
    assert.match(fields, /min-h-\[44px\]/);
    assert.match(fields, /variant="outline"/);
    assert.doesNotMatch(fields, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(fields, BANNED);
    assert.doesNotMatch(fields, FEED);
    assert.doesNotMatch(fields, /decideThisDeviceResume|protectLiveStart|startWorkout/);
    assert.match(fields, /session-history-edit-save|onSaveRequest/);
    assert.doesNotMatch(fields, /data-testid="session-history-replace-save"/);
    const helper = read('src/lib/workout/replaceFinishedExercise.ts');
    assert.match(helper, /decideReplaceFinishedExercise/);
    assert.doesNotMatch(helper, /from ['"]@\/store\/workoutStore['"]/);
    const backfill = read('src/components/history/HistoryBackfill.tsx');
    assert.match(backfill, /ExercisePicker/);
  });

  it('Today stays one Start; lean and /private do not import this', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, REPLACE);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, REPLACE);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, REPLACE);
  });

  it('reorder testids stay; duration / copy / move stay on HistoryPage', () => {
    const edit = read('src/components/history/HistorySessionEdit.tsx');
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

  it('first set stays ungated — replace never mounts a login wall', () => {
    for (const rel of [
      'src/lib/workout/replaceFinishedExercise.ts',
      'src/components/history/HistorySessionEdit.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
  });

  it('.1036 line in firstSetUngated', () => {
    const src = read('src/lib/firstSetUngated.ts');
    assert.match(src, /`\.1036` — replace a lift on a finished History session/);
  });
});
