/**
 * Month they own lives on History Show-all. Not Today. Not a streak.
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
const MONTH = /decideMonthDaySelect|monthLiveFacts|history-month-day/;

describe('month they own surface lock (.1018)', () => {
  it('History Show-all calendar taps a day into existing rows / detail', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /HistoryCalendar/);
    assert.match(page, /decideMonthDaySelect/);
    assert.match(page, /data-testid="history-month-day-list"/);
    assert.match(page, /data-testid="history-month-day-empty"/);
    assert.match(page, /data-testid="session-history-row"/);
    assert.match(page, /data-testid="session-history-log"/);
    assert.doesNotMatch(page, BANNED);
    assert.doesNotMatch(page, FEED);
    const cal = read('src/components/history/HistoryCalendar.tsx');
    assert.match(cal, /data-testid="history-month-day"/);
    assert.match(cal, /onSelectDate/);
    assert.match(cal, /monthLiveFacts/);
    assert.match(cal, /min-h-\[44px\]/);
    assert.match(cal, /aria-pressed/);
    assert.match(cal, /<button[\s\S]*data-testid="history-month-day"/);
    assert.doesNotMatch(cal, /<div[^>]*data-testid="history-month-day"/);
    assert.doesNotMatch(cal, BANNED);
    assert.doesNotMatch(cal, FEED);
    assert.doesNotMatch(cal, STREAK);
    const helper = read('src/lib/history/monthTheyOwn.ts');
    assert.match(helper, /decideMonthDaySelect/);
    assert.match(helper, /monthLiveFacts/);
    assert.doesNotMatch(helper, /from '@\/store\/workoutStore'/);
    assert.doesNotMatch(helper, /foldHistoryFrom/);
    assert.doesNotMatch(helper, BANNED);
    assert.doesNotMatch(helper, FEED);
    assert.doesNotMatch(helper, STREAK);
  });

  it('search stays a query and charts stay unfiltered', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /decideSearchHistory/);
    assert.match(page, /data-testid="session-history-search"/);
    assert.doesNotMatch(page, /setNameQuery\(monthDay|setNameQuery\(selected/);
    assert.match(page, /buildWeeklyVolumeTimeline\(liveHistory/);
    assert.match(page, /build1RMChartData\([^,]+,\s*liveHistory\)/);
    assert.match(page, /historySummaryStats\(liveHistory\)/);
    const search = read('src/lib/history/searchHistory.ts');
    assert.doesNotMatch(search, MONTH);
  });

  it('start-from fold still exists and the month helper does not call it', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /HistoryStartFrom/);
    assert.match(page, /data-testid="session-history-start-from-open"/);
    const helper = read('src/lib/history/monthTheyOwn.ts');
    assert.doesNotMatch(helper, /foldHistoryFrom|historyForWeek/);
    assert.match(helper, /startFrom/);
  });

  it('Today stays one Start; lean, todayPrimaryAction, and /private do not import this', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, MONTH);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, MONTH);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, MONTH);
    const strip = read('src/components/today/TodayQuietWeekStrip.tsx');
    assert.doesNotMatch(strip, MONTH);
  });

  it('first set stays ungated — month calendar never mounts a login wall', () => {
    for (const rel of [
      'src/lib/history/monthTheyOwn.ts',
      'src/components/history/HistoryCalendar.tsx',
      'src/page-components/HistoryPage.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
    }
  });

  it('empty-load cite .1017 still mounts — this does not smash it', () => {
    const cite = read('src/lib/workout/emptyLoadCite.test.ts');
    assert.match(cite, /empty load cite is BW, not 0 \(\.1017\)/);
    const first = read('src/lib/firstSetUngated.ts');
    assert.match(first, /\.1017 — live Last\/Prev empty load is BW/);
    const setRow = read('src/lib/workout/setRowType.ts');
    assert.match(setRow, /\.1017/);
  });

  it('session-file .1016 through export / import / search still mount — this does not smash them', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /HistorySessionFile/);
    assert.match(page, /HistoryExport/);
    assert.match(page, /HistoryImport/);
    assert.match(page, /decideSearchHistory/);
    assert.match(page, /data-testid="session-history-export-open"/);
    assert.match(page, /data-testid="session-history-import-open"/);
    const sessionFile = read('src/components/history/HistorySessionFile.tsx');
    assert.match(sessionFile, /data-testid="session-history-file"/);
    assert.match(sessionFile, /decideExportSession/);
  });
});
