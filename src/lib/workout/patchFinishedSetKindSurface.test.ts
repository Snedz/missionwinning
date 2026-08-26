/**
 * Set kind on a finished session lives on History edit.
 * Today stays one Start. Remove-lift / add-lift / replace /
 * reorder / remove-set stay.
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
const KIND = /decidePatchFinishedSetKind|session-history-set-kind/;
const REMOVE =
  /decideRemoveFinishedExercise|session-history-remove-lift/;
const APPEND =
  /decideAppendFinishedExercise|session-history-add-lift/;
const REPLACE =
  /decideReplaceFinishedExercise|session-history-replace/;
const REORDER =
  /decideReorderFinishedExercises|session-history-reorder-up|session-history-reorder-down/;
const COPY = /HistorySessionCopy|decideCopySessionDay|copyFinishedHistoryLog/;
const MOVE = /HistorySessionMove|decideMoveSessionDay|moveFinishedHistoryLog/;

describe('patch finished set kind surface lock (.1039)', () => {
  it('HistorySessionEdit mounts session-history-set-kind / decidePatchFinishedSetKind', () => {
    const fields = read('src/components/history/HistorySessionEdit.tsx');
    assert.match(fields, /decidePatchFinishedSetKind/);
    assert.match(fields, /session-history-set-kind-/);
    assert.match(fields, /cycleFinishedSetKind/);
    assert.match(fields, /setKindLabelKey/);
    assert.match(fields, /min-h-\[44px\]/);
    assert.match(fields, /variant="outline"/);
    assert.doesNotMatch(fields, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(fields, BANNED);
    assert.doesNotMatch(fields, FEED);
    assert.doesNotMatch(fields, /decideThisDeviceResume|protectLiveStart|startWorkout/);
    assert.match(fields, /session-history-edit-save|onSaveRequest/);
    assert.match(fields, /removeDraftSet/);
    assert.match(fields, /historyRemoveSet/);
    const helper = read('src/lib/workout/patchFinishedSetKind.ts');
    assert.match(helper, /decidePatchFinishedSetKind/);
    assert.doesNotMatch(helper, /from ['"]@\/store\/workoutStore['"]/);
  });

  it('Today stays one Start; lean and /private do not import this', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, KIND);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, KIND);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, KIND);
  });

  it('remove-lift / add-lift / replace / reorder stay; copy / move stay on HistoryPage', () => {
    const edit = read('src/components/history/HistorySessionEdit.tsx');
    assert.match(edit, REMOVE);
    assert.match(edit, /session-history-remove-lift/);
    assert.match(edit, APPEND);
    assert.match(edit, /session-history-add-lift/);
    assert.match(edit, REPLACE);
    assert.match(edit, /session-history-replace-/);
    assert.match(edit, REORDER);
    assert.match(edit, /session-history-reorder-up/);
    assert.match(edit, /session-history-reorder-down/);
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, COPY);
    assert.match(page, MOVE);
    assert.match(page, /HistorySessionEdit/);
    assert.match(page, /decideEditSave/);
  });

  it('first set stays ungated — kind never mounts a login wall', () => {
    for (const rel of [
      'src/lib/workout/patchFinishedSetKind.ts',
      'src/components/history/HistorySessionEdit.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
  });

  it('.1039 line in firstSetUngated', () => {
    const src = read('src/lib/firstSetUngated.ts');
    assert.match(src, /`\.1039` — set kind on a finished History set/);
  });
});
