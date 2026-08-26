/**
 * This month shows how many live sessions. Empty / junk invents nothing.
 * Two live sessions on one day count as 2, not 1 training day.
 * Tombs stay out. startFrom does not shrink. Never invent 0 as apply.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { CompletedWorkoutLog } from '@/types';
import { foldHistoryFrom } from '@/lib/workout/startHistoryFrom.ts';
import { localDateKeyFromIso } from '@/lib/time/localDate.ts';
import { monthLiveFacts } from './monthTheyOwn.ts';
import { decideMonthSessionCount } from './monthSessionCount.ts';

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

const helperSrc = readFileSync(path.join(import.meta.dirname, 'monthSessionCount.ts'), 'utf8');

const JULY_ISO = isoOnLocalDay(2026, 7, 2, 11);
const JUNE_ISO = isoOnLocalDay(2026, 6, 20, 11);
const AUGUST_ISO = isoOnLocalDay(2026, 8, 4, 11);
const JULY_KEY = (localDateKeyFromIso(JULY_ISO) ?? '').slice(0, 7);
const JUNE_KEY = (localDateKeyFromIso(JUNE_ISO) ?? '').slice(0, 7);
const AUGUST_KEY = (localDateKeyFromIso(AUGUST_ISO) ?? '').slice(0, 7);

describe('decideMonthSessionCount (.1033)', () => {
  it('junk month is empty', () => {
    const history = [log({ id: 'tue' })];
    assert.deepEqual(decideMonthSessionCount({}), { kind: 'empty' });
    assert.deepEqual(decideMonthSessionCount({ monthKey: '', history }), { kind: 'empty' });
    assert.deepEqual(decideMonthSessionCount({ monthKey: '   ', history }), { kind: 'empty' });
    assert.deepEqual(decideMonthSessionCount({ monthKey: null, history }), { kind: 'empty' });
    assert.deepEqual(decideMonthSessionCount({ monthKey: undefined, history }), { kind: 'empty' });
    assert.deepEqual(decideMonthSessionCount({ monthKey: '2026-13', history }), { kind: 'empty' });
    assert.deepEqual(decideMonthSessionCount({ monthKey: '2026-00', history }), { kind: 'empty' });
    assert.deepEqual(decideMonthSessionCount({ monthKey: '07', history }), { kind: 'empty' });
    assert.deepEqual(decideMonthSessionCount({ monthKey: localDateKeyFromIso(JULY_ISO), history }), {
      kind: 'empty',
    });
  });

  it('no live rows is empty — never invents 0 as apply', () => {
    assert.deepEqual(decideMonthSessionCount({ monthKey: JULY_KEY }), { kind: 'empty' });
    assert.deepEqual(decideMonthSessionCount({ monthKey: JULY_KEY, history: [] }), {
      kind: 'empty',
    });
    assert.deepEqual(decideMonthSessionCount({ monthKey: JULY_KEY, history: null }), {
      kind: 'empty',
    });
    const juneOnly = log({
      id: 'june',
      startedAt: isoOnLocalDay(2026, 6, 20, 10),
      completedAt: JUNE_ISO,
    });
    assert.deepEqual(decideMonthSessionCount({ monthKey: JULY_KEY, history: [juneOnly] }), {
      kind: 'empty',
    });
    assert.notEqual(JUNE_KEY, JULY_KEY);
  });

  it('two live sessions on one day in July apply 2 — not 1 training day', () => {
    const history = [
      log({ id: 'am', completedAt: isoOnLocalDay(2026, 7, 2, 9) }),
      log({
        id: 'pm',
        completedAt: isoOnLocalDay(2026, 7, 2, 18),
      }),
    ];
    const decision = decideMonthSessionCount({ monthKey: JULY_KEY, history });
    assert.deepEqual(decision, { kind: 'apply', count: 2 });
    assert.equal(monthLiveFacts(history).size, 1, 'one trained day, two live sessions');
  });

  it('tomb is ignored; a live sibling still counts', () => {
    const history = [
      log({ id: 'live' }),
      log({
        id: 'tomb',
        completedAt: isoOnLocalDay(2026, 7, 3, 11),
        deletedAt: isoOnLocalDay(2026, 7, 4, 9),
      }),
    ];
    assert.deepEqual(decideMonthSessionCount({ monthKey: JULY_KEY, history }), {
      kind: 'apply',
      count: 1,
    });
    assert.deepEqual(
      decideMonthSessionCount({
        monthKey: JULY_KEY,
        history: [
          log({
            id: 'only-tomb',
            deletedAt: isoOnLocalDay(2026, 7, 4, 9),
          }),
        ],
      }),
      { kind: 'empty' }
    );
  });

  it('August row does not count toward July', () => {
    const history = [
      log({ id: 'july' }),
      log({
        id: 'august',
        startedAt: isoOnLocalDay(2026, 8, 4, 10),
        completedAt: AUGUST_ISO,
      }),
    ];
    assert.deepEqual(decideMonthSessionCount({ monthKey: JULY_KEY, history }), {
      kind: 'apply',
      count: 1,
    });
    assert.deepEqual(decideMonthSessionCount({ monthKey: AUGUST_KEY, history }), {
      kind: 'apply',
      count: 1,
    });
    assert.notEqual(JULY_KEY, AUGUST_KEY);
  });

  it('startFrom does not shrink the month they own', () => {
    const older = log({ id: 'july' });
    const newer = log({
      id: 'august',
      startedAt: isoOnLocalDay(2026, 8, 4, 10),
      completedAt: AUGUST_ISO,
    });
    const folded = foldHistoryFrom([older, newer], '2026-08-01');
    assert.equal(folded.length, 1, 'precondition: fold hides July');
    assert.equal(folded[0]?.id, 'august');
    const decision = decideMonthSessionCount({
      monthKey: JULY_KEY,
      history: [older, newer],
      startFrom: '2026-08-01',
    });
    assert.deepEqual(decision, { kind: 'apply', count: 1 });
  });

  it('helper has no store / no toISOString', () => {
    const before = decideMonthSessionCount({
      monthKey: JULY_KEY,
      history: [log({ id: 'tue' })],
    });
    assert.deepEqual(before, { kind: 'apply', count: 1 });
    assert.doesNotMatch(helperSrc, /from '@\/store\//);
    assert.doesNotMatch(helperSrc, /workoutStore/);
    assert.doesNotMatch(helperSrc, /toISOString\(/);
    assert.doesNotMatch(helperSrc, /localStorage/);
    assert.doesNotMatch(helperSrc, /foldHistoryFrom/);
    assert.match(helperSrc, /void input\.startFrom/);
    assert.match(helperSrc, /not a fire-zero/);
    assert.match(helperSrc, /Pure: no store/);
    assert.equal(typeof decideMonthSessionCount, 'function');
  });
});
