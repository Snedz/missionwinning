/**
 * This month on the History calendar. Empty / junk invents nothing.
 * Already-this-month is noop. Apply is today's month and today.
 * Does not invent history rows.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import { isLocalMonthKey, localDateKey, localMonthKey } from '@/lib/time/localDate.ts';
import { decideThisMonth } from './thisMonthCalendar.ts';

const helperSrc = readFileSync(path.join(import.meta.dirname, 'thisMonthCalendar.ts'), 'utf8');

function localOn(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day, 15, 0, 0, 0);
}

describe('decideThisMonth (.1031)', () => {
  it('empty / missing / junk viewed month or junk today invents nothing', () => {
    const todayKey = localDateKey(localOn(2026, 8, 15));
    const viewed = localMonthKey(localOn(2026, 7, 1));
    assert.deepEqual(decideThisMonth({}), { kind: 'empty' });
    assert.deepEqual(decideThisMonth({ viewedMonthKey: '', todayKey }), { kind: 'empty' });
    assert.deepEqual(decideThisMonth({ viewedMonthKey: '   ', todayKey }), { kind: 'empty' });
    assert.deepEqual(decideThisMonth({ viewedMonthKey: null, todayKey }), { kind: 'empty' });
    assert.deepEqual(decideThisMonth({ viewedMonthKey: undefined, todayKey }), { kind: 'empty' });
    assert.deepEqual(decideThisMonth({ viewedMonthKey: '2026-13', todayKey }), { kind: 'empty' });
    assert.deepEqual(decideThisMonth({ viewedMonthKey: '2026-00', todayKey }), { kind: 'empty' });
    assert.deepEqual(decideThisMonth({ viewedMonthKey: '07', todayKey }), { kind: 'empty' });
    assert.deepEqual(decideThisMonth({ viewedMonthKey: todayKey, todayKey }), { kind: 'empty' });
    assert.deepEqual(decideThisMonth({ viewedMonthKey: viewed, todayKey: '' }), { kind: 'empty' });
    assert.deepEqual(decideThisMonth({ viewedMonthKey: viewed, todayKey: 'not-a-date' }), {
      kind: 'empty',
    });
    assert.deepEqual(decideThisMonth({ viewedMonthKey: viewed, todayKey: '2026-02-31' }), {
      kind: 'empty',
    });
    assert.deepEqual(decideThisMonth({ viewedMonthKey: viewed, todayKey: viewed }), {
      kind: 'empty',
    });
  });

  it('already-this-month is noop — hide the button', () => {
    const today = localOn(2026, 8, 15);
    const todayKey = localDateKey(today);
    const viewed = localMonthKey(today);
    assert.deepEqual(decideThisMonth({ viewedMonthKey: viewed, todayKey }), { kind: 'noop' });
  });

  it('July viewed + today in August applies today\'s month and today', () => {
    const today = localOn(2026, 8, 15);
    const todayKey = localDateKey(today);
    const viewed = localMonthKey(localOn(2026, 7, 1));
    const decision = decideThisMonth({ viewedMonthKey: viewed, todayKey });
    assert.deepEqual(decision, {
      kind: 'apply',
      monthKey: localMonthKey(today),
      dateKey: todayKey,
    });
    assert.equal(decision.kind === 'apply' && decision.monthKey, localMonthKey(today));
    assert.notEqual(viewed, localMonthKey(today));
  });

  it('a paged future month still jumps back to today — not a year-picker month', () => {
    const today = localOn(2026, 8, 15);
    const todayKey = localDateKey(today);
    const viewed = localMonthKey(localOn(2026, 9, 1));
    const decision = decideThisMonth({ viewedMonthKey: viewed, todayKey });
    assert.equal(decision.kind, 'apply');
    if (decision.kind !== 'apply') return;
    assert.equal(decision.monthKey, localMonthKey(today));
    assert.equal(decision.dateKey, todayKey);
    assert.notEqual(decision.monthKey, viewed);
  });

  it('does not invent history rows', () => {
    const today = localOn(2026, 8, 15);
    const before = decideThisMonth({
      viewedMonthKey: localMonthKey(localOn(2026, 7, 1)),
      todayKey: localDateKey(today),
    });
    assert.equal(before.kind, 'apply');
    assert.doesNotMatch(helperSrc, /CompletedWorkoutLog|workoutHistory|workoutStore/);
    assert.doesNotMatch(helperSrc, /from '@\/store\//);
    assert.doesNotMatch(helperSrc, /toISOString\(/);
    assert.doesNotMatch(helperSrc, /localStorage/);
    assert.match(helperSrc, /does not invent sessions/i);
    assert.equal(typeof decideThisMonth, 'function');
  });
});

describe('isLocalMonthKey (.1031)', () => {
  it('accepts what localMonthKey produces and rejects junk', () => {
    assert.equal(isLocalMonthKey(localMonthKey(localOn(2026, 8, 15))), true);
    assert.equal(isLocalMonthKey('2026-13'), false);
    assert.equal(isLocalMonthKey('2026-00'), false);
    assert.equal(isLocalMonthKey('2026-7'), false);
    assert.equal(isLocalMonthKey(localDateKey(localOn(2026, 8, 15))), false);
    assert.equal(isLocalMonthKey(undefined), false);
  });
});
