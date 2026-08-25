/**
 * Start history from this date lives on History overflow. Not Today. Not delete.
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
const START_FROM =
  /decideStartHistoryFrom|foldHistoryFrom|historyForWeek|HistoryStartFrom|session-history-start-from/;
const DELETE =
  /decideDeleteFinishedSession|applyDeleteFinishedSession|HistorySessionDelete|session-history-delete/;
const MERGE =
  /decideMergeExercises|applyMergeExercises|HistoryMergeExercises|session-history-merge/;
const BACKFILL = /decideBackfillSession|HistoryBackfill|session-history-backfill/;
const IN_SET_PR = /decideInSetPr|formatInSetPrLabels|set-table-in-set-pr|inSetPrLabels/;

describe('start history from this date surface lock (.1005)', () => {
  it('History overflow mounts the fold door; confirm when it hides a lot', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /decideStartHistoryFrom|HistoryStartFrom/);
    assert.match(page, /decideDeleteFinishedSession/);
    assert.match(page, /decideEditSave/);
    assert.match(page, /decideBackfillSession/);
    assert.match(page, /decideMergeExercises/);
    assert.doesNotMatch(page, IN_SET_PR);
    assert.doesNotMatch(page, BANNED);
    assert.doesNotMatch(page, FEED);
    const fields = read('src/components/history/HistoryStartFrom.tsx');
    assert.match(fields, /data-testid="session-history-start-from"/);
    assert.match(fields, /data-testid="session-history-start-from-confirm"/);
    assert.match(fields, /data-testid="session-history-start-from-clear"/);
    assert.match(fields, /decideStartHistoryFrom/);
    assert.match(fields, /decideClearStartHistoryFrom/);
    assert.match(fields, /min-h-\[44px\]/);
    assert.doesNotMatch(fields, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(fields, BANNED);
    assert.doesNotMatch(fields, /decideThisDeviceResume|protectLiveStart|startWorkout/);
    assert.doesNotMatch(fields, /applyDeleteFinishedSession|cancelActiveWorkout/);
  });

  it('Today stays one Start; lean and /private do not import the fold door', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.match(lean, /historyForWeek|foldHistoryFrom/);
    assert.doesNotMatch(lean, /HistoryStartFrom|session-history-start-from/);
    assert.doesNotMatch(lean, DELETE);
    assert.doesNotMatch(lean, MERGE);
    assert.doesNotMatch(lean, BACKFILL);
    assert.doesNotMatch(lean, IN_SET_PR);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, START_FROM);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, START_FROM);
    assert.doesNotMatch(priv, DELETE);
    assert.doesNotMatch(priv, MERGE);
    assert.doesNotMatch(priv, BACKFILL);
  });

  it('week strip / Coach / streak fold; History list does not', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /quietWeekGlance\(\{ history: historyForWeek\(workoutHistory\)/);
    const dash = read('src/page-components/HomeTodayDashboard.tsx');
    assert.match(dash, /getTrainingStreak\(historyForWeek\(workoutHistory\)\)/);
    assert.match(dash, /countTrainDaysThisWeek\(historyForWeek\(workoutHistory\)/);
    const coach = read('src/hooks/useCoachPlan.ts');
    assert.match(coach, /historyForWeek\(history/);
    const list = read('src/lib/history/sessionHistoryList.ts');
    assert.doesNotMatch(list, /foldHistoryFrom|historyForWeek|startHistoryFrom/);
  });

  it('Train overflow / empty Train stay backfill — fold is not a second Start', () => {
    const chrome = read('src/components/workout/ActiveSessionChrome.tsx');
    assert.doesNotMatch(chrome, START_FROM);
    const empty = read('src/components/workout/ActiveEmptyState.tsx');
    assert.doesNotMatch(empty, START_FROM);
    assert.match(empty, /history\?backfill=1/);
  });

  it('first set stays ungated — fold never mounts a login wall', () => {
    for (const rel of [
      'src/lib/workout/startHistoryFrom.ts',
      'src/components/history/HistoryStartFrom.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
  });
});
