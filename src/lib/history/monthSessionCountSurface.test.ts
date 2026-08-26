/**
 * Month session count lives on the History calendar footer. Not Today.
 * Not a fire. Training-days stay. Day-cell / This month / Copy / Move /
 * Repeat / empty-day / month-file stay.
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
const FIRE = /🔥|fire-emoji|FireIcon/;
const YEAR_PICKER = /year picker|month-year modal|MonthYearPicker|year-picker/i;
const COUNT = /decideMonthSessionCount|history-month-sessions|history\/monthSessionCount/;
const DAY_COUNT = /decideDaySessionCount|history-month-day-sessions/;
const THIS_MONTH = /decideThisMonth|history-calendar-this-month/;

describe('month session count surface lock (.1033)', () => {
  it('HistoryCalendar mounts history-month-sessions / decideMonthSessionCount; keeps training-days and empty', () => {
    const cal = read('src/components/history/HistoryCalendar.tsx');
    assert.match(cal, /decideMonthSessionCount/);
    assert.match(cal, /data-testid="history-month-sessions"/);
    assert.match(cal, /text-\[13px\] tabular-nums/);
    assert.match(cal, /historyCalSessions/);
    assert.match(cal, /kind === 'apply'/);
    assert.match(cal, /historyCalSummary/);
    assert.match(cal, /data-testid="history-month-empty"/);
    assert.match(cal, /grid\.trainedDays === 0/);
    assert.match(cal, /Nothing logged this month/);
    assert.doesNotMatch(cal, /0 sessions/);
    assert.doesNotMatch(cal, FIRE);
    assert.doesNotMatch(cal, YEAR_PICKER);
    assert.doesNotMatch(cal, BANNED);
    assert.doesNotMatch(cal, FEED);
    const helper = read('src/lib/history/monthSessionCount.ts');
    assert.match(helper, /decideMonthSessionCount/);
    assert.doesNotMatch(helper, /from '@\/store\/workoutStore'/);
    assert.doesNotMatch(helper, /toISOString\(/);
    assert.doesNotMatch(helper, /localStorage/);
    assert.doesNotMatch(helper, YEAR_PICKER);
    assert.doesNotMatch(helper, /🔥/);
    const locales = read('src/i18n/historyLocales.ts');
    assert.match(locales, /historyCalSessions/);
    assert.match(locales, /\{\{count\}\} sessions/);
    assert.match(locales, /1 session/);
  });

  it('keeps history-month-day-sessions and history-calendar-this-month', () => {
    const cal = read('src/components/history/HistoryCalendar.tsx');
    assert.match(cal, DAY_COUNT);
    assert.match(cal, THIS_MONTH);
    assert.match(cal, /data-testid="history-month-day-sessions"/);
    assert.match(cal, /data-testid="history-calendar-this-month"/);
    const day = read('src/lib/history/daySessionCount.ts');
    assert.match(day, /decideDaySessionCount/);
    const thisMonth = read('src/lib/history/thisMonthCalendar.ts');
    assert.match(thisMonth, /decideThisMonth/);
  });

  it('Today stays one Start; lean, todayPrimaryAction, and /private do not import this', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, COUNT);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, COUNT);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, COUNT);
    const strip = read('src/components/today/TodayQuietWeekStrip.tsx');
    assert.doesNotMatch(strip, COUNT);
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

  it('first set stays ungated — month session count never mounts a login wall', () => {
    for (const rel of [
      'src/lib/history/monthSessionCount.ts',
      'src/components/history/HistoryCalendar.tsx',
      'src/page-components/HistoryPage.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
    const first = read('src/lib/firstSetUngated.ts');
    assert.match(first, /`\.1033` — this month shows how many live sessions/);
    assert.match(first, /`\.1032` — trained day shows how many live sessions/);
    assert.match(first, /`\.1031` — This month on the History calendar/);
    assert.match(first, /`\.1030` — copy this session onto another day from History/);
    assert.match(first, /`\.1029` — this month as a local file they own/);
    assert.match(first, /`\.1028` — log onto this empty day from the History month/);
    assert.match(first, /`\.1027` — Move this session to another day from History/);
    assert.match(first, /`\.1026` — Repeat this session from History into the live Start/);
    assert.match(first, /`\.963` — leave Today \/ week \/ receipt, come back; same session/);
  });
});
