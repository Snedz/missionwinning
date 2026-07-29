import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { materializeTemplates } from '@/lib/workout/materializeProgram';
import { getProgramById } from '@/data/programTemplates';
import { estimate1rm } from '@/lib/coach/progress';
import type { CompletedWorkoutLog, WorkoutExerciseTemplate } from '@/types';

function log(exerciseId: string, reps: number, weight: number, daysAgo: number): CompletedWorkoutLog {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return {
    id: `l-${exerciseId}-${daysAgo}`,
    workoutName: 'S',
    startedAt: d.toISOString(),
    completedAt: d.toISOString(),
    durationSeconds: 3600,
    totalVolume: reps * weight,
    exercises: [{ exerciseId, sets: [{ reps, weight }] }],
  };
}

/** 100×5 bench history → e1RM 113 (Brzycki), the working max everything resolves against. */
const HISTORY = [log('bench-press', 5, 100, 3), log('bench-press', 5, 100, 7)];

describe('materializeTemplates', () => {
  it('resolves %-authored sets against the athlete own max and stamps prescribed', () => {
    const template: WorkoutExerciseTemplate[] = [
      {
        exerciseId: 'bench-press',
        sets: [
          { reps: 5, weight: 0, loadPct: 58.5 },
          { reps: 5, weight: 0, loadPct: 67.5 },
          { reps: 5, weight: 0, loadPct: 76.5 },
        ],
      },
    ];
    const [out] = materializeTemplates(template, HISTORY, 'metric');
    // Deleting the materializer call leaks weight 0 into every set — fails here.
    assert.ok(out.sets.every((s) => s.weight > 0), `expected real weights, got ${JSON.stringify(out.sets)}`);
    assert.ok(out.sets[0].weight < out.sets[1].weight && out.sets[1].weight < out.sets[2].weight);
    assert.equal(out.prescribed, true, 'materialized sets must ride the .175 prescribed path');
    assert.equal(out.loadPct, 76.5, 'exercise chip shows the top set percentage');
    const max = estimate1rm(100, 5);
    assert.ok(max && out.sets[2].weight <= max, 'a 76.5% set can never exceed the e1RM');
  });

  it('is provably identity with no usable history', () => {
    const template: WorkoutExerciseTemplate[] = [
      { exerciseId: 'squats', sets: [{ reps: 5, weight: 0, loadPct: 76.5 }] },
    ];
    // No fabricated max acts on anything — the .127 principle, asserted as identity.
    assert.deepEqual(materializeTemplates(template, [], 'metric'), template);
  });

  it('leaves plain templates byte-identical — only %-authored sets are touched', () => {
    const template: WorkoutExerciseTemplate[] = [
      { exerciseId: 'bench-press', sets: [{ reps: 5, weight: 60 }] },
    ];
    assert.deepEqual(materializeTemplates(template, HISTORY, 'metric'), template);
  });

  it('the free 5/3/1 ships with per-set percentages, not prose', () => {
    const program = getProgramById('free-531-bbb');
    assert.ok(program, 'free-531-bbb must exist in the free catalog');
    assert.equal(program.sessions.length, 12, '4 lifts × 3 wave weeks');
    const week3Bench = program.sessions.find((s) => s.id === 'f531-bench-3');
    assert.ok(week3Bench);
    const main = week3Bench.exercises[0];
    assert.deepEqual(
      main.sets.map((s) => s.loadPct),
      [67.5, 76.5, 85.5],
      'week 3 wave with the 90% training max baked in'
    );
    // The pairing that makes .180 + .181 the demo: import history, start 5/3/1,
    // week 1 is prescribed in the athlete's own weights.
    const [bench] = materializeTemplates([main], HISTORY, 'metric');
    assert.ok(bench.sets.every((s) => s.weight > 0));
    assert.equal(bench.prescribed, true);
  });

  it('the other two famous programs exist and are free-category', () => {
    assert.equal(getProgramById('free-gzclp')?.category, 'advanced');
    assert.equal(getProgramById('free-basic-beginner')?.category, 'beginner');
  });
});
