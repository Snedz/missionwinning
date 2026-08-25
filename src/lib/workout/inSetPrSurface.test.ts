/**
 * In-set PR lives on the live Train set.
 * Today stays one Start. Honesty .971 still applies.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

const BANNED =
  /UnlockButton|isPremium|\/bundle|permalink|discord\.com|WeChat|four-scene|Force Sync|Session Expired|SignInPrompt/i;
const FEED = /likes|Top 8|Feed permalink|shame slope/i;
const IN_SET_PR = /decideInSetPr|formatInSetPrLabels|set-table-in-set-pr|inSetPrLabels/;

describe('in-set PR they hit surface lock (.999)', () => {
  it('quiet felt-win is on the live set; vs-last and e1RM hide stay', () => {
    const table = read('src/components/workout/SetLogTable.tsx');
    assert.match(table, /data-testid="set-table-in-set-pr"/);
    assert.match(table, /data-testid="set-table-vs-last"/);
    const prChrome = table.slice(
      table.indexOf('data-testid="set-table-in-set-pr"'),
      table.indexOf('data-testid="set-table-in-set-pr"') + 500
    );
    assert.doesNotMatch(prChrome, /variant="honor"/);
    assert.doesNotMatch(prChrome, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(table, /epley1rm|estimateOneRepMax|projected 1RM/i);
    assert.doesNotMatch(table, BANNED);
    assert.doesNotMatch(table, FEED);

    const card = read('src/components/workout/ActiveExerciseCard.tsx');
    assert.match(card, /formatInSetPrLabels/);
    assert.match(card, /formatVsLastSetDeltas/);
    assert.doesNotMatch(card, BANNED);
    assert.doesNotMatch(card, FEED);
  });

  it('reorder handle still on the live name; name tap still opens history', () => {
    const header = read('src/components/workout/ActiveExerciseHeader.tsx');
    assert.match(header, /ExerciseReorderHandle/);
    assert.match(header, /data-testid="movement-history-open"/);
    assert.doesNotMatch(header, IN_SET_PR);
  });

  it('Today stays one Start; lean and /private do not import the PR helper', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, IN_SET_PR);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, IN_SET_PR);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, IN_SET_PR);
    assert.doesNotMatch(lean, /editFinishedSession|HistorySessionEdit|session-history-edit/);
    assert.doesNotMatch(priv, /editFinishedSession|HistorySessionEdit|session-history-edit/);
  });

  it('History Edit stays on History; close receipt is not a trophy wall', () => {
    const history = read('src/page-components/HistoryPage.tsx');
    assert.match(history, /editFinishedSession|HistorySessionEdit|session-history-edit/);
    assert.doesNotMatch(history, IN_SET_PR);
    const receipt = read('src/components/workout/VictoryReceiptStrip.tsx');
    assert.doesNotMatch(receipt, /set-table-in-set-pr|formatInSetPrLabels|decideInSetPr/);
    assert.doesNotMatch(receipt, /trophy|medal|permalink/i);
  });

  it('honesty .971 still scores Train session count, not a PR score', () => {
    const honesty = read('src/lib/workout/thinHistory.ts');
    assert.match(honesty, /countLiveSessions/);
    assert.match(honesty, /isThinHistory/);
    assert.doesNotMatch(honesty, IN_SET_PR);
    assert.doesNotMatch(honesty, /isPersonalRecord|estimateOneRepMax/);
  });

  it('first set stays ungated — PR never mounts a login wall', () => {
    for (const rel of [
      'src/lib/workout/inSetPr.ts',
      'src/lib/workout/activeSessionFinish.ts',
      'src/components/workout/SetLogTable.tsx',
      'src/components/workout/ActiveExerciseCard.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
  });
});
