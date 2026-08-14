/**
 * Habit week-count — 0 and N, contract file, shame-free copy, Today wiring.
 *
 * Injected `now` so fixtures do not expire. Mutants: same-day collapse,
 * last-week exclusion, tombstone, missing HABIT.md, shame words, unwired header.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { countTrainDaysThisWeek, HABIT_WEEK_COUNT_EN } from './habitWeekCount.ts';
import type { CompletedWorkoutLog } from '@/types';

const root = path.join(import.meta.dirname, '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

/** Wednesday 12 Aug 2026 15:00 local — week is Mon 10 → Sun 16. */
const NOW = new Date(2026, 7, 12, 15, 0, 0);

function logOn(dayOffset: number, extra?: Partial<CompletedWorkoutLog>): CompletedWorkoutLog {
  const d = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() + dayOffset, 12, 0, 0);
  return {
    id: `l-${dayOffset}-${extra?.id ?? 'a'}`,
    workoutName: 'Test',
    startedAt: d.toISOString(),
    completedAt: d.toISOString(),
    durationSeconds: 1800,
    totalVolume: 100,
    exercises: [{ exerciseId: 'push-ups', sets: [{ reps: 10, weight: 0 }] }],
    ...extra,
  };
}

describe('countTrainDaysThisWeek', () => {
  it('is 0 when history is empty', () => {
    assert.equal(countTrainDaysThisWeek([], NOW), 0);
  });

  it('is 0 when every log is last week', () => {
    // Previous Sunday (−3 from Wed) is the prior week.
    assert.equal(countTrainDaysThisWeek([logOn(-3)], NOW), 0);
  });

  it('counts unique local days this week (N)', () => {
    // Mon (−2) + Wed (0) = 2. Two logs on Monday still 2.
    const history = [logOn(-2), logOn(-2, { id: 'b' }), logOn(0)];
    assert.equal(countTrainDaysThisWeek(history, NOW), 2);
  });

  it('does not count tombstones', () => {
    assert.equal(
      countTrainDaysThisWeek([logOn(0, { deletedAt: NOW.toISOString() })], NOW),
      0
    );
  });

  it('ignores unparseable dates and future local days', () => {
    const bad: CompletedWorkoutLog = {
      ...logOn(0),
      id: 'bad',
      completedAt: 'not-a-date',
      startedAt: 'also-bad',
    };
    const future = logOn(2);
    assert.equal(countTrainDaysThisWeek([bad, future], NOW), 0);
  });
});

describe('HABIT contract', () => {
  it('docs/contracts/HABIT.md exists and names the daily Train loop', () => {
    const rel = 'docs/contracts/HABIT.md';
    assert.ok(existsSync(path.join(root, rel)), `missing ${rel}`);
    const body = read(rel);
    assert.match(body, /daily \*\*Train\*\* is the habit loop/i);
    assert.match(body, /Habit → Identity → Money → Platform/);
    assert.match(body, /[Zz]ero is a valid/);
  });

  it('week-count copy is shame-free (no missed / streak / you-haven’t)', () => {
    assert.equal(HABIT_WEEK_COUNT_EN, 'This week: {{count}} days logged');
    assert.doesNotMatch(HABIT_WEEK_COUNT_EN, /missed|streak|haven['’]t|only 0|you missed/i);
  });
});

describe('Today header wiring', () => {
  it('header renders the key; both Today shells pass the count', () => {
    const header = read('src/components/today/TodayPageHeader.tsx');
    assert.match(header, /todayHabitWeekCount/);
    assert.match(header, /daysLoggedThisWeek/);
    assert.doesNotMatch(header, /Two days off/);

    const lean = read('src/page-components/HomeTodayLean.tsx');
    const dash = read('src/page-components/HomeTodayDashboard.tsx');
    assert.match(lean, /daysLoggedThisWeek=\{countTrainDaysThisWeek\(/);
    assert.match(dash, /daysLoggedThisWeek=\{countTrainDaysThisWeek\(/);
    assert.doesNotMatch(lean, /JourneyHero[\s\S]*todayHabitWeekCount/);
    assert.doesNotMatch(dash, /JourneyHero[\s\S]*todayHabitWeekCount/);
  });
});
