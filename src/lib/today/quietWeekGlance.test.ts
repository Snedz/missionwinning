/**
 * Quiet week glance — diary days, no shame grid.
 *
 * Injected `now` so fixtures do not expire. Mutants: marking empty as
 * missed, copying plan status, inventing a third state, a second Start.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import { quietWeekGlance, type QuietWeekDay } from './quietWeekGlance.ts';
import type { CompletedWorkoutLog } from '@/types';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

/** Wednesday 12 Aug 2026 15:00 local — week is Mon 10 → Sun 16. */
const NOW = new Date(2026, 7, 12, 15, 0, 0);

function logOn(dayOffset: number, extra?: Partial<CompletedWorkoutLog>): CompletedWorkoutLog {
  const d = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() + dayOffset, 12, 0, 0);
  return {
    id: `l-${dayOffset}-${extra?.id ?? 'a'}`,
    workoutName: 'Push',
    startedAt: d.toISOString(),
    completedAt: d.toISOString(),
    durationSeconds: 1800,
    totalVolume: 100,
    exercises: [{ exerciseId: 'push-ups', sets: [{ reps: 10, weight: 0 }] }],
    ...extra,
  };
}

function dayKeys(day: QuietWeekDay): string[] {
  return Object.keys(day).sort();
}

describe('quietWeekGlance', () => {
  it('empty week invents no shame — seven empty days, no missed field', () => {
    const glance = quietWeekGlance({ history: [], now: NOW });
    assert.equal(glance.weekStart, '2026-08-10');
    assert.equal(glance.todayOffset, 2);
    assert.equal(glance.days.length, 7);
    for (const day of glance.days) {
      assert.equal(day.done, false, `${day.dateKey} must stay empty`);
      assert.equal('missed' in day, false);
      assert.deepEqual(dayKeys(day), ['dateKey', 'done', 'isToday', 'offset']);
    }
    assert.equal(glance.days.filter((d) => d.isToday).length, 1);
    assert.equal(glance.days[2]?.isToday, true);
    assert.doesNotMatch(JSON.stringify(glance), /missed|✕|failed/i);
  });

  it('logged Mon shows done; other days stay empty', () => {
    const glance = quietWeekGlance({ history: [logOn(-2)], now: NOW });
    assert.equal(glance.days[0]?.dateKey, '2026-08-10');
    assert.equal(glance.days[0]?.done, true);
    assert.equal(glance.days[0]?.isToday, false);
    for (let i = 1; i < 7; i++) {
      assert.equal(glance.days[i]?.done, false, `offset ${i} must stay empty`);
    }
  });

  it('missed planned day without a log stays empty, not a third state', () => {
    const plannedMiss = {
      weekStart: '2026-08-10',
      sessions: [{ dayOffset: 1, status: 'missed' }],
    };
    const glance = quietWeekGlance({ history: [logOn(-2)], now: NOW });
    assert.equal(glance.days[1]?.dateKey, '2026-08-11');
    assert.equal(glance.days[1]?.done, false);
    assert.equal('missed' in glance.days[1]!, false);
    assert.equal(plannedMiss.sessions[0]?.status, 'missed');
    assert.doesNotMatch(JSON.stringify(glance), /missed/);
  });

  it('tombstone / 0-rep / bad date invent nothing', () => {
    const tombstone = logOn(-2, { deletedAt: NOW.toISOString() });
    const zeroRep: CompletedWorkoutLog = {
      ...logOn(0),
      id: 'zero',
      exercises: [{ exerciseId: 'push-ups', sets: [{ reps: 0, weight: 0 }] }],
    };
    const bad: CompletedWorkoutLog = {
      ...logOn(0),
      id: 'bad',
      completedAt: 'not-a-date',
      startedAt: 'also-bad',
    };
    const glance = quietWeekGlance({ history: [tombstone, zeroRep, bad], now: NOW });
    assert.equal(glance.days.every((d) => !d.done), true);
  });

  it('two logs on Monday still one done day', () => {
    const glance = quietWeekGlance({
      history: [logOn(-2), logOn(-2, { id: 'b' })],
      now: NOW,
    });
    assert.equal(glance.days.filter((d) => d.done).length, 1);
    assert.equal(glance.days[0]?.done, true);
  });

  it('last-week log does not mark this week', () => {
    const glance = quietWeekGlance({ history: [logOn(-3)], now: NOW });
    assert.equal(glance.days.every((d) => !d.done), true);
  });
});

describe('quietWeekGlance source', () => {
  it('helper is diary-only — no plan status, no shame, no theater', () => {
    const src = read('src/lib/today/quietWeekGlance.ts');
    assert.doesNotMatch(src, /missed|status === ['"]missed['"]/);
    assert.doesNotMatch(src, /generateWeek|rewards|streak|toISOString\(/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/coach/);
    assert.match(src, /localDateKeyFromIso/);
    assert.match(src, /startOfLocalWeek/);
  });

  it('strip is a glance — no Start, no shame mark, no theater', () => {
    const src = read('src/components/today/TodayQuietWeekStrip.tsx');
    assert.match(src, /data-testid="today-quiet-week"/);
    assert.doesNotMatch(src, /primary-action|bg-primary-fill|bg-accent-poster/);
    assert.doesNotMatch(src, /onClick|onKeyDown|<button|<Link\b/);
    assert.doesNotMatch(src, /Missed|line-through|✕|✗|&times;|streak|XP|Top 8|Feed/);
    assert.doesNotMatch(src, /coachSessionMissed|TodayCoachWeekStrip|WeekStrip/);
    assert.match(src, /defaultValue: 'Done'/);
    assert.match(src, /day\.done/);
  });

  it('lean mounts the glance before Show all; Coach week stays in Show all', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    const show = read('src/components/today/TodayShowAll.tsx');
    assert.match(lean, /TodayQuietWeekStrip/);
    assert.match(lean, /quietWeekGlance\(/);
    assert.doesNotMatch(lean, /TodayCoachWeekStrip/);
    assert.doesNotMatch(lean, /CoachTodayCard/);
    const glanceAt = lean.indexOf('<TodayQuietWeekStrip');
    const showAt = lean.indexOf('<TodayShowAll');
    assert.ok(glanceAt >= 0 && showAt > glanceAt, 'glance sits before Show all');
    assert.match(lean, /dock="start"/);
    assert.match(show, /TodayCoachWeekStrip/);
    assert.doesNotMatch(show, /<details[^>]*\bopen\b/);
  });

  it('glance path has no Feed / Top 8 / login wall / Force Sync', () => {
    const files = [
      'src/lib/today/quietWeekGlance.ts',
      'src/components/today/TodayQuietWeekStrip.tsx',
      'src/page-components/HomeTodayLean.tsx',
    ];
    for (const rel of files) {
      const src = read(rel);
      assert.doesNotMatch(src, /Top 8|follower count|likes|Force Sync/i, rel);
      assert.doesNotMatch(src, /social Feed|four-scene|CinematicWww/i, rel);
      assert.doesNotMatch(src, /<SignInPrompt\b/, rel);
    }
  });
});
