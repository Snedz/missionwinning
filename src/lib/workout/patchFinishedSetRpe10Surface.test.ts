/**
 * Optional 1–10 RPE on a finished session lives on History edit.
 * Today stays one Start. Set-kind / remove-lift / add-lift /
 * replace / reorder / remove-set stay. No rainbow RPE.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

const BANNED =
  /UnlockButton|isPremium|\/bundle|discord\.com|WeChat|four-scene|Force Sync|Session Expired/i;
const FEED = /likes|Top 8|Feed permalink|shame slope/i;
const RPE = /decidePatchFinishedSetRpe10|session-history-set-rpe/;
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
const RAINBOW =
  /bg-red(?:-\d+)?|bg-orange|bg-yellow|bg-green|bg-lime|bg-emerald|from-red|to-green|to-red|rpe-color|rainbow/i;

describe('patch finished set rpe10 surface lock (.1040)', () => {
  it('HistorySessionEdit mounts session-history-set-rpe / decidePatchFinishedSetRpe10', () => {
    const fields = read('src/components/history/HistorySessionEdit.tsx');
    assert.match(fields, /decidePatchFinishedSetRpe10/);
    assert.match(fields, /session-history-set-rpe-/);
    assert.match(fields, /SetRpe10Select/);
    assert.match(fields, /min-h-\[44px\]/);
    assert.doesNotMatch(fields, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(fields, BANNED);
    assert.doesNotMatch(fields, FEED);
    assert.doesNotMatch(fields, /decideThisDeviceResume|protectLiveStart|startWorkout/);
    assert.match(fields, /session-history-edit-save|onSaveRequest/);
    assert.match(fields, /removeDraftSet/);
    assert.match(fields, /historyRemoveSet/);
    const helper = read('src/lib/workout/patchFinishedSetRpe10.ts');
    assert.match(helper, /decidePatchFinishedSetRpe10/);
    assert.match(helper, /parseOptionalRpe10/);
    assert.doesNotMatch(helper, /from ['"]@\/store\/workoutStore['"]/);
    const select = read('src/components/workout/SetRpe10Select.tsx');
    assert.match(select, /min-h-\[44px\]/);
    assert.match(select, /border-border/);
    assert.match(select, /bg-background/);
  });

  it('no rainbow / hex RPE color identity — paper/ink tokens only', () => {
    for (const rel of [
      'src/lib/workout/patchFinishedSetRpe10.ts',
      'src/components/history/HistorySessionEdit.tsx',
      'src/components/workout/SetRpe10Select.tsx',
    ]) {
      const src = stripComments(read(rel));
      assert.doesNotMatch(src, RAINBOW, rel);
      assert.doesNotMatch(src, /#[0-9a-fA-F]{3,8}\b/, rel);
    }
  });

  it('Today stays one Start; lean and /private do not import this', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, RPE);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, RPE);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, RPE);
  });

  it('set-kind testids stay; remove-lift / add-lift / replace / reorder stay', () => {
    const edit = read('src/components/history/HistorySessionEdit.tsx');
    assert.match(edit, KIND);
    assert.match(edit, /session-history-set-kind-/);
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

  it('first set stays ungated — rpe10 never mounts a login wall', () => {
    for (const rel of [
      'src/lib/workout/patchFinishedSetRpe10.ts',
      'src/components/history/HistorySessionEdit.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
  });

  it('.1040 line in firstSetUngated', () => {
    const src = read('src/lib/firstSetUngated.ts');
    assert.match(src, /`\.1040` — RPE on a finished History set/);
  });
});
