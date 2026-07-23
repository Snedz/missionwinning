import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { summarizeWeekDose } from './weekDose.ts';
import type { CoachPlan, PlanSession } from './types.ts';

function session(partial: Partial<PlanSession> & Pick<PlanSession, 'id' | 'kind'>): PlanSession {
  return {
    dayOffset: 0,
    name: 'S',
    focusGroups: [],
    exercises: [],
    estMinutes: 45,
    status: 'planned',
    ...partial,
  };
}

function plan(sessions: PlanSession[]): CoachPlan {
  return {
    revision: 1,
    weekStart: '2026-07-20',
    daysPerWeek: sessions.length,
    sessions,
    generatedAt: '2026-07-20T00:00:00.000Z',
    contextHash: 't',
    equipmentProfile: 'bodyweight',
  };
}

describe('summarizeWeekDose', () => {
  it('counts sessions and picks strength intent', () => {
    const d = summarizeWeekDose(
      plan([
        session({ id: 'a', kind: 'strength', dayOffset: 0 }),
        session({ id: 'b', kind: 'strength', dayOffset: 2 }),
        session({ id: 'c', kind: 'recovery', dayOffset: 4, estMinutes: 20 }),
      ])
    );
    assert.equal(d.sessionCount, 3);
    assert.equal(d.strengthCount, 2);
    assert.equal(d.recoveryCount, 1);
    assert.equal(d.estMinutes, 110);
    assert.equal(d.intent, 'mixed');
  });

  it('labels all-strength weeks', () => {
    const d = summarizeWeekDose(
      plan([
        session({ id: 'a', kind: 'strength' }),
        session({ id: 'b', kind: 'strength', dayOffset: 2 }),
      ])
    );
    assert.equal(d.intent, 'strength');
  });
});
