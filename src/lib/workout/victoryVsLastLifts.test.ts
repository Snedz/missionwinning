import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { CompletedWorkoutLog } from '@/types';
import {
  formatLiftDelta,
  liftDeltaClass,
  pickPriorSameTemplate,
  topLiftDeltas,
} from './victoryVsLastLifts.ts';
import { normalizeVictoryDiaryLine, victoryDiaryBlocksSave, VICTORY_DIARY_MAX } from './victoryDiaryLine.ts';

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(15, 0, 0, 0);
  return d.toISOString();
}

function log(
  partial: Partial<CompletedWorkoutLog> & Pick<CompletedWorkoutLog, 'id' | 'workoutName'>
): CompletedWorkoutLog {
  return {
    startedAt: daysAgo(3),
    completedAt: daysAgo(3),
    durationSeconds: 1200,
    exercises: [],
    totalVolume: 0,
    ...partial,
  };
}

test('same template name compares volume; a different name is a first time', () => {
  const prior = log({
    id: 'prior',
    workoutName: 'Push',
    completedAt: daysAgo(4),
    exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 80 }] }],
  });
  const current = log({
    id: 'now',
    workoutName: '  push ',
    completedAt: daysAgo(1),
    exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] }],
  });
  const pull = log({
    id: 'pull',
    workoutName: 'Pull',
    completedAt: daysAgo(2),
    exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 200 }] }],
  });
  assert.equal(pickPriorSameTemplate(current, [pull, prior])?.id, 'prior');
  const [row] = topLiftDeltas(current, [pull, prior]);
  assert.ok(row);
  assert.equal(row.name, 'Bench Press');
  assert.equal(row.volume, 500);
  assert.equal(row.priorVolume, 400);
  assert.equal(row.delta, 100);
  assert.equal(row.tone, 'up');
  assert.equal(liftDeltaClass(row.tone), 'text-status-ok');
  assert.equal(formatLiftDelta(row.delta!), '+100');
});

test('a drop versus last time is amber, never a shame tone', () => {
  const prior = log({
    id: 'prior',
    workoutName: 'Push',
    completedAt: daysAgo(3),
    exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] }],
  });
  const current = log({
    id: 'now',
    workoutName: 'Push',
    completedAt: daysAgo(1),
    exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 80 }] }],
  });
  const [row] = topLiftDeltas(current, [prior]);
  assert.equal(row?.delta, -100);
  assert.equal(row?.tone, 'flat');
  assert.equal(liftDeltaClass('flat'), 'text-status-warn');
  assert.equal(formatLiftDelta(-100), '−100');
  assert.equal(liftDeltaClass('up'), 'text-status-ok');
  assert.notEqual(liftDeltaClass('flat'), 'text-status-danger');
  assert.notEqual(liftDeltaClass('first'), 'text-status-danger');
});

test('first time on a name invents no delta and no red class', () => {
  const current = log({
    id: 'now',
    workoutName: 'Push',
    completedAt: daysAgo(0),
    exercises: [{ exerciseId: 'squats', sets: [{ reps: 5, weight: 100 }] }],
  });
  const [row] = topLiftDeltas(current, []);
  assert.equal(row?.tone, 'first');
  assert.equal(row?.delta, null);
  assert.equal(row?.priorVolume, null);
  assert.equal(liftDeltaClass('first'), '');
});

test('warmup is skipped and only the top three lifts return', () => {
  const current = log({
    id: 'now',
    workoutName: 'Full',
    completedAt: daysAgo(0),
    exercises: [
      {
        exerciseId: 'bench-press',
        sets: [
          { reps: 10, weight: 40, kind: 'warmup' },
          { reps: 5, weight: 100 },
        ],
      },
      { exerciseId: 'squats', sets: [{ reps: 5, weight: 140 }] },
      { exerciseId: 'deadlift', sets: [{ reps: 3, weight: 180 }] },
      { exerciseId: 'overhead-press', sets: [{ reps: 8, weight: 40 }] },
      { exerciseId: 'pull-ups', sets: [{ reps: 8, weight: 0 }] },
    ],
  });
  const rows = topLiftDeltas(current, []);
  assert.equal(rows.length, 3);
  assert.deepEqual(
    rows.map((r) => r.exerciseId),
    ['squats', 'deadlift', 'bench-press']
  );
  assert.equal(rows[2]?.volume, 500);
});

test('a new lift on a known template is first, not a zero', () => {
  const prior = log({
    id: 'prior',
    workoutName: 'Push',
    completedAt: daysAgo(2),
    exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] }],
  });
  const current = log({
    id: 'now',
    workoutName: 'Push',
    completedAt: daysAgo(0),
    exercises: [{ exerciseId: 'overhead-press', sets: [{ reps: 5, weight: 40 }] }],
  });
  const [row] = topLiftDeltas(current, [prior]);
  assert.equal(row?.tone, 'first');
  assert.equal(row?.delta, null);
});

test('one-line diary never blocks save', () => {
  assert.equal(normalizeVictoryDiaryLine('  hips felt easy \n next time heavier  '), 'hips felt easy next time heavier');
  assert.equal(normalizeVictoryDiaryLine('   '), '');
  assert.equal(normalizeVictoryDiaryLine(null), '');
  const long = 'a'.repeat(VICTORY_DIARY_MAX + 20);
  assert.equal(normalizeVictoryDiaryLine(long).length, VICTORY_DIARY_MAX);
  assert.equal(victoryDiaryBlocksSave(''), false);
  assert.equal(victoryDiaryBlocksSave(long), false);
  assert.equal(victoryDiaryBlocksSave(undefined), false);
});

test('vs-last headline counts only compared lifts; all-new is an honest first time (.1145)', async () => {
  const { vsLastHeadline } = await import('./victoryVsLastLifts.ts');
  assert.equal(vsLastHeadline([]), null);
  assert.equal(vsLastHeadline(null), null);
  const first = { exerciseId: 'a', name: 'A', volume: 100, priorVolume: null, delta: null, tone: 'first' as const };
  const up = { exerciseId: 'b', name: 'B', volume: 120, priorVolume: 100, delta: 20, tone: 'up' as const };
  const flat = { exerciseId: 'c', name: 'C', volume: 90, priorVolume: 100, delta: -10, tone: 'flat' as const };
  assert.deepEqual(vsLastHeadline([first]), { kind: 'first' });
  assert.deepEqual(vsLastHeadline([up, flat, first]), { kind: 'compared', up: 1, compared: 2 });
  assert.deepEqual(vsLastHeadline([flat]), { kind: 'compared', up: 0, compared: 1 });
});

test('vs-last strip has no feed, social or paywalled-chart copy (.1145)', async () => {
  const { readFileSync } = await import('node:fs');
  const { activeWorkoutStringsFor } = await import('../../i18n/activeWorkoutLocales.ts');
  const strip = readFileSync('src/components/workout/VictoryVsLastLifts.tsx', 'utf8');
  assert.match(strip, /victory-vs-last-headline/);
  const banned = /\b(feed|followers?|likes?|leaderboard|upgrade|premium|unlock)\b/i;
  for (const lang of ['en', 'es', 'pt']) {
    const s = activeWorkoutStringsFor(lang);
    for (const key of ['victoryVsLastHeadline', 'victoryVsLastHeadlineFirst'] as const) {
      assert.ok(s[key] && s[key].length > 0, `${lang}.${key}`);
      assert.doesNotMatch(s[key], banned, `${lang}.${key}`);
    }
  }
});
