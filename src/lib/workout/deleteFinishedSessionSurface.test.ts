/**
 * Delete this finished session lives on History detail.
 * Restore lives on History. Not Today. Not live cancel.
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
const DELETE =
  /decideDeleteFinishedSession|applyDeleteFinishedSession|HistorySessionDelete|session-history-delete/;
const RESTORE =
  /decideRestoreFinishedSession|applyRestoreFinishedSession|HistorySessionRestore|session-history-restore/;
const MERGE =
  /decideMergeExercises|applyMergeExercises|HistoryMergeExercises|session-history-merge/;
const BACKFILL = /decideBackfillSession|HistoryBackfill|session-history-backfill/;
const IN_SET_PR = /decideInSetPr|formatInSetPrLabels|set-table-in-set-pr|inSetPrLabels/;

describe('delete this finished session surface lock (.1003 / .1006)', () => {
  it('History detail mounts Delete and Restore; copy no longer claims unrecoverable', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /decideDeleteFinishedSession/);
    assert.match(page, /decideRestoreFinishedSession/);
    assert.match(page, /deleteFinishedHistoryLog|HistorySessionDelete/);
    assert.match(page, /restoreFinishedHistoryLog|HistorySessionRestore/);
    assert.match(page, /data-testid="session-history-restore-open"/);
    assert.match(page, /data-testid="session-history-restore-dialog"/);
    assert.match(page, /deletedHistory\.length > 0/);
    assert.match(page, /selected\.deletedAt/);
    assert.match(page, /decideEditSave/);
    assert.match(page, /decideBackfillSession/);
    assert.match(page, /decideMergeExercises/);
    assert.doesNotMatch(page, IN_SET_PR);
    assert.doesNotMatch(page, BANNED);
    assert.doesNotMatch(page, FEED);
    const fields = read('src/components/history/HistorySessionDelete.tsx');
    assert.match(fields, /data-testid="session-history-delete"/);
    assert.match(fields, /data-testid="session-history-delete-confirm"/);
    assert.doesNotMatch(fields, /cannot be recovered/i);
    assert.match(fields, /Deleted sessions/i);
    assert.match(fields, /min-h-\[44px\]/);
    assert.doesNotMatch(fields, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(fields, BANNED);
    assert.doesNotMatch(fields, /decideThisDeviceResume|protectLiveStart|startWorkout/);
    assert.doesNotMatch(fields, /cancelActiveWorkout|tombstoneFromActive/);
    const restore = read('src/components/history/HistorySessionRestore.tsx');
    assert.match(restore, /data-testid="session-history-restore"/);
    assert.match(restore, /data-testid="session-history-restore-confirm"/);
    assert.match(restore, /listDeletedSessionHistoryRows/);
    assert.match(restore, /decideRestoreFinishedSession/);
    assert.match(restore, /min-h-\[44px\]/);
    assert.doesNotMatch(restore, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(restore, BANNED);
    assert.doesNotMatch(restore, /decideThisDeviceResume|protectLiveStart|startWorkout/);
  });

  it('Today stays one Start; lean and /private do not import delete', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, DELETE);
    assert.doesNotMatch(lean, RESTORE);
    assert.doesNotMatch(lean, MERGE);
    assert.doesNotMatch(lean, BACKFILL);
    assert.doesNotMatch(lean, IN_SET_PR);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, DELETE);
    assert.doesNotMatch(primary, RESTORE);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, DELETE);
    assert.doesNotMatch(priv, RESTORE);
    assert.doesNotMatch(priv, MERGE);
    assert.doesNotMatch(priv, BACKFILL);
    assert.doesNotMatch(priv, /editFinishedSession|HistorySessionEdit|session-history-edit/);
  });

  it('Train overflow / empty Train stay backfill — delete is not a second Start', () => {
    const chrome = read('src/components/workout/ActiveSessionChrome.tsx');
    assert.doesNotMatch(chrome, DELETE);
    assert.doesNotMatch(chrome, RESTORE);
    assert.match(chrome, /sessionClockPaused/);
    const empty = read('src/components/workout/ActiveEmptyState.tsx');
    assert.doesNotMatch(empty, DELETE);
    assert.doesNotMatch(empty, RESTORE);
    assert.match(empty, /history\?backfill=1/);
  });

  it('movement-history sheet and receipt stay read-only', () => {
    for (const rel of [
      'src/components/workout/MovementHistorySheet.tsx',
      'src/lib/workout/movementHistory.ts',
      'src/components/workout/WorkoutVictorySheet.tsx',
    ]) {
      assert.doesNotMatch(read(rel), DELETE, `${rel} leaked History delete`);
      assert.doesNotMatch(read(rel), RESTORE, `${rel} leaked History restore`);
    }
  });

  it('first set stays ungated — delete never mounts a login wall', () => {
    for (const rel of [
      'src/lib/workout/deleteFinishedSession.ts',
      'src/components/history/HistorySessionDelete.tsx',
      'src/components/history/HistorySessionRestore.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
  });
});
