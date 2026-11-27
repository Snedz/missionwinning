import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  hasCoachAdaptationSignal,
  summarizeCoachAdaptations,
  todaySessionWhyKeys,
  weekdayLabel,
} from './adaptSummary.ts';
import type { CoachPlan, PlanSession } from './types.ts';

function session(partial: Partial<PlanSession> & Pick<PlanSession, 'id' | 'status'>): PlanSession {
  return {
    dayOffset: 0,
    kind: 'strength',
    name: 'Push',
    focusGroups: ['Chest'],
    exercises: [],
    estMinutes: 40,
    ...partial,
  };
}

function plan(sessions: PlanSession[], revision = 1): CoachPlan {
  return {
    revision,
    weekStart: '2026-07-20',
    daysPerWeek: 3,
    sessions,
    generatedAt: '2026-07-20T12:00:00Z',
    contextHash: 'x',
    equipmentProfile: 'bodyweight',
  };
}

describe('summarizeCoachAdaptations', () => {
  it('returns missed beat when sessions missed', () => {
    const beats = summarizeCoachAdaptations(
      plan([
        session({ id: 'a', status: 'missed', dayOffset: 0 }),
        session({ id: 'b', status: 'planned', dayOffset: 3 }),
      ])
    );
    assert.equal(beats.length, 1);
    assert.equal(beats[0].key, 'coachAdaptMissedNote');
    assert.equal(beats[0].count, 1);
  });

  it('returns swapped beat for recovery swaps', () => {
    const beats = summarizeCoachAdaptations(
      plan([session({ id: 'a', status: 'swapped', kind: 'recovery' })])
    );
    assert.equal(beats[0].key, 'coachAdaptSwappedNote');
  });

  it('returns logged beat when revision > 1 and sessions done', () => {
    const beats = summarizeCoachAdaptations(
      plan([session({ id: 'a', status: 'done' })], 2)
    );
    assert.equal(beats[0].key, 'coachAdaptLoggedNote');
  });

  it('hasCoachAdaptationSignal needs a real beat, not bare revision', () => {
    // Revision alone is empty theater after cold-start re-spread.
    assert.equal(hasCoachAdaptationSignal(plan([], 2)), false);
    assert.equal(hasCoachAdaptationSignal(plan([], 1)), false);
    assert.equal(
      hasCoachAdaptationSignal(plan([session({ id: 'a', status: 'missed' })], 1)),
      true
    );
  });

  it('names the weekday for missed sessions', () => {
    const beats = summarizeCoachAdaptations(
      plan([
        session({ id: 'a', status: 'missed', dayOffset: 0, name: 'Push' }),
        session({ id: 'b', status: 'missed', dayOffset: 2, name: 'Pull' }),
      ])
    );
    assert.equal(beats[0].days, 'Mon, Wed');
    assert.match(beats[0].defaultMessage, /Mon, Wed/);
  });

  it('todaySessionWhyKeys returns unique why keys for today', () => {
    assert.equal(weekdayLabel(0), 'Mon');
    const keys = todaySessionWhyKeys(
      plan([
        session({
          id: 'a',
          status: 'planned',
          dayOffset: 1,
          exercises: [
            {
              exerciseId: 'bench',
              sets: 3,
              reps: 5,
              weight: 60,
              whyKey: 'coachWhyLoadUp',
            },
            {
              exerciseId: 'row',
              sets: 3,
              reps: 8,
              weight: 40,
              whyKey: 'coachWhyLoadUp',
            },
            {
              exerciseId: 'curl',
              sets: 2,
              reps: 12,
              weight: 10,
              whyKey: 'coachWhyHold',
            },
          ],
        }),
      ]),
      1
    );
    assert.deepEqual(keys, ['coachWhyLoadUp', 'coachWhyHold']);
  });
});
