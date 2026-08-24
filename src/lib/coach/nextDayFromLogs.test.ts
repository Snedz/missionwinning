import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { CompletedWorkoutLog } from '@/types';
import type { CoachPlan, PlanSession } from '@/lib/coach/types';
import { nextDayFromLogs } from './nextDayFromLogs.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

const NOW = { weekStart: '2026-08-17', dayOffset: 0 };
const TWO_DAYS_LATER = { weekStart: '2026-08-17', dayOffset: 2 };

function log(
  over: Partial<CompletedWorkoutLog> & Pick<CompletedWorkoutLog, 'id' | 'workoutName'>
): CompletedWorkoutLog {
  return {
    startedAt: '2026-08-17T10:00:00.000Z',
    completedAt: '2026-08-17T11:00:00.000Z',
    durationSeconds: 3600,
    totalVolume: 1000,
    exercises: [
      {
        exerciseId: 'bench-press',
        sets: [{ reps: 5, weight: 100 }],
      },
    ],
    ...over,
  };
}

function session(over: Partial<PlanSession> & Pick<PlanSession, 'id' | 'dayOffset' | 'name'>): PlanSession {
  return {
    kind: 'strength',
    focusGroups: ['Chest'],
    exercises: [{ exerciseId: 'bench-press', sets: 3, reps: 5, weight: 100, whyKey: 'hold' }],
    estMinutes: 45,
    status: 'planned',
    ...over,
  };
}

function plan(over: Partial<CoachPlan> & { sessions: PlanSession[] }): CoachPlan {
  return {
    revision: 1,
    weekStart: NOW.weekStart,
    daysPerWeek: 3,
    generatedAt: '2026-08-17T00:00:00.000Z',
    contextHash: 'x',
    equipmentProfile: 'full-gym',
    ...over,
  };
}

