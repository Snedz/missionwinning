import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { countSpectrumSlots, shouldAwardPerfectWeek } from '@/lib/rewards/perfectWeek';

describe('perfectWeek', () => {
  it('counts train + fuel + non-train pillars', () => {
    assert.equal(
      countSpectrumSlots({ trainSessionsThisWeek: 2, fuelDaysThisWeek: 1, distinctNonTrainPillars: 2 }),
      4
    );
  });

  it('awards when goal met and spectrum ≥ 4', () => {
    assert.equal(
      shouldAwardPerfectWeek({
        sessionsThisWeek: 3,
        trainGoal: 3,
        fuelDaysThisWeek: 1,
        distinctNonTrainPillars: 2,
      }),
      true
    );
  });

  it('refuses under train goal', () => {
    assert.equal(
      shouldAwardPerfectWeek({
        sessionsThisWeek: 2,
        trainGoal: 3,
        fuelDaysThisWeek: 5,
        distinctNonTrainPillars: 4,
      }),
      false
    );
  });

  it('refuses thin spectrum even when train goal met', () => {
    assert.equal(
      shouldAwardPerfectWeek({
        sessionsThisWeek: 3,
        trainGoal: 3,
        fuelDaysThisWeek: 0,
        distinctNonTrainPillars: 1,
      }),
      false
    );
  });
});
