import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isLandingV2Enabled } from './landingV2Flag';
import { landingPreviewWeek } from './coach/landingPreviewWeek';

test('the landing preview requires an explicit opt-in', () => {
  assert.equal(isLandingV2Enabled({}), false);
  assert.equal(isLandingV2Enabled({ LANDING_V2_PREVIEW: 'false' }), false);
  assert.equal(isLandingV2Enabled({ LANDING_V2_PREVIEW: '1' }), false);
  assert.equal(isLandingV2Enabled({ LANDING_V2_PREVIEW: 'true' }), true);
});

test('the sample planner rebuilds after the missed day without rewriting its original week', () => {
  const offsets = (plan: ReturnType<typeof landingPreviewWeek>) => plan.map((session) => session.dayOffset);
  assert.deepEqual(offsets(landingPreviewWeek('dumbbells', 3)), [2, 4, 6]);
  assert.deepEqual(offsets(landingPreviewWeek('dumbbells', 3, 2)), [3, 5, 6]);
  assert.deepEqual(offsets(landingPreviewWeek('dumbbells', 3, 6)), []);
  assert.deepEqual(offsets(landingPreviewWeek('dumbbells', 3)), [2, 4, 6]);
  assert.ok(landingPreviewWeek('bodyweight', 3, 2).every((session) => session.exercises.length > 0));
});
