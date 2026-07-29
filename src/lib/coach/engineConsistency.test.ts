import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextTargets, repRangeForGoal } from '@/lib/coach/progression';
import { suggestNextSetTarget } from '@/lib/workout/nextSetTargets';
import { planSessionToTemplates } from '@/lib/coach/planSessionTemplates';
import { buildDebrief } from '@/lib/coach/debrief';
import type { PlanSession } from '@/lib/coach/types';
import type { CompletedWorkoutLog, Rpe } from '@/types';

/**
 * The two engines that decide what an athlete lifts next, checked against each other.
 *
 * `nextTargets` prescribes (goal rep range, RPE, deloads, % of e1RM); the logger's
 * `suggestNextSetTarget` suggests (double progression on the last session). Neither
 * knew the other existed: the logger assumed **8–12 reps for everyone** and had no
 * concept of a deload, so on a strength plan it said 6 where the coach said 5, and on
 * a back-off week it said "add a rep" while the coach said "×0.9".
 *
 * These are the first tests that make the two agree. They do not force one engine to
 * become the other — the division of labour is *plan prescribes, logger suggests
 * where no plan exists* — they pin the places where disagreeing would be visible to
 * the athlete on one screen.
 */

const NOW = new Date('2026-07-29T12:00:00Z');

function session(
  daysAgo: number,
  sets: { reps: number; weight: number; rpe?: Rpe }[],
  exerciseId = 'bench-press'
): CompletedWorkoutLog {
  const at = new Date(NOW.getTime() - daysAgo * 86_400_000).toISOString();
  return {
    id: `w-${daysAgo}`,
    workoutName: 'S',
    startedAt: at,
    completedAt: at,
    durationSeconds: 3600,
    deletedAt: null,
    exercises: [{ exerciseId, sets }],
    totalVolume: sets.reduce((s, x) => s + x.reps * x.weight, 0),
  };
}

const GOALS = ['strength', 'general', 'endurance', 'conditioning'] as const;

test('the logger suggests inside the goal range the coach prescribes in', () => {
  for (const goalId of GOALS) {
    const range = repRangeForGoal(goalId);
    // A history sitting at the bottom of this goal's range.
    const history = [
      session(6, [{ reps: range.min, weight: 60 }]),
      session(3, [{ reps: range.min, weight: 60 }]),
    ];
    const last = [{ reps: range.min, weight: 60 }];

    const suggestion = suggestNextSetTarget(last, 0, 'metric', {
      repMin: range.min,
      repMax: range.max,
    });

    assert.ok(suggestion, `${goalId}: expected a suggestion`);
    assert.ok(
      suggestion!.reps >= range.min && suggestion!.reps <= range.max,
      `${goalId}: suggested ${suggestion!.reps} reps outside ${range.min}-${range.max}`
    );

    const prescribed = nextTargets('bench-press', history, 'metric', goalId, 'intermediate');
    assert.ok(
      prescribed.reps >= range.min && prescribed.reps <= range.max,
      `${goalId}: prescribed ${prescribed.reps} reps outside ${range.min}-${range.max}`
    );
  }
});

test('without the range the logger contradicts an endurance plan — the bug this fixes', () => {
  // 12 reps is mid-range for endurance (12-15) but top-of-range under the old
  // hardcoded 8-12, so the logger used to jump the weight while the coach added a rep.
  const last = [{ reps: 12, weight: 40 }];
  const naive = suggestNextSetTarget(last, 0, 'metric');
  const ranged = suggestNextSetTarget(last, 0, 'metric', { repMin: 12, repMax: 15 });

  assert.equal(naive!.reason, 'add_weight', 'documents the old behaviour');
  assert.equal(ranged!.reason, 'add_reps', 'with the real range it climbs reps first');
  assert.equal(ranged!.weight, 40, 'and leaves the weight alone');
});

