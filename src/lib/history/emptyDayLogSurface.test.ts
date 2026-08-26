/**
 * Empty-day log lives on History month. Not Today. Not a second overflow.
 * Vacated / empty past day opens backfill on that date. Future invents nothing.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const BANNED =
  /UnlockButton|isPremium|\/bundle|discord\.com|WeChat|four-scene|Force Sync|Session Expired/i;
const FEED = /likes|Top 8|Feed permalink|shame slope|navigator\.share|mailto:/i;
const STREAK = /streak|🔥|shame|ordinal|badge|pass-fail|day \d+ of|fire-emoji/i;
const EMPTY_DAY = /decideEmptyDayLog|history-month-day-log/;
const OVERFLOW = /data-testid="session-history-backfill-open"/g;
const MOVE = /decideMoveSessionDay|HistorySessionMove|session-history-move/;
const REPEAT = /decideRepeatThisSession|history-repeat-session/;
const EDIT = /decideEditSave|HistorySessionEdit|session-history-edit/;

describe('empty-day month log surface lock (.1028)', () => {
  it('empty month day mounts one plus / log-onto-this-day door into backfill', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /decideEmptyDayLog/);
    assert.match(page, /data-testid="history-month-day-empty"/);
    assert.match(page, /data-testid="history-month-day-log"/);
    assert.match(page, /historyMonthDayLog|Log onto this day/);
    assert.match(page, /setBackfillDateKey\(emptyDayLog\.dateKey\)/);
    assert.match(page, /initialDateKey=\{backfillDateKey\}/);
    assert.match(page, /emptyBackfillDraft|HistoryBackfill/);
    assert.match(page, /decideBackfillSession/);
    const emptyAt = page.indexOf('data-testid="history-month-day-empty"');
    assert.ok(emptyAt >= 0, 'empty-day block missing');
    const emptyBlock = page.slice(emptyAt, page.indexOf('history-month-day-list'));
    assert.match(emptyBlock, /history-month-day-log/);
    assert.doesNotMatch(emptyBlock, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(emptyBlock, STREAK);
    assert.doesNotMatch(page, BANNED);
    assert.doesNotMatch(page, FEED);
    const helper = read('src/lib/history/monthTheyOwn.ts');
    assert.match(helper, /decideEmptyDayLog/);
    assert.match(helper, /kind !== 'none'/);
    assert.doesNotMatch(helper, /from '@\/store\/workoutStore'/);
    const fields = read('src/components/history/HistoryBackfill.tsx');
    assert.match(fields, /emptyBackfillDraft\(initialDateKey\)/);
    assert.match(fields, /initialDateKey/);
    assert.match(fields, /data-testid="session-history-backfill-save"/);
  });

  it('overflow .1000 still exists — this is not a second overflow door', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.equal(
      [...page.matchAll(OVERFLOW)].length,
      2,
      'empty + listed History still each have Log a past session'
    );
    assert.match(page, /historyBackfill|Log a past session/);
    assert.match(page, /data-testid="history-month-day-log"/);
    assert.notEqual(
      'history-month-day-log',
      'session-history-backfill-open',
      'empty-day door is not the overflow testid'
    );
  });

  it('Today stays one Start; lean, todayPrimaryAction, and /private do not import this', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, EMPTY_DAY);
    assert.doesNotMatch(lean, /decideBackfillSession|HistoryBackfill|monthTheyOwn/);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, EMPTY_DAY);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, EMPTY_DAY);
    const strip = read('src/components/today/TodayQuietWeekStrip.tsx');
    assert.doesNotMatch(strip, EMPTY_DAY);
  });

  it('Move .1027 / Repeat .1026 / edit .997 stay — this does not smash them', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, MOVE);
    assert.match(page, REPEAT);
    assert.match(page, EDIT);
    assert.match(page, /decideBackfillSession/);
    const month = read('src/lib/history/monthTheyOwn.ts');
    assert.match(month, /decideMonthDaySelect/);
    const move = read('src/lib/workout/moveSessionDay.ts');
    assert.match(move, /decideMoveSessionDay/);
  });

  it('first set stays ungated — empty-day log never mounts a login wall', () => {
    for (const rel of [
      'src/lib/history/monthTheyOwn.ts',
      'src/components/history/HistoryBackfill.tsx',
      'src/page-components/HistoryPage.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
  });
});
