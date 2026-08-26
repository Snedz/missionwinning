/**
 * This month lives on the History calendar. Not Today. Not a year picker.
 * Copy / Move / Repeat / empty-day / month-file stay.
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
const THIS_MONTH = /decideThisMonth|history-calendar-this-month|history\/thisMonthCalendar/;
const YEAR_PICKER = /year picker|month-year modal|MonthYearPicker|year-picker/i;

describe('this month on the History calendar surface lock (.1031)', () => {
  it('History calendar mounts This month via decideThisMonth — outline 44px, not primary-fill', () => {
    const cal = read('src/components/history/HistoryCalendar.tsx');
    assert.match(cal, /decideThisMonth/);
    assert.match(cal, /data-testid="history-calendar-this-month"/);
    assert.match(cal, /historyCalThisMonth|This month/);
    assert.match(cal, /variant="outline"/);
    assert.match(cal, /min-h-\[44px\]/);
    assert.match(cal, /onMonthKeyChange\(thisMonth\.monthKey\)/);
    assert.match(cal, /onSelectDate\?\.\(thisMonth\.dateKey\)/);
    assert.match(cal, /kind === 'apply'/);
    assert.doesNotMatch(cal, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(cal, /useState\(\(\) => localMonthKey\(\)\)/);
    assert.doesNotMatch(cal, YEAR_PICKER);
    assert.doesNotMatch(cal, STREAK);
    assert.doesNotMatch(cal, BANNED);
    assert.doesNotMatch(cal, FEED);
    const helper = read('src/lib/history/thisMonthCalendar.ts');
    assert.match(helper, /decideThisMonth/);
    assert.doesNotMatch(helper, /from '@\/store\/workoutStore'/);
    assert.doesNotMatch(helper, /toISOString\(/);
    assert.doesNotMatch(helper, /localStorage/);
    assert.doesNotMatch(helper, YEAR_PICKER);
    const locales = read('src/i18n/historyLocales.ts');
    assert.match(locales, /historyCalThisMonth/);
    assert.match(locales, /This month/);
  });

  it('Today stays one Start; lean, todayPrimaryAction, and /private do not import this', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, THIS_MONTH);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, THIS_MONTH);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, THIS_MONTH);
    const strip = read('src/components/today/TodayQuietWeekStrip.tsx');
    assert.doesNotMatch(strip, THIS_MONTH);
  });

  it('Copy / Move / Repeat / empty-day / month-file stay on HistoryPage', () => {
    const page = read('src/page-components/HistoryPage.tsx');
    assert.match(page, /decideCopySessionDay/);
    assert.match(page, /HistorySessionCopy/);
    assert.match(page, /decideMoveSessionDay|HistorySessionMove/);
    assert.match(page, /decideRepeatThisSession/);
    assert.match(page, /historyRepeatSession|Repeat this session/);
    assert.match(page, /decideEmptyDayLog/);
    assert.match(page, /data-testid="history-month-day-log"/);
    assert.match(page, /HistoryMonthFile/);
    assert.doesNotMatch(page, FEED);
    assert.doesNotMatch(page, BANNED);
    assert.doesNotMatch(page, YEAR_PICKER);
    const copy = read('src/components/history/HistorySessionCopy.tsx');
    assert.match(copy, /historyCopyDay|Copy to another day/);
    const move = read('src/components/history/HistorySessionMove.tsx');
    assert.match(move, /historyMoveDay|Move to another day/);
    const monthFile = read('src/components/history/HistoryMonthFile.tsx');
    assert.match(monthFile, /historyMonthFileSave|Save this month/);
    const empty = read('src/lib/history/monthTheyOwn.ts');
    assert.match(empty, /decideEmptyDayLog/);
  });

  it('first set stays ungated — This month never mounts a login wall', () => {
    for (const rel of [
      'src/lib/history/thisMonthCalendar.ts',
      'src/components/history/HistoryCalendar.tsx',
      'src/page-components/HistoryPage.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
    const first = read('src/lib/firstSetUngated.ts');
    assert.match(first, /`\.1031` — This month on the History calendar/);
    assert.match(first, /`\.1030` — copy this session onto another day from History/);
    assert.match(first, /`\.1029` — this month as a local file they own/);
    assert.match(first, /`\.1028` — log onto this empty day from the History month/);
    assert.match(first, /`\.1027` — Move this session to another day from History/);
    assert.match(first, /`\.1026` — Repeat this session from History into the live Start/);
    assert.match(first, /`\.963` — leave Today \/ week \/ receipt, come back; same session/);
  });
});
