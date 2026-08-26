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
import { localDateKeyFromIso } from '@/lib/time/localDate.ts';
import { decideMonthDaySelect, monthLiveFacts } from './monthTheyOwn.ts';

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

describe('month they own is not a streak', () => {
  it('the helper never names streak / fire / shame / ordinal', () => {
    assert.doesNotMatch(helperSrc, /streak|🔥|shame|ordinal|badge|pass-fail|day \d+ of/i);
    assert.match(helperSrc, /Not a fire count/);
    assert.match(helperSrc, /startFrom/);
    assert.match(helperSrc, /void input\.startFrom|void startFrom/);
  });
});
