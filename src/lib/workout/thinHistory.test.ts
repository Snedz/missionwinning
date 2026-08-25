/**
 * Thin-history honesty — 1–2 live sessions are a notebook.
 *
 * Mutants: citing Wednesday from Push+Pull; scoring a streak / on-track
 * from two Done cells; overwriting a saved PPL with a log-shape.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { CompletedWorkoutLog } from '@/types';
import { nextDayFromLogs } from '@/lib/coach/nextDayFromLogs.ts';
import { quietWeekGlance } from '@/lib/today/quietWeekGlance.ts';
import { honorCiteStart } from './honorSavedRoutine.ts';
import {
  ACTIVE_TARGET_EMPTY_LINE,
  THIN_HISTORY_MAX_LIVE_SESSIONS,
  countLiveSessions,
  isThinHistory,
} from './thinHistory.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

const NOW = { weekStart: '2026-08-17', dayOffset: 0 };
const GLANCE_NOW = new Date(2026, 7, 12, 15, 0, 0);

function log(
  over: Partial<CompletedWorkoutLog> & Pick<CompletedWorkoutLog, 'id' | 'workoutName'>
): CompletedWorkoutLog {
  return {
    startedAt: '2026-08-17T10:00:00.000Z',
    completedAt: '2026-08-17T11:00:00.000Z',
    durationSeconds: 3600,
    totalVolume: 1000,
    exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] }],
    ...over,
  };
}

describe('thinHistory predicate', () => {
  it('empty / one / two live sessions are thin; three are not', () => {
    assert.equal(THIN_HISTORY_MAX_LIVE_SESSIONS, 2);
    assert.equal(isThinHistory([]), true);
    assert.equal(countLiveSessions([]), 0);
    assert.equal(isThinHistory([log({ id: 'a', workoutName: 'Push' })]), true);
    assert.equal(
      isThinHistory([
        log({ id: 'a', workoutName: 'Push' }),
        log({ id: 'b', workoutName: 'Pull', completedAt: '2026-08-18T11:00:00.000Z' }),
      ]),
      true
    );
    assert.equal(
      isThinHistory([
        log({ id: 'a', workoutName: 'Push' }),
        log({ id: 'b', workoutName: 'Pull', completedAt: '2026-08-18T11:00:00.000Z' }),
        log({ id: 'c', workoutName: 'Push', completedAt: '2026-08-19T11:00:00.000Z' }),
      ]),
      false
    );
  });

  it('tombstone / 0-rep do not count toward the diary', () => {
    const dead = log({
      id: 'gone',
      workoutName: 'Legs',
      deletedAt: '2026-08-18T00:00:00.000Z',
    });
    const zero = log({
      id: 'zero',
      workoutName: 'Legs',
      exercises: [{ exerciseId: 'squats', sets: [{ reps: 0, weight: 140 }] }],
    });
    const live = log({ id: 'p1', workoutName: 'Push' });
    assert.equal(countLiveSessions([dead, zero, live]), 1);
    assert.equal(isThinHistory([dead, zero, live]), true);
  });

  it('specified set-row empty copy stays', () => {
    assert.equal(ACTIVE_TARGET_EMPTY_LINE, 'No prior sets yet — log this one');
    const adj = read('src/lib/workout/setRowAdjacency.ts');
    assert.match(adj, /empty: true/);
    assert.match(adj, /HONEST_EMPTY/);
  });
});

describe('Wednesday does not invent a next day from thin logs', () => {
  it('Push then Pull (two sessions) invents nothing', () => {
    const history = [
      log({ id: 'p1', workoutName: 'Push', completedAt: '2026-08-17T11:00:00.000Z' }),
      log({
        id: 'p2',
        workoutName: 'Pull',
        completedAt: '2026-08-18T11:00:00.000Z',
        exercises: [{ exerciseId: 'barbell-row', sets: [{ reps: 8, weight: 80 }] }],
      }),
    ];
    assert.equal(nextDayFromLogs({ history, now: NOW }), null);
  });

  it('null cite + saved PPL still honors the notebook', () => {
    const history = [
      log({ id: 'p1', workoutName: 'Push', completedAt: '2026-08-17T11:00:00.000Z' }),
      log({
        id: 'p2',
        workoutName: 'Pull',
        completedAt: '2026-08-18T11:00:00.000Z',
        exercises: [{ exerciseId: 'barbell-row', sets: [{ reps: 8, weight: 80 }] }],
      }),
    ];
    const cite = nextDayFromLogs({ history, now: NOW });
    assert.equal(cite, null);
    const start = honorCiteStart({
      cite,
      saved: [
        {
          id: 's-push',
          name: 'Push',
          createdAt: '2026-08-10T00:00:00.000Z',
          exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 80 }] }],
        },
      ],
      history,
    });
    assert.equal(start?.source, 'saved');
    if (start?.source !== 'saved') return;
    assert.equal(start.routine.name, 'Push');
    assert.equal(start.routine.exercises[0]?.exerciseId, 'bench-press');
  });

  it('empty saved + thin history invents no program', () => {
    const history = [log({ id: 'only', workoutName: 'Push' })];
    assert.equal(nextDayFromLogs({ history, now: NOW }), null);
    assert.equal(honorCiteStart({ cite: null, saved: [], history }), null);
  });
});

describe('week strip does not score 1–2 sessions', () => {
  it('two live sessions stay thin; empty days stay empty; no consistency field', () => {
    const mon = new Date(2026, 7, 10, 12, 0, 0);
    const tue = new Date(2026, 7, 11, 12, 0, 0);
    const history = [
      log({
        id: 'm',
        workoutName: 'Push',
        startedAt: mon.toISOString(),
        completedAt: mon.toISOString(),
      }),
      log({
        id: 't',
        workoutName: 'Pull',
        startedAt: tue.toISOString(),
        completedAt: tue.toISOString(),
        exercises: [{ exerciseId: 'barbell-row', sets: [{ reps: 8, weight: 80 }] }],
      }),
    ];
    const glance = quietWeekGlance({ history, now: GLANCE_NOW });
    assert.equal(glance.thin, true);
    assert.equal(glance.days[0]?.done, true);
    assert.equal(glance.days[1]?.done, true);
    for (let i = 2; i < 7; i++) {
      assert.equal(glance.days[i]?.done, false, `offset ${i} must stay empty`);
    }
    assert.equal('streak' in glance, false);
    assert.equal('onTrack' in glance, false);
    assert.equal('consistency' in glance, false);
    assert.doesNotMatch(JSON.stringify(glance), /on track|consistency|streak/i);
    for (const day of glance.days) {
      assert.equal('missed' in day, false);
      assert.equal('streak' in day, false);
    }
  });
});

describe('thin-history wiring refuses theater', () => {
  it('Wednesday empty cite has no Start and no invented name', () => {
    const cite = read('src/components/coach/CoachNextDayCite.tsx');
    assert.match(cite, /cite\?: NextDayCite \| null/);
    assert.match(cite, /Not enough logs yet/);
    assert.match(cite, /if \(!cite\)/);
    const emptyBlock = cite.slice(cite.indexOf('if (!cite)'), cite.indexOf('const canStartLogs'));
    assert.match(emptyBlock, /data-next-day-source="empty"/);
    assert.match(emptyBlock, /coach-next-day-empty/);
    assert.doesNotMatch(emptyBlock, /startWorkout|coachNextDayStart/);
  });

  it('week strip source has no on-track / consistency / streak score', () => {
    const strip = read('src/components/today/TodayQuietWeekStrip.tsx');
    const helper = read('src/lib/today/quietWeekGlance.ts');
    assert.match(strip, /data-thin=/);
    assert.doesNotMatch(strip, /onTrack|on track|todayDayStreak|habitWeekCount/i);
    assert.doesNotMatch(helper, /onTrack|on track|todayDayStreak|habitWeekCount/i);
    assert.doesNotMatch(strip, /\bstreak\b/);
    assert.doesNotMatch(helper, /\bstreak\b/);
    assert.doesNotMatch(strip, /primary-action|XP|Top 8|Feed/);
  });

  it('first set stays ungated; no four-scene / Force Sync / Session Expired', () => {
    const files = [
      'src/lib/workout/thinHistory.ts',
      'src/lib/coach/nextDayFromLogs.ts',
      'src/components/coach/CoachNextDayCite.tsx',
      'src/lib/today/quietWeekGlance.ts',
      'src/components/today/TodayQuietWeekStrip.tsx',
    ];
    for (const rel of files) {
      const src = read(rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/i, rel);
      assert.doesNotMatch(src, /four-scene|CinematicWww|Top 8/i, rel);
      assert.doesNotMatch(src, /generateWeek\s*\(/, rel);
    }
  });
});
