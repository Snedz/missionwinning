/**
 * Month they own. Live sessions mark a day. Tombs do not.
 * Start-from fold never erases the month. Empty invents nothing.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { CompletedWorkoutLog } from '@/types';
import { foldHistoryFrom } from '@/lib/workout/startHistoryFrom.ts';
import {
  appendBackfillExercise,
  decideBackfillSession,
  emptyBackfillDraft,
  patchBackfillSet,
} from '@/lib/workout/backfillSession.ts';
import { localDateKeyFromIso } from '@/lib/time/localDate.ts';
import { decideExportDiary } from './exportDiary.ts';
import { decideExportMonth, exportMonthFileName } from './exportMonth.ts';
import { decideEmptyDayLog, decideMonthDaySelect, monthLiveFacts } from './monthTheyOwn.ts';

function isoOnLocalDay(year: number, month: number, day: number, hour = 12): string {
  return new Date(year, month - 1, day, hour).toISOString();
}

function log(
  over: Partial<CompletedWorkoutLog> & Pick<CompletedWorkoutLog, 'id'>
): CompletedWorkoutLog {
  return {
    clientId: `cid-${over.id}`,
    revision: 1,
    workoutName: 'Push',
    startedAt: isoOnLocalDay(2026, 7, 2, 10),
    completedAt: isoOnLocalDay(2026, 7, 2, 11),
    durationSeconds: 3600,
    totalVolume: 675,
    exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 135 }] }],
    ...over,
  };
}

const helperSrc = readFileSync(path.join(import.meta.dirname, 'monthTheyOwn.ts'), 'utf8');

const JULY_2 = localDateKeyFromIso(isoOnLocalDay(2026, 7, 2));
const JUNE_20 = localDateKeyFromIso(isoOnLocalDay(2026, 6, 20));
const JULY_MONTH = JULY_2.slice(0, 7);
const JUNE_MONTH = JUNE_20.slice(0, 7);
const TODAY = '2026-08-25';
const YESTERDAY = '2026-08-24';
const TOMORROW = '2026-08-26';

describe('monthLiveFacts (.1018)', () => {
  it('empty / missing history invents nothing', () => {
    assert.equal(monthLiveFacts(undefined).size, 0);
    assert.equal(monthLiveFacts(null).size, 0);
    assert.equal(monthLiveFacts([]).size, 0);
  });

  it('a live session marks its local day with honest session and set counts', () => {
    const facts = monthLiveFacts([log({ id: 'tue' })]);
    const day = facts.get(JULY_2);
    assert.ok(day, 'live Tuesday must mark');
    assert.equal(day.sessions, 1);
    assert.equal(day.setCount, 1);
    assert.equal(facts.size, 1);
  });

  it('two live sessions on one day count as two — not a streak ordinal', () => {
    const facts = monthLiveFacts([
      log({ id: 'am', completedAt: isoOnLocalDay(2026, 7, 2, 9) }),
      log({
        id: 'pm',
        completedAt: isoOnLocalDay(2026, 7, 2, 18),
        exercises: [
          { exerciseId: 'squats', sets: [{ reps: 5, weight: 100 }, { reps: 5, weight: 100 }] },
        ],
      }),
    ]);
    const day = facts.get(JULY_2)!;
    assert.equal(day.sessions, 2);
    assert.equal(day.setCount, 3);
    assert.equal(facts.size, 1, 'one calendar day, two sessions — not day 2 of a streak');
  });

  it('a tomb does not mark the day; a live sibling still does', () => {
    const facts = monthLiveFacts([
      log({ id: 'live' }),
      log({
        id: 'tomb',
        completedAt: isoOnLocalDay(2026, 7, 3, 11),
        deletedAt: isoOnLocalDay(2026, 7, 4, 9),
      }),
    ]);
    assert.equal(facts.has(JULY_2), true);
    assert.equal(facts.has(localDateKeyFromIso(isoOnLocalDay(2026, 7, 3))), false);
    assert.equal(facts.size, 1);
  });

  it('unparseable completedAt invents no day', () => {
    const facts = monthLiveFacts([log({ id: 'junk', completedAt: 'not-a-date', startedAt: '' })]);
    assert.equal(facts.size, 0);
  });

  it('start-from fold does not erase an older live day from the month they own', () => {
    const older = log({
      id: 'june',
      startedAt: isoOnLocalDay(2026, 6, 20, 10),
      completedAt: isoOnLocalDay(2026, 6, 20, 11),
    });
    const newer = log({ id: 'july' });
    const folded = foldHistoryFrom([older, newer], '2026-07-01');
    assert.equal(folded.length, 1, 'precondition: fold hides June');
    assert.equal(folded[0]?.id, 'july');
    const facts = monthLiveFacts([older, newer], '2026-07-01');
    assert.equal(facts.has(JUNE_20), true, 'owned month still shows the folded-from week live day');
    assert.equal(facts.has(JULY_2), true);
    assert.equal(facts.get(JUNE_20)?.sessions, 1);
  });
});

describe('decideMonthDaySelect (.1018)', () => {
  it('empty / missing / junk date invents nothing', () => {
    const history = [log({ id: 'tue' })];
    assert.deepEqual(decideMonthDaySelect({}), { kind: 'empty' });
    assert.deepEqual(decideMonthDaySelect({ dateKey: '', history }), { kind: 'empty' });
    assert.deepEqual(decideMonthDaySelect({ dateKey: '   ', history }), { kind: 'empty' });
    assert.deepEqual(decideMonthDaySelect({ dateKey: '2026-13-40', history }), { kind: 'empty' });
    assert.deepEqual(decideMonthDaySelect({ dateKey: 'July 2', history }), { kind: 'empty' });
    assert.deepEqual(decideMonthDaySelect({ dateKey: null, history }), { kind: 'empty' });
  });

  it('a real day with no live session is none — not an invented row', () => {
    const history = [log({ id: 'tue' })];
    assert.deepEqual(decideMonthDaySelect({ dateKey: '2026-07-04', history }), {
      kind: 'none',
      dateKey: '2026-07-04',
    });
    assert.deepEqual(decideMonthDaySelect({ dateKey: '2026-07-04', history: [] }), {
      kind: 'none',
      dateKey: '2026-07-04',
    });
  });

  it('a tomb-only day is none', () => {
    const history = [
      log({
        id: 'tomb',
        deletedAt: isoOnLocalDay(2026, 7, 4, 9),
      }),
    ];
    assert.deepEqual(decideMonthDaySelect({ dateKey: JULY_2, history }), {
      kind: 'none',
      dateKey: JULY_2,
    });
  });

  it('a live day returns those rows and skips a tomb on the same day', () => {
    const live = log({ id: 'live' });
    const tomb = log({
      id: 'tomb',
      completedAt: isoOnLocalDay(2026, 7, 2, 18),
      deletedAt: isoOnLocalDay(2026, 7, 4, 9),
    });
    const other = log({
      id: 'wed',
      completedAt: isoOnLocalDay(2026, 7, 3, 11),
    });
    const decision = decideMonthDaySelect({
      dateKey: JULY_2,
      history: [live, tomb, other],
    });
    assert.equal(decision.kind, 'day');
    if (decision.kind !== 'day') return;
    assert.deepEqual(
      decision.rows.map((row) => row.id),
      ['live']
    );
  });

  it('start-from fold does not hide the selected older live day', () => {
    const older = log({
      id: 'june',
      startedAt: isoOnLocalDay(2026, 6, 20, 10),
      completedAt: isoOnLocalDay(2026, 6, 20, 11),
    });
    const decision = decideMonthDaySelect({
      dateKey: JUNE_20,
      history: [older],
      startFrom: '2026-07-01',
    });
    assert.equal(decision.kind, 'day');
    if (decision.kind !== 'day') return;
    assert.equal(decision.rows[0]?.id, 'june');
  });
});

describe('decideEmptyDayLog (.1028)', () => {
  it('empty / missing / junk invents nothing', () => {
    const history = [log({ id: 'tue' })];
    assert.deepEqual(decideEmptyDayLog({ todayKey: TODAY, history }), { kind: 'empty' });
    assert.deepEqual(decideEmptyDayLog({ dateKey: '', todayKey: TODAY, history }), {
      kind: 'empty',
    });
    assert.deepEqual(decideEmptyDayLog({ dateKey: YESTERDAY, todayKey: '', history }), {
      kind: 'empty',
    });
    assert.deepEqual(decideEmptyDayLog({ dateKey: '2026-13-40', todayKey: TODAY, history }), {
      kind: 'empty',
    });
    assert.deepEqual(decideEmptyDayLog({ dateKey: null, todayKey: TODAY, history }), {
      kind: 'empty',
    });
  });

  it('a vacated / empty past day opens backfill on that dateKey', () => {
    const history = [log({ id: 'tue' })];
    assert.deepEqual(decideEmptyDayLog({ dateKey: YESTERDAY, todayKey: TODAY, history }), {
      kind: 'open',
      dateKey: YESTERDAY,
    });
    assert.deepEqual(decideEmptyDayLog({ dateKey: JULY_2, todayKey: TODAY, history: [] }), {
      kind: 'open',
      dateKey: JULY_2,
    });
  });

  it('today empty day opens; a live day is not this door', () => {
    assert.deepEqual(decideEmptyDayLog({ dateKey: TODAY, todayKey: TODAY, history: [] }), {
      kind: 'open',
      dateKey: TODAY,
    });
    assert.equal(
      decideEmptyDayLog({
        dateKey: JULY_2,
        todayKey: TODAY,
        history: [log({ id: 'tue' })],
      }).kind,
      'empty'
    );
  });

  it('future invents nothing', () => {
    assert.equal(
      decideEmptyDayLog({ dateKey: TOMORROW, todayKey: TODAY, history: [] }).kind,
      'empty'
    );
  });

  it('tomb-only day opens a new row — tombs stay out', () => {
    const history = [
      log({
        id: 'tomb',
        deletedAt: isoOnLocalDay(2026, 7, 4, 9),
      }),
    ];
    assert.deepEqual(decideEmptyDayLog({ dateKey: JULY_2, todayKey: TODAY, history }), {
      kind: 'open',
      dateKey: JULY_2,
    });
  });

  it('save on the empty-day door lists a new row that day', () => {
    const door = decideEmptyDayLog({ dateKey: YESTERDAY, todayKey: TODAY, history: [] });
    assert.equal(door.kind, 'open');
    if (door.kind !== 'open') return;
    let draft = emptyBackfillDraft(door.dateKey);
    draft = appendBackfillExercise(draft, 'bench-press');
    draft = patchBackfillSet(draft, 0, 0, { reps: 5, weight: 135 });
    const saved = decideBackfillSession({
      draft,
      todayKey: TODAY,
      id: 'log-empty-day',
      clientId: 'cid-empty-day',
    });
    assert.equal(saved.kind, 'apply');
    if (saved.kind !== 'apply') return;
    const day = decideMonthDaySelect({ dateKey: YESTERDAY, history: [saved.next] });
    assert.equal(day.kind, 'day');
    if (day.kind !== 'day') return;
    assert.equal(day.rows[0]?.id, 'log-empty-day');
    assert.equal(
      decideEmptyDayLog({
        dateKey: YESTERDAY,
        todayKey: TODAY,
        history: [saved.next],
      }).kind,
      'empty'
    );
  });
});

describe('this month as a file they own (.1029)', () => {
  it('empty month disables Save', () => {
    const history = [log({ id: 'tue' })];
    assert.deepEqual(decideExportMonth({ monthKey: '2026-01', history }), { kind: 'empty' });
    assert.deepEqual(decideExportMonth({ monthKey: '', history }), { kind: 'empty' });
    assert.deepEqual(decideExportMonth({ monthKey: '2026-13', history }), { kind: 'empty' });
    assert.deepEqual(decideExportMonth({ monthKey: JULY_MONTH, history: [] }), { kind: 'empty' });
  });

  it('a live month writes only that month’s rows', () => {
    const july = log({ id: 'jul', sessionTitle: 'July squat' });
    const june = log({
      id: 'jun',
      sessionTitle: 'June bench',
      startedAt: isoOnLocalDay(2026, 6, 20, 10),
      completedAt: isoOnLocalDay(2026, 6, 20, 11),
    });
    const decided = decideExportMonth({ monthKey: JULY_MONTH, history: [july, june] });
    assert.equal(decided.kind, 'ready');
    if (decided.kind !== 'ready') return;
    assert.equal(decided.rows[0]?.sessionTitle, 'July squat');
    assert.equal(decided.csv.includes('June bench'), false);
  });

  it('paging to another month changes the file', () => {
    const july = log({ id: 'jul', sessionTitle: 'July squat' });
    const june = log({
      id: 'jun',
      sessionTitle: 'June bench',
      startedAt: isoOnLocalDay(2026, 6, 20, 10),
      completedAt: isoOnLocalDay(2026, 6, 20, 11),
    });
    const onScreen = decideExportMonth({ monthKey: JULY_MONTH, history: [july, june] });
    const paged = decideExportMonth({ monthKey: JUNE_MONTH, history: [july, june] });
    assert.equal(onScreen.kind, 'ready');
    assert.equal(paged.kind, 'ready');
    if (onScreen.kind !== 'ready' || paged.kind !== 'ready') return;
    assert.notEqual(onScreen.csv, paged.csv);
    assert.equal(onScreen.rows[0]?.sessionTitle, 'July squat');
    assert.equal(paged.rows[0]?.sessionTitle, 'June bench');
    assert.notEqual(
      exportMonthFileName(JULY_MONTH, 'csv'),
      exportMonthFileName(JUNE_MONTH, 'csv')
    );
  });

  it('overflow diary export still writes the whole diary', () => {
    const july = log({ id: 'jul', sessionTitle: 'July squat' });
    const june = log({
      id: 'jun',
      sessionTitle: 'June bench',
      startedAt: isoOnLocalDay(2026, 6, 20, 10),
      completedAt: isoOnLocalDay(2026, 6, 20, 11),
    });
    const monthFile = decideExportMonth({ monthKey: JULY_MONTH, history: [july, june] });
    const whole = decideExportDiary([july, june]);
    assert.equal(whole.kind, 'ready');
    assert.equal(monthFile.kind, 'ready');
    if (whole.kind !== 'ready' || monthFile.kind !== 'ready') return;
    assert.ok(whole.count > monthFile.count);
    assert.equal(whole.csv.includes('June bench'), true);
    assert.equal(monthFile.csv.includes('June bench'), false);
  });
});

describe('month they own is not a streak', () => {
  it('the helper never names streak / fire / shame / ordinal', () => {
    assert.doesNotMatch(helperSrc, /streak|🔥|shame|ordinal|badge|pass-fail|day \d+ of/i);
    assert.match(helperSrc, /Not a fire count/);
    assert.match(helperSrc, /startFrom/);
    assert.match(helperSrc, /void input\.startFrom|void startFrom/);
  });
});
