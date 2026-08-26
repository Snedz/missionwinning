/**
 * This month as a file they own lives on History calendar. Not Today. Not a Feed.
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
const MONTH_FILE = /decideExportMonth|history-month-file|history\/exportMonth/;
const STREAK = /streak|🔥|shame|ordinal|badge|pass-fail|day \d+ of|fire-emoji/i;

describe('this month as a file they own surface lock (.1029)', () => {
  it('History calendar mounts Save this month on the month currently shown', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /HistoryMonthFile/);
    assert.match(page, /HistoryCalendar/);
    assert.match(page, /useState\(\(\) => localMonthKey\(\)\)/);
    assert.match(page, /monthKey=\{monthKey\}/);
    assert.match(page, /onMonthKeyChange=\{setMonthKey\}/);
    assert.doesNotMatch(page, BANNED);
    assert.doesNotMatch(page, FEED);
    const fields = read('src/components/history/HistoryMonthFile.tsx');
    assert.match(fields, /data-testid="history-month-file-save"/);
    assert.match(fields, /data-testid="history-month-file-json"/);
    assert.match(fields, /decideExportMonth/);
    assert.match(fields, /min-h-\[44px\]/);
    assert.match(fields, /disabled=\{!ready\}/);
    assert.doesNotMatch(fields, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(fields, BANNED);
    assert.doesNotMatch(fields, FEED);
    assert.doesNotMatch(fields, STREAK);
    assert.doesNotMatch(fields, /buildWorkoutCsvDownload|workoutsToMwCsv/);
    assert.doesNotMatch(fields, /navigator\.share|clipboard|permalink/);
    const helper = read('src/lib/history/exportMonth.ts');
    assert.match(helper, /decideExportMonth/);
    assert.match(helper, /decideExportDiary/);
    assert.doesNotMatch(helper, /from '@\/store\/workoutStore'/);
    assert.doesNotMatch(helper, BANNED);
    assert.doesNotMatch(helper, FEED);
    const cal = read('src/components/history/HistoryCalendar.tsx');
    assert.match(cal, /monthKey/);
    assert.match(cal, /onMonthKeyChange/);
    assert.match(cal, /shiftLocalMonth/);
    assert.doesNotMatch(cal, /useState\(\(\) => localMonthKey\(\)\)/);
  });

  it('Today stays one Start; lean, todayPrimaryAction, and /private do not import this', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, MONTH_FILE);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, MONTH_FILE);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, MONTH_FILE);
    const strip = read('src/components/today/TodayQuietWeekStrip.tsx');
    assert.doesNotMatch(strip, MONTH_FILE);
  });

  it('first set stays ungated — month file never mounts a login wall', () => {
    for (const rel of [
      'src/lib/history/exportMonth.ts',
      'src/components/history/HistoryMonthFile.tsx',
      'src/page-components/HistoryPage.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
    }
  });

  it('diary .1011 / session file .1016 / empty-day .1028 stay — this does not smash them', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /HistoryExport/);
    assert.match(page, /data-testid="session-history-export-open"/);
    assert.match(page, /HistorySessionFile/);
    assert.match(page, /decideEmptyDayLog/);
    assert.match(page, /data-testid="history-month-day-log"/);
    const exportFields = read('src/components/history/HistoryExport.tsx');
    assert.match(exportFields, /decideExportDiary\(history\)/);
    const sessionFile = read('src/components/history/HistorySessionFile.tsx');
    assert.match(sessionFile, /decideExportSession/);
    const first = read('src/lib/firstSetUngated.ts');
    assert.match(first, /`\.1029` — this month as a local file they own/);
    assert.match(first, /`\.1028` — log onto this empty day from the History month/);
    assert.match(first, /`\.1016` — this session as a local file they own/);
    assert.match(first, /`\.1011` — export this diary from History/);
  });
});
