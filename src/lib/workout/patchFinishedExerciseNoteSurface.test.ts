/**
 * Optional lift note on a finished session lives on History edit.
 * Today stays one Start. Load % / tempo / L/R / RIR / RPE /
 * set-kind / remove-lift / add-lift / replace / reorder stay.
 * Not a pin. Not sessionNote. No LLM.
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
const LIFT_NOTE = /decidePatchFinishedExerciseNote|session-history-lift-note/;
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

describe('patch finished exercise note surface lock (.1045)', () => {
  it('HistorySessionEdit mounts session-history-lift-note / decidePatchFinishedExerciseNote', () => {
    const fields = read('src/components/history/HistorySessionEdit.tsx');
    assert.match(fields, /decidePatchFinishedExerciseNote/);
    assert.match(fields, /session-history-lift-note-/);
    assert.match(fields, /<textarea/);
    assert.match(fields, /min-h-\[44px\]/);
    assert.match(fields, /italic/);
    assert.doesNotMatch(fields, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(fields, BANNED);
    assert.doesNotMatch(fields, FEED);
    assert.doesNotMatch(fields, /decideThisDeviceResume|protectLiveStart|startWorkout/);
    assert.doesNotMatch(fields, /lastNotesFor|cueMemory/);
    assert.match(fields, /session-history-edit-save|onSaveRequest/);
    const helper = read('src/lib/workout/patchFinishedExerciseNote.ts');
    assert.match(helper, /decidePatchFinishedExerciseNote/);
    assert.match(helper, /normalizeExerciseNote/);
    assert.doesNotMatch(helper, /patchDraftSet/);
    assert.doesNotMatch(helper, /lastNotesFor|cueMemory/);
    assert.doesNotMatch(helper, /from ['"]@\/store\/workoutStore['"]/);
    assert.doesNotMatch(helper, /from ['"]@\/lib\/llm/);
  });

  it('Today stays one Start; lean and /private do not import this', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, LIFT_NOTE);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, LIFT_NOTE);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, LIFT_NOTE);
  });

  it('load-pct / tempo / L/R / RIR / RPE testids stay; set-kind / remove-lift / add-lift / replace / reorder stay', () => {
    const edit = read('src/components/history/HistorySessionEdit.tsx');
    assert.match(edit, LOAD_PCT);
    assert.match(edit, /session-history-set-load-pct-/);
    assert.match(edit, /SetLoadPctField/);
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

  it('no rainbow / hex lift-note color identity — paper/ink tokens only', () => {
    for (const rel of [
      'src/lib/workout/patchFinishedExerciseNote.ts',
      'src/components/history/HistorySessionEdit.tsx',
    ]) {
      const src = stripComments(read(rel));
      assert.doesNotMatch(src, RAINBOW, rel);
      assert.doesNotMatch(src, /#[0-9a-fA-F]{3,8}\b/, rel);
    }
  });

  it('first set stays ungated — lift note never mounts a login wall', () => {
    for (const rel of [
      'src/lib/workout/patchFinishedExerciseNote.ts',
      'src/components/history/HistorySessionEdit.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
  });

  it('.1045 line in firstSetUngated', () => {
    const src = read('src/lib/firstSetUngated.ts');
    assert.match(src, /`\.1045` — lift note on a finished History exercise/);
  });
});
