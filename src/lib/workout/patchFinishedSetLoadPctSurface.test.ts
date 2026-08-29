/**
 * Optional load % on a finished session lives on History edit.
 * Today stays one Start. Tempo / L/R / RIR / RPE / set-kind /
 * remove-lift / add-lift / replace / reorder / remove-set stay.
 * Weight rows only. No Epley. No knownMax.
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
const LOAD_PCT = /decidePatchFinishedSetLoadPct|session-history-set-load-pct/;
const TEMPO = /decidePatchFinishedSetTempo|session-history-set-tempo/;
const SIDE = /decidePatchFinishedSetSide|session-history-set-side/;
const RIR = /decidePatchFinishedSetRir|session-history-set-rir/;
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

describe('patch finished set load pct surface lock (.1044)', () => {
  it('HistorySessionEdit mounts session-history-set-load-pct / decidePatchFinishedSetLoadPct / SetLoadPctField', () => {
    const fields = read('src/components/history/HistorySessionEdit.tsx');
    assert.match(fields, /decidePatchFinishedSetLoadPct/);
    assert.match(fields, /session-history-set-load-pct-/);
    assert.match(fields, /SetLoadPctField/);
    assert.match(fields, /rowType === ['"]weight['"]/);
    assert.match(fields, /min-h-\[44px\]/);
    assert.doesNotMatch(fields, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(fields, BANNED);
    assert.doesNotMatch(fields, FEED);
    assert.doesNotMatch(fields, /decideThisDeviceResume|protectLiveStart|startWorkout/);
    assert.doesNotMatch(fields, /weightFromKnownMaxPct|loadPctOfKnownMax|knownMaxFromHistory/);
    assert.match(fields, /session-history-edit-save|onSaveRequest/);
    assert.match(fields, /removeDraftSet/);
    assert.match(fields, /historyRemoveSet/);
    const helper = read('src/lib/workout/patchFinishedSetLoadPct.ts');
    assert.match(helper, /decidePatchFinishedSetLoadPct/);
    assert.match(helper, /parseOptionalLoadPct/);
    assert.doesNotMatch(helper, /weightFromKnownMaxPct|loadPctOfKnownMax|knownMaxFromHistory/);
    assert.doesNotMatch(helper, /epley/i);
    assert.doesNotMatch(helper, /from ['"]@\/store\/workoutStore['"]/);
    const field = read('src/components/workout/SetLoadPctField.tsx');
    assert.match(field, /min-h-\[44px\]/);
    assert.match(field, /house-num/);
    assert.doesNotMatch(field, /border-2/);
    assert.doesNotMatch(field, /focus:ring-2/);
    assert.match(field, /parseOptionalLoadPct/);
    assert.match(field, /activeSetPct/);
    assert.match(field, /activeSetPctAria/);
    assert.doesNotMatch(field, /loadPctOfKnownMax|weightFromKnownMaxPct|knownMaxFromHistory/);
    assert.doesNotMatch(stripComments(field), /primary-action|bg-primary-fill|accent-poster/);
  });

  it('weight rows only — duration / BW / assisted do not mount the field', () => {
    const fields = stripComments(read('src/components/history/HistorySessionEdit.tsx'));
    assert.match(fields, /rowType === ['"]weight['"]/);
    assert.match(fields, /SetLoadPctField/);
    const weightGate = fields.match(
      /rowType === ['"]weight['"][\s\S]{0,400}SetLoadPctField/
    );
    assert.ok(weightGate, 'SetLoadPctField must sit behind resolveSetRowType === weight');
  });

  it('no rainbow / hex load-pct color identity — paper/ink tokens only', () => {
    for (const rel of [
      'src/lib/workout/patchFinishedSetLoadPct.ts',
      'src/components/history/HistorySessionEdit.tsx',
      'src/components/workout/SetLoadPctField.tsx',
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
    assert.doesNotMatch(lean, LOAD_PCT);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, LOAD_PCT);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, LOAD_PCT);
  });

  it('tempo / L/R / RIR / RPE testids stay; set-kind / remove-lift / add-lift / replace / reorder stay', () => {
    const edit = read('src/components/history/HistorySessionEdit.tsx');
    assert.match(edit, TEMPO);
    assert.match(edit, /session-history-set-tempo-/);
    assert.match(edit, /SetTempoField/);
    assert.match(edit, SIDE);
    assert.match(edit, /session-history-set-side-/);
    assert.match(edit, /SetSideSelect/);
    assert.match(edit, RIR);
    assert.match(edit, /session-history-set-rir-/);
    assert.match(edit, /SetRirSelect/);
    assert.match(edit, RPE);
    assert.match(edit, /session-history-set-rpe-/);
    assert.match(edit, /SetRpe10Select/);
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

  it('first set stays ungated — load % never mounts a login wall', () => {
    for (const rel of [
      'src/lib/workout/patchFinishedSetLoadPct.ts',
      'src/components/history/HistorySessionEdit.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
  });

  it('.1044 line in firstSetUngated', () => {
    const src = read('src/lib/firstSetUngated.ts');
    assert.match(src, /`\.1044` — load % on a finished History set/);
  });
});
