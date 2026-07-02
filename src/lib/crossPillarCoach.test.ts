import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { applyCrossPillarCoachRules } from './crossPillarCoach';
import type { BodyScores, CoachInsight, RecommendedFocus } from './score';

const baseScores: BodyScores = {
  readiness: 60,
  strain: 60,
  recovery: 55,
  readinessLabelKey: 'todayBodyTrainSmart',
  strainLabelKey: 'todayBodyModerateLoad',
  recoveryLabelKey: 'todayBodyRebuilding',
};

const focus: RecommendedFocus = { group: 'Chest', statusKey: 'todayReadinessPrime' };

const steady: CoachInsight = {
  messageKey: 'coachInsightSteady',
  actionLabelKey: 'coachActionViewToday',
  actionPath: '/log',
};

describe('applyCrossPillarCoachRules', () => {
  it('suggests Move when strain is high and no mobility logged', () => {
    const out = applyCrossPillarCoachRules(
      { ...baseScores, strain: 70 },
      focus,
      steady,
      { moveFlows: 0 }
    );
    assert.equal(out.messageKey, 'coachInsightNeedMove');
    assert.equal(out.actionPath, '/move');
  });

  it('suggests Fuel when training without protein days', () => {
    const out = applyCrossPillarCoachRules(
      { ...baseScores, strain: 50 },
      focus,
      steady,
      { trainDays: 3, proteinDays: 0 }
    );
    assert.equal(out.messageKey, 'coachInsightNeedFuel');
    assert.equal(out.actionPath, '/nutrition');
  });

  it('suggests Mind when recovery is low with load and no mind sessions', () => {
    const out = applyCrossPillarCoachRules(
      { ...baseScores, recovery: 40, strain: 52 },
      focus,
      steady,
      { moveFlows: 1, mindSessions: 0 }
    );
    assert.equal(out.messageKey, 'coachInsightNeedMind');
    assert.equal(out.actionPath, '/mind');
  });

  it('passes through when pillars are balanced', () => {
    const out = applyCrossPillarCoachRules(baseScores, focus, steady, {
      moveFlows: 2,
      mindSessions: 2,
      proteinDays: 2,
      trainDays: 2,
    });
    assert.equal(out.messageKey, 'coachInsightSteady');
  });
});
