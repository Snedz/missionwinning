/**
 * Reorder lifts on a finished session lives on History edit.
 * Today stays one Start. Live Train reorder stays `.998`.
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
const REORDER =
  /decideReorderFinishedExercises|session-history-reorder-up|session-history-reorder-down/;

describe('reorder finished exercises surface lock (.1034)', () => {
  it('History edit mounts Up / Down and the reorder helper', () => {
    const fields = read('src/components/history/HistorySessionEdit.tsx');
    assert.match(fields, /decideReorderFinishedExercises/);
    assert.match(fields, /session-history-reorder-up/);
    assert.match(fields, /session-history-reorder-down/);
    assert.match(fields, /historyReorderUp|Move up/);
    assert.match(fields, /historyReorderDown|Move down/);
    assert.match(fields, /min-h-\[44px\]/);
    assert.match(fields, /variant="outline"/);
    assert.doesNotMatch(fields, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(fields, BANNED);
    assert.doesNotMatch(fields, FEED);
    assert.doesNotMatch(fields, /decideThisDeviceResume|protectLiveStart|startWorkout/);
    assert.match(fields, /decideEditSave|session-history-edit-save|onSaveRequest/);
    const helper = read('src/lib/workout/reorderFinishedExercises.ts');
    assert.match(helper, /decideReorderFinishedExercises/);
    assert.doesNotMatch(helper, /from ['"]@\/store\/workoutStore['"]/);
  });

  it('Today stays one Start; lean and /private do not import this', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, REORDER);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, REORDER);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, REORDER);
  });

  it('live sessionReorder still exists; Copy / Move / Repeat stay on History', () => {
    const live = read('src/lib/workout/sessionReorder.ts');
    assert.match(live, /reorderSessionExercises/);
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /HistorySessionCopy|decideCopySessionDay/);
    assert.match(page, /HistorySessionMove|decideMoveSessionDay/);
    assert.match(page, /historyRepeatSession|decideRepeatThisSession/);
    assert.match(page, /decideEditSave/);
    assert.match(page, /HistorySessionEdit/);
  });

  it('first set stays ungated — reorder never mounts a login wall', () => {
    for (const rel of [
      'src/lib/workout/reorderFinishedExercises.ts',
      'src/components/history/HistorySessionEdit.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
  });

  it('.1034 line in firstSetUngated', () => {
    const src = read('src/lib/firstSetUngated.ts');
    assert.match(src, /`\.1034` — reorder lifts on a finished History session/);
  });
});
