/**
 * Merge duplicates lives on History / library. Not Today. Not Resume.
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
const MERGE =
  /decideMergeExercises|applyMergeExercises|HistoryMergeExercises|session-history-merge/;
const BACKFILL = /decideBackfillSession|HistoryBackfill|session-history-backfill/;
const IN_SET_PR = /decideInSetPr|formatInSetPrLabels|set-table-in-set-pr|inSetPrLabels/;

describe('merge duplicate exercises surface lock (.1002)', () => {
  it('History mounts the merge door; confirm says it cannot be undone', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /decideMergeExercises/);
    assert.match(page, /applyMergedExercises|HistoryMergeExercises/);
    assert.match(page, /decideBackfillSession/);
    assert.match(page, /decideEditSave/);
    assert.doesNotMatch(page, IN_SET_PR);
    assert.doesNotMatch(page, BANNED);
    assert.doesNotMatch(page, FEED);
    const fields = read('src/components/history/HistoryMergeExercises.tsx');
    assert.match(fields, /data-testid="session-history-merge"/);
    assert.match(fields, /data-testid="session-history-merge-confirm"/);
    assert.match(fields, /cannot be undone/i);
    assert.match(fields, /min-h-\[44px\]/);
    assert.doesNotMatch(fields, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(fields, /upsertCustomExercise|exercise-picker-use-name/);
    assert.doesNotMatch(fields, /looksLike|fuzzy|autoMerge/);
    assert.doesNotMatch(fields, BANNED);
    assert.doesNotMatch(fields, /decideThisDeviceResume|protectLiveStart|startWorkout/);
  });

  it('Library mounts the same confirm-gated door — no invent, no second Start', () => {
    const page = read('src/page-components/LibraryPage.tsx');
    assert.match(page, /HistoryMergeExercises|session-history-merge|library-merge/);
    assert.match(page, /decideMergeExercises/);
    const openAt = page.indexOf('library-merge-open');
    const btn = page.slice(Math.max(0, openAt - 220), openAt + 180);
    assert.match(btn, /variant="outline"/);
    assert.doesNotMatch(btn, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(page, /upsertCustomExercise/);
    assert.doesNotMatch(page, BANNED);
    assert.doesNotMatch(page, FEED);
  });

  it('Today stays one Start; lean and /private do not import the merge helper', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, MERGE);
    assert.doesNotMatch(lean, BACKFILL);
    assert.doesNotMatch(lean, IN_SET_PR);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, MERGE);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, MERGE);
    assert.doesNotMatch(priv, BACKFILL);
    assert.doesNotMatch(priv, /editFinishedSession|HistorySessionEdit|session-history-edit/);
  });

  it('Train overflow / empty Train stay backfill — merge is not a second Start', () => {
    const chrome = read('src/components/workout/ActiveSessionChrome.tsx');
    assert.doesNotMatch(chrome, MERGE);
    assert.match(chrome, /sessionClockPaused/);
    const empty = read('src/components/workout/ActiveEmptyState.tsx');
    assert.doesNotMatch(empty, MERGE);
    assert.match(empty, /history\?backfill=1/);
  });

  it('first set stays ungated — merge never mounts a login wall', () => {
    for (const rel of [
      'src/lib/workout/mergeExercises.ts',
      'src/components/history/HistoryMergeExercises.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
  });
});