describe('nextDayFromLogs', () => {
  it('empty history invents nothing', () => {
    assert.equal(nextDayFromLogs({ history: [], now: NOW }), null);
  });

  it('one unnamed live log invents nothing', () => {
    assert.equal(
      nextDayFromLogs({
        history: [log({ id: 'blank', workoutName: '   ' })],
        now: NOW,
      }),
      null
    );
  });

  it('one named log is not a rotation', () => {
    assert.equal(
      nextDayFromLogs({
        history: [log({ id: 'only', workoutName: 'Push' })],
        now: NOW,
      }),
      null
    );
  });

  it('Push then Pull ⇒ next is the unused / wrap slot, stable on two calls', () => {
    const history = [
      log({ id: 'p1', workoutName: 'Push', completedAt: '2026-08-17T11:00:00.000Z' }),
      log({
        id: 'p2',
        workoutName: 'Pull',
        completedAt: '2026-08-18T11:00:00.000Z',
        exercises: [{ exerciseId: 'barbell-row', sets: [{ reps: 8, weight: 80 }] }],
      }),
    ];
    const a = nextDayFromLogs({ history, now: NOW });
    const b = nextDayFromLogs({ history, now: NOW });
    assert.ok(a);
    assert.equal(a!.source, 'logs');
    assert.equal(a!.name, 'Push');
    assert.equal(a!.template?.name, 'Push');
    assert.equal(a!.template?.exercises[0]?.exerciseId, 'bench-press');
    assert.deepEqual(a, b);
  });

  it('Push then Pull: next after Push is Pull (unused slot in a 2-name rotation)', () => {
    const history = [
      log({ id: 'p1', workoutName: 'Push', completedAt: '2026-08-17T11:00:00.000Z' }),
      log({
        id: 'p2',
        workoutName: 'Pull',
        completedAt: '2026-08-16T11:00:00.000Z',
        exercises: [{ exerciseId: 'barbell-row', sets: [{ reps: 8, weight: 80 }] }],
      }),
    ];
    // Oldest Pull, then Push — rotation [Pull, Push], last is Push, unused is Pull.
    const cite = nextDayFromLogs({ history, now: NOW });
    assert.equal(cite?.name, 'Pull');
    assert.equal(cite?.source, 'logs');
    assert.equal(cite?.template?.exercises[0]?.exerciseId, 'barbell-row');
  });

  it('same diary two days later still names the same Wednesday until that session is logged', () => {
    const history = [
      log({ id: 'p1', workoutName: 'Push', completedAt: '2026-08-17T11:00:00.000Z' }),
      log({
        id: 'p2',
        workoutName: 'Pull',
        completedAt: '2026-08-18T11:00:00.000Z',
        exercises: [{ exerciseId: 'barbell-row', sets: [{ reps: 8, weight: 80 }] }],
      }),
    ];
    const monday = nextDayFromLogs({ history, now: NOW });
    const wednesday = nextDayFromLogs({ history, now: TWO_DAYS_LATER });
    assert.equal(monday?.name, 'Push');
    assert.equal(wednesday?.name, 'Push');
    assert.equal(monday?.source, 'logs');
    assert.equal(wednesday?.source, 'logs');
  });

  it('after they log Wednesday, the following day advances (not a re-roll)', () => {
    const before = [
      log({ id: 'p1', workoutName: 'Push', completedAt: '2026-08-17T11:00:00.000Z' }),
      log({
        id: 'p2',
        workoutName: 'Pull',
        completedAt: '2026-08-18T11:00:00.000Z',
        exercises: [{ exerciseId: 'barbell-row', sets: [{ reps: 8, weight: 80 }] }],
      }),
    ];
    assert.equal(nextDayFromLogs({ history: before, now: NOW })?.name, 'Push');

    const after = [
      ...before,
      log({
        id: 'wed',
        workoutName: 'Push',
        completedAt: '2026-08-19T11:00:00.000Z',
      }),
    ];
    const next = nextDayFromLogs({ history: after, now: TWO_DAYS_LATER });
    assert.equal(next?.name, 'Pull');
    assert.notEqual(next?.name, 'Push');
  });

  it('Push · Pull · Legs with Push then Pull logged ⇒ unused slot is Legs', () => {
    const history = [
      log({ id: 'a', workoutName: 'Push', completedAt: '2026-08-10T11:00:00.000Z' }),
      log({
        id: 'b',
        workoutName: 'Pull',
        completedAt: '2026-08-11T11:00:00.000Z',
        exercises: [{ exerciseId: 'barbell-row', sets: [{ reps: 8, weight: 80 }] }],
      }),
      log({
        id: 'c',
        workoutName: 'Legs',
        completedAt: '2026-08-12T11:00:00.000Z',
        exercises: [{ exerciseId: 'squats', sets: [{ reps: 5, weight: 140 }] }],
      }),
      log({ id: 'd', workoutName: 'Push', completedAt: '2026-08-17T11:00:00.000Z' }),
      log({
        id: 'e',
        workoutName: 'Pull',
        completedAt: '2026-08-18T11:00:00.000Z',
        exercises: [{ exerciseId: 'barbell-row', sets: [{ reps: 8, weight: 80 }] }],
      }),
    ];
    const cite = nextDayFromLogs({ history, now: NOW });
    assert.equal(cite?.name, 'Legs');
    assert.equal(cite?.source, 'logs');
    assert.equal(cite?.template?.exercises[0]?.exerciseId, 'squats');
  });

  it('live Coach plan owning the next day wins over a guessed rotation', () => {
    const history = [
      log({ id: 'p1', workoutName: 'Push', completedAt: '2026-08-17T11:00:00.000Z' }),
      log({
        id: 'p2',
        workoutName: 'Pull',
        completedAt: '2026-08-18T11:00:00.000Z',
        exercises: [{ exerciseId: 'barbell-row', sets: [{ reps: 8, weight: 80 }] }],
      }),
    ];
    const live = plan({
      sessions: [
        session({ id: 'wed-plan', dayOffset: 2, name: 'Upper Strength' }),
        session({ id: 'fri-plan', dayOffset: 4, name: 'Lower Strength' }),
      ],
    });
    const cite = nextDayFromLogs({ history, plan: live, now: NOW });
    assert.equal(cite?.source, 'plan');
    assert.equal(cite?.name, 'Upper Strength');
    assert.equal(cite?.planSessionId, 'wed-plan');
    assert.equal(cite?.template, undefined);
  });

  it('stale or done plan does not steal the log rotation', () => {
    const history = [
      log({ id: 'p1', workoutName: 'Push', completedAt: '2026-08-17T11:00:00.000Z' }),
      log({
        id: 'p2',
        workoutName: 'Pull',
        completedAt: '2026-08-18T11:00:00.000Z',
        exercises: [{ exerciseId: 'barbell-row', sets: [{ reps: 8, weight: 80 }] }],
      }),
    ];
    const stale = plan({
      weekStart: '2026-08-10',
      sessions: [session({ id: 'old', dayOffset: 2, name: 'Catalog Invented' })],
    });
    assert.equal(nextDayFromLogs({ history, plan: stale, now: NOW })?.name, 'Push');

    const done = plan({
      sessions: [session({ id: 'wed', dayOffset: 2, name: 'Upper Strength', status: 'done' })],
    });
    assert.equal(nextDayFromLogs({ history, plan: done, now: NOW })?.name, 'Push');
  });

  it('tombstoned / 0-rep / deleted logs do not count', () => {
    const history = [
      log({
        id: 'gone',
        workoutName: 'Legs',
        deletedAt: '2026-08-18T00:00:00.000Z',
        completedAt: '2026-08-19T11:00:00.000Z',
      }),
      log({
        id: 'zero',
        workoutName: 'Legs',
        completedAt: '2026-08-19T12:00:00.000Z',
        exercises: [{ exerciseId: 'squats', sets: [{ reps: 0, weight: 140 }] }],
      }),
      log({ id: 'p1', workoutName: 'Push', completedAt: '2026-08-17T11:00:00.000Z' }),
      log({
        id: 'p2',
        workoutName: 'Pull',
        completedAt: '2026-08-18T11:00:00.000Z',
        exercises: [{ exerciseId: 'barbell-row', sets: [{ reps: 8, weight: 80 }] }],
      }),
    ];
    const cite = nextDayFromLogs({ history, now: NOW });
    assert.equal(cite?.name, 'Push');
    assert.notEqual(cite?.name, 'Legs');
  });
});

