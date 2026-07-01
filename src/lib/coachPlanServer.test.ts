import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseCoachPlanJson,
  ruleBasedCoachPlan,
  type CoachPlanRequest,
} from '@/lib/coachPlanServer';

const baseReq: CoachPlanRequest = {
  goal: 'general-strength',
  equipment: 'bodyweight',
  sessionsPerWeek: 3,
  weeks: 2,
  readiness: 70,
  strain: 45,
  recovery: 60,
};

describe('parseCoachPlanJson', () => {
  it('parses valid plan JSON with bodyweight exercises', () => {
    const raw = JSON.stringify({
      name: '2-Week Bodyweight Start',
      description: 'Build consistency.',
      duration: '2 weeks',
      focus: 'General strength',
      sessions: [
        {
          id: 'w1d1',
          name: 'Week 1 Day A',
          exercises: [
            { exerciseId: 'push-ups', sets: [{ reps: 10, weight: 0 }] },
            { exerciseId: 'glute-bridge', sets: [{ reps: 12, weight: 0 }] },
            { exerciseId: 'plank', sets: [{ reps: 30, weight: 0 }] },
          ],
        },
        {
          id: 'w1d2',
          name: 'Week 1 Day B',
          exercises: [
            { exerciseId: 'bird-dog', sets: [{ reps: 10, weight: 0 }] },
            { exerciseId: 'superman', sets: [{ reps: 12, weight: 0 }] },
            { exerciseId: 'cat-camel', sets: [{ reps: 8, weight: 0 }] },
          ],
        },
      ],
    });

    const plan = parseCoachPlanJson(raw, baseReq);
    assert.ok(plan);
    assert.equal(plan!.source, 'llm');
    assert.equal(plan!.sessions.length, 2);
    assert.equal(plan!.sessions[0].exercises[0].exerciseId, 'push-ups');
  });

  it('rejects unknown exercise ids', () => {
    const raw = JSON.stringify({
      name: 'Bad plan',
      sessions: [
        {
          id: 'x',
          name: 'Day 1',
          exercises: [
            { exerciseId: 'not-real-exercise', sets: [{ reps: 10, weight: 0 }] },
            { exerciseId: 'squats', sets: [{ reps: 10, weight: 0 }] },
          ],
        },
      ],
    });
    assert.equal(parseCoachPlanJson(raw, baseReq), null);
  });
});

describe('ruleBasedCoachPlan', () => {
  it('returns at least two sessions', () => {
    const plan = ruleBasedCoachPlan(baseReq);
    assert.equal(plan.source, 'rules');
    assert.ok(plan.sessions.length >= 2);
  });
});
