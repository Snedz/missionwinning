import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { holdPrescriptionsInPlan } from '@/lib/coach/pregnancyHold';
import { buildCoachContextFromInputs } from '@/lib/coach/contextBuilder';
import type { CoachPlan } from '@/lib/coach/types';
import { CLINICIAN_HOLD_WHY_KEY } from '@/lib/pregnancySafety';
import type { CompletedWorkoutLog } from '@/types';

function easyBench(daysAgo: number): CompletedWorkoutLog {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return {
    id: `log-${daysAgo}`,
    workoutName: 'Push',
    startedAt: d.toISOString(),
    completedAt: d.toISOString(),
    durationSeconds: 1200,
    totalVolume: 1000,
    exercises: [
      {
        exerciseId: 'bench-press',
        sets: [
          { reps: 8, weight: 60, rpe: 'easy' },
          { reps: 8, weight: 60, rpe: 'easy' },
        ],
      },
    ],
  };
}

function planWithJump(status: CoachPlan['sessions'][0]['status'] = 'planned'): CoachPlan {
  return {
    revision: 1,
    weekStart: 'week',
    daysPerWeek: 3,
    generatedAt: new Date().toISOString(),
    contextHash: 'x',
    equipmentProfile: 'full-gym',
    sessions: [
      {
        id: 's1',
        dayOffset: 0,
        kind: 'strength',
        name: 'Push',
        focusGroups: ['Chest'],
        estMinutes: 40,
        status,
        exercises: [
          {
            exerciseId: 'bench-press',
            sets: 3,
            reps: 8,
            weight: 80,
            whyKey: 'coachWhyLoadUp',
            loadPct: 85,
          },
        ],
      },
    ],
  };
}

describe('holdPrescriptionsInPlan', () => {
  it('is identity when the flag is none', () => {
    const ctx = buildCoachContextFromInputs({
      history: [easyBench(0)],
      includeCheckIn: false,
      pregnancyFlag: 'none',
      seedId: 'hold-none',
    });
    const plan = planWithJump();
    assert.equal(holdPrescriptionsInPlan(plan, ctx), plan);
  });

  it('strips a load jump from a planned session when pregnant', () => {
    const ctx = buildCoachContextFromInputs({
      history: [easyBench(0)],
      includeCheckIn: false,
      pregnancyFlag: 'pregnant',
      experience: 'intermediate',
      equipment: 'full-gym',
      goal: 'goal:strength',
      seedId: 'hold-preg',
    });
    const out = holdPrescriptionsInPlan(planWithJump('planned'), ctx);
    const ex = out.sessions[0]!.exercises[0]!;
    assert.notEqual(ex.whyKey, 'coachWhyLoadUp');
    assert.ok(ex.weight < 80);
    assert.equal(ex.whyKey, CLINICIAN_HOLD_WHY_KEY);
    assert.ok(out.revision > 1);
  });

  it('does not rewrite a done session', () => {
    const ctx = buildCoachContextFromInputs({
      history: [easyBench(0)],
      includeCheckIn: false,
      pregnancyFlag: 'pregnant',
      seedId: 'hold-done',
    });
    const plan = planWithJump('done');
    const out = holdPrescriptionsInPlan(plan, ctx);
    assert.equal(out.sessions[0]!.exercises[0]!.whyKey, 'coachWhyLoadUp');
    assert.equal(out.sessions[0]!.exercises[0]!.weight, 80);
  });
});