describe('nextDayFromLogs refuses catalog / shop / generateWeek', () => {
  const files = [
    'src/lib/coach/nextDayFromLogs.ts',
    'src/components/coach/CoachNextDayCite.tsx',
  ];

  it('mutant that calls generateWeek / catalog pick / shop / Trainer onboarding dies', () => {
    for (const rel of files) {
      const src = read(rel);
      assert.doesNotMatch(src, /generateWeek\s*\(/, rel);
      assert.doesNotMatch(src, /from ['"]@\/lib\/coach\/planEngine['"]/, rel);
      assert.doesNotMatch(src, /from ['"]@\/lib\/coach\/selector['"]/, rel);
      assert.doesNotMatch(src, /from ['"]@\/data\/exercises['"]/, rel);
      assert.doesNotMatch(src, /pickExercises|buildSession|chooseSplit/, rel);
      assert.doesNotMatch(src, /Trainer onboarding|11k catalog/i, rel);
      assert.doesNotMatch(src, /from ['"]@\/components\/auth\/SignInPrompt['"]/, rel);
    }
  });
});

describe('nextDayFromLogs wiring', () => {
  it('Today lean still one primary-action; no CoachTodayCard remount; Show all stays closed', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    const show = read('src/components/today/TodayShowAll.tsx');
    const hero = read('src/components/journey/JourneyHero.tsx');
    assert.doesNotMatch(lean, /CoachTodayCard/);
    assert.doesNotMatch(lean, /CoachNextDayCite/);
    assert.doesNotMatch(show, /<details[^>]*\bopen\b/);
    assert.match(show, /<details className=/);
    const startAt = hero.indexOf('function StartDockHero');
    const start = hero.slice(startAt);
    const buttons = start.match(/className="primary-action/g) ?? [];
    assert.equal(buttons.length, 2, 'desktop + compact each have one primary-action');
  });

  it('Coach surfaces the cite boss-adjacent and in Show all without auto-expand', () => {
    const page = read('src/page-components/CoachPage.tsx');
    const strip = read('src/components/coach/TodayCoachWeekStrip.tsx');
    const cite = read('src/components/coach/CoachNextDayCite.tsx');
    assert.match(page, /CoachNextDayCite/);
    assert.match(page, /nextDayFromLogs\(/);
    assert.match(strip, /CoachNextDayCite/);
    assert.match(cite, /data-testid="coach-next-day"/);
    assert.doesNotMatch(cite, /className="primary-action/);
    assert.doesNotMatch(page, /<details[^>]*\bopen\b/);
    assert.match(page, /data-testid="coach-show-all"/);
  });

  it('lean return path has no Feed / Top 8 / likes / login wall strings', () => {
    const files = [
      'src/page-components/HomeTodayLean.tsx',
      'src/lib/coach/nextDayFromLogs.ts',
      'src/components/coach/CoachNextDayCite.tsx',
    ];
    for (const rel of files) {
      const src = read(rel);
      assert.doesNotMatch(src, /Top 8|follower count|likes|comments|DMs/i, rel);
      assert.doesNotMatch(src, /social Feed|everything-app/i, rel);
      assert.doesNotMatch(src, /SignInPrompt as hero|need an account to/i, rel);
    }
  });
});
