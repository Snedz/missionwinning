/**
 * Optional L / R / Alt on a finished session lives on History edit.
 * Today stays one Start. RIR / RPE / set-kind / remove-lift / add-lift /
 * replace / reorder / remove-set stay. Control only when
 * shouldOfferSetSide. Squat rows do not get the testid.
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

describe('patch finished set side surface lock (.1042)', () => {
  it('HistorySessionEdit mounts session-history-set-side / decidePatchFinishedSetSide / SetSideSelect', () => {
    const fields = read('src/components/history/HistorySessionEdit.tsx');
    assert.match(fields, /decidePatchFinishedSetSide/);
    assert.match(fields, /session-history-set-side-/);
    assert.match(fields, /SetSideSelect/);
    assert.match(fields, /shouldOfferSetSide/);
    assert.match(fields, /min-h-\[44px\]/);
    assert.doesNotMatch(fields, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(fields, BANNED);
    assert.doesNotMatch(fields, FEED);
    assert.doesNotMatch(fields, /decideThisDeviceResume|protectLiveStart|startWorkout/);
    assert.match(fields, /session-history-edit-save|onSaveRequest/);
    assert.match(fields, /removeDraftSet/);
    assert.match(fields, /historyRemoveSet/);
    const helper = read('src/lib/workout/patchFinishedSetSide.ts');
    assert.match(helper, /decidePatchFinishedSetSide/);
    assert.match(helper, /parseSetSide/);
    assert.match(helper, /persistableSetSide/);
    assert.match(helper, /shouldOfferSetSide/);
    assert.doesNotMatch(helper, /UNILATERAL_RE/);
    assert.doesNotMatch(helper, /from ['"]@\/store\/workoutStore['"]/);
    const select = read('src/components/workout/SetSideSelect.tsx');
    assert.match(select, /min-h-\[44px\]/);
    assert.match(select, /border-border/);
    assert.match(select, /bg-background/);
    assert.match(select, /SET_SIDES/);
    assert.match(select, /activeSetSideL/);
    assert.match(select, /activeSetSideR/);
    assert.match(select, /activeSetSideAlt/);
    assert.match(select, /activeSetSideAria/);
  });

  it('control only when shouldOfferSetSide; squat rows do not get the testid', () => {
    const fields = read('src/components/history/HistorySessionEdit.tsx');
    const offer = fields.indexOf('shouldOfferSetSide');
    const select = fields.indexOf('<SetSideSelect');
    const testid = fields.indexOf('session-history-set-side-');
    assert.ok(offer !== -1, 'History edit must consult shouldOfferSetSide');
    assert.ok(select !== -1, 'History edit must mount SetSideSelect');
    assert.ok(testid !== -1, 'History edit must stamp session-history-set-side');
    assert.ok(
      fields.includes('{offerSetSide ? (') &&
        fields.includes('<SetSideSelect') &&
        fields.slice(fields.indexOf('{offerSetSide ? ('), fields.indexOf('<SetSideSelect')).includes('offerSetSide'),
      'SetSideSelect must sit behind offerSetSide so squat rows never get the testid'
    );
    assert.doesNotMatch(fields, /shouldOfferSetSide\(\{\s*id:\s*['"]squat/);
    const live = read('src/components/workout/LogConsole.tsx');
    assert.match(live, /log-console-set-side/);
    assert.match(live, /SET_SIDES/);
  });

  it('no rainbow / hex side color identity — paper/ink tokens only', () => {
    for (const rel of [
      'src/lib/workout/patchFinishedSetSide.ts',
      'src/components/history/HistorySessionEdit.tsx',
      'src/components/workout/SetSideSelect.tsx',
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
    assert.doesNotMatch(lean, SIDE);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, SIDE);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, SIDE);
  });

  it('RIR / RPE testids stay; set-kind / remove-lift / add-lift / replace / reorder stay', () => {
    const edit = read('src/components/history/HistorySessionEdit.tsx');
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

  it('first set stays ungated — side never mounts a login wall', () => {
    for (const rel of [
      'src/lib/workout/patchFinishedSetSide.ts',
      'src/components/history/HistorySessionEdit.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
  });

  it('.1042 line in firstSetUngated', () => {
    const src = read('src/lib/firstSetUngated.ts');
    assert.match(src, /`\.1042` — L\/R on a finished History set/);
  });
});