test('a deload prescription is never contradicted, because the logger defers to it', () => {
  // Three hard sessions at the same weight — the coach backs off.
  const hard: { reps: number; weight: number; rpe: Rpe }[] = [
    { reps: 5, weight: 100, rpe: 'hard' },
  ];
  const history = [session(9, hard), session(6, hard), session(3, hard)];
  const prescribed = nextTargets('bench-press', history, 'metric', 'strength', 'intermediate');

  assert.ok(
    prescribed.weight < 100 || prescribed.reps < 5,
    `expected a back-off, got ${prescribed.reps} x ${prescribed.weight}`
  );

  // The logger, left to itself, would push in the opposite direction.
  const naive = suggestNextSetTarget([{ reps: 5, weight: 100 }], 0, 'metric');
  assert.notEqual(naive!.reason, 'hold', 'the logger alone would add work');

  // Which is exactly why a plan session marks its exercises as prescribed: the
  // logger is bypassed entirely rather than asked to agree.
  const planned: PlanSession = {
    id: 's1',
    dayOffset: 0,
    kind: 'strength',
    name: 'Push',
    focusGroups: [],
    estMinutes: 45,
    status: 'planned',
    exercises: [
      {
        exerciseId: 'bench-press',
        sets: 3,
        reps: prescribed.reps,
        weight: prescribed.weight,
        whyKey: 'coachWhyDeload',
      },
    ],
  };
  const templates = planSessionToTemplates(planned);
  assert.equal(templates[0].prescribed, true, 'plan sessions must be marked prescribed');
  assert.equal(templates[0].sets[0].reps, prescribed.reps);
  assert.equal(templates[0].sets[0].weight, prescribed.weight);
});

test('every plan session carries the prescribed flag', () => {
  const planned: PlanSession = {
    id: 's2',
    dayOffset: 1,
    kind: 'strength',
    name: 'Pull',
    focusGroups: [],
    estMinutes: 40,
    status: 'planned',
    exercises: [
      { exerciseId: 'row', sets: 3, reps: 8, weight: 60, whyKey: 'coachWhyHold' },
      { exerciseId: 'pull-ups', sets: 3, reps: 6, weight: 0, whyKey: 'coachWhyBodyweightReps' },
    ],
  };
  const templates = planSessionToTemplates(planned);
  assert.equal(templates.length, 2);
  for (const t of templates) {
    assert.equal(t.prescribed, true, `${t.exerciseId} must be marked`);
  }
  // Bodyweight work has no loadPct, and must still be prescribed.
  assert.equal(templates[1].loadPct, undefined);
  assert.equal(templates[1].prescribed, true);
});

/**
 * The debrief and the prescription must come from one stall truth (`.178`).
 *
 * Before this, `progression.ts` held a private `stalled()` (three identical sessions)
 * while `progress.ts` exported `plateaued` ("the best is old") to **no consumers**. So
 * the engine could deload on one definition while the module owning strength truth
 * disagreed, and the richer signal was computed and discarded. Same defect as `.174`
 * and `.175`, one layer down.
 */
test('when the debrief names a plateau, the plan never prescribes an increase', () => {
  const history = [
    session(0, [{ reps: 5, weight: 102.5 }]),
    session(3, [{ reps: 5, weight: 100 }]),
    session(6, [{ reps: 5, weight: 102.5 }]),
    session(9, [{ reps: 5, weight: 100 }]),
    session(12, [{ reps: 5, weight: 120 }]),
  ];

  const debrief = buildDebrief({ log: history[0], history: history.slice(1), now: NOW });
  const plateau = debrief.lines.find((l) => l.kind === 'plateau');
  assert.ok(plateau, 'expected the debrief to name the plateau');

  const t = nextTargets('bench-press', history, 'metric', 'strength', 'intermediate');
  assert.ok(
    t.weight < 102.5,
    `debrief said plateau but the plan prescribed ${t.weight}`
  );
  assert.equal(t.whyKey, 'coachWhyPlateauDeload');
});

test('a plateau deload is never held back by a high load zone', () => {
  // `.177` caps rises. It must never cap a decrease, or the two engines fight.
  const history = [
    session(0, [{ reps: 5, weight: 102.5 }]),
    session(3, [{ reps: 5, weight: 100 }]),
    session(6, [{ reps: 5, weight: 102.5 }]),
    session(9, [{ reps: 5, weight: 100 }]),
    session(12, [{ reps: 5, weight: 120 }]),
  ];
  const high = nextTargets('bench-press', history, 'metric', 'strength', 'intermediate', 'high');
  const plain = nextTargets('bench-press', history, 'metric', 'strength', 'intermediate');
  assert.deepEqual(high, plain);
});
