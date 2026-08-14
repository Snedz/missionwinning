import { test } from 'node:test';
import assert from 'node:assert/strict';
import { levelForXp, XP_BY_ACTION } from '@/lib/rewards/catalog';
import { applyRewardEvents, emptyRewardState } from '@/lib/rewards/engine';

test('first finished workout stays level 1', () => {
  const r = applyRewardEvents(emptyRewardState(), [
    {
      type: 'workout_finish',
      workoutId: 'w1',
      finishedAt: new Date().toISOString(),
      totalWorkoutsAfter: 1,
    },
    { type: 'journey_first_workout' },
  ]);
  const xp =
    XP_BY_ACTION.workout_finish + XP_BY_ACTION.journey_first_workout;
  assert.equal(r.xpGained, xp);
  assert.ok(r.xpGained < 150, 'first session must not reach level 2 threshold');
  assert.equal(levelForXp(r.state.xpTotal), 1);
});
