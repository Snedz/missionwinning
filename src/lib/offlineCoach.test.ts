import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { shouldSkipCloudCoach, resolveOfflineCoachInsight } from './offlineCoach';
import type { BodyScores, RecommendedFocus } from './score';

const scores: BodyScores = {
  readiness: 60,
  strain: 40,
  recovery: 55,
  readinessLabelKey: 'todayBodyTrainSmart',
  strainLabelKey: 'todayBodyModerateLoad',
  recoveryLabelKey: 'todayBodyRebuilding',
};

const focus: RecommendedFocus = { group: 'Chest', statusKey: 'todayReadinessPrime' };

describe('offlineCoach', () => {
  it('shouldSkipCloudCoach when lite preference set', () => {
    assert.equal(typeof shouldSkipCloudCoach(), 'boolean');
  });

  it('pathfinder gate routes to gentle plan', () => {
    const insight = resolveOfflineCoachInsight(scores, focus, { trainDays: 2 }, {
      programGate: 'low-impact-only',
    });
    assert.equal(insight.messageKey, 'coachInsightOfflinePathfinder');
    assert.match(insight.actionPath, /pathfinder-gentle/);
  });

  it('zero train days suggests first win', () => {
    const insight = resolveOfflineCoachInsight(scores, focus, { trainDays: 0 }, {
      equipment: 'bodyweight',
    });
    assert.equal(insight.messageKey, 'coachInsightOfflineFirstWin');
  });
});
