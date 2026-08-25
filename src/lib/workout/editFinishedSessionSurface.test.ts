/**
 * Edit a finished session lives on History detail. Not Today. Not Resume.
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
const EDIT = /editFinishedSession|session-history-edit/;

describe('edit finished session surface lock (.997)', () => {
  it('History detail mounts Edit / Save and the confirm door', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /decideEditSave/);
    assert.match(page, /saveEditedHistoryLog/);
    assert.match(page, /HistorySessionEdit/);
    assert.doesNotMatch(page, BANNED);
    assert.doesNotMatch(page, FEED);
    const fields = read('src/components/history/HistorySessionEdit.tsx');
    assert.match(fields, /data-testid="session-history-edit"/);
    assert.match(fields, /data-testid="session-history-edit-save"/);
    assert.match(fields, /data-testid="session-history-edit-confirm"/);
    assert.match(fields, /min-h-\[44px\]/);
    assert.doesNotMatch(fields, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(fields, BANNED);
    assert.doesNotMatch(fields, /decideThisDeviceResume|protectLiveStart|startWorkout/);
  });

  it('Today stays one Start; lean and /private do not import edit', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, EDIT);
    assert.doesNotMatch(lean, /ExercisePinnedNoteField|ExerciseNoteField|exercise-pin/);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, EDIT);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, EDIT);
    assert.doesNotMatch(priv, /ExercisePinnedNoteField|exercise-pin/);
  });

  it('movement-history sheet and receipt stay read-only', () => {
    for (const rel of [
      'src/components/workout/MovementHistorySheet.tsx',
      'src/lib/workout/movementHistory.ts',
      'src/components/workout/WorkoutVictorySheet.tsx',
    ]) {
      assert.doesNotMatch(read(rel), EDIT, `${rel} leaked History edit`);
    }
  });

  it('first set stays ungated — edit never mounts a login wall', () => {
    for (const rel of [
      'src/lib/workout/editFinishedSession.ts',
      'src/components/history/HistorySessionEdit.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
  });

  it('.996 note chrome stayed off Today', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.doesNotMatch(lean, /ExerciseNoteField|ExercisePinnedNoteField|exercise-pin|readPinnedNote/);
  });
});
