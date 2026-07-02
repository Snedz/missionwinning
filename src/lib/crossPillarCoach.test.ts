import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { applyCrossPillarCoachRules, getCrossPillarSecondaryActions } from './crossPillarCoach.ts';
import type { BodyScores, CoachInsight, RecommendedFocus } from './score.ts';

const baseScores: BodyScores = {
  readiness: 60,
  strain: 60,
  recovery: 55,
  readinessLabelKey: 'todayBodyTrainSmart',
  strainLabelKey: 'todayBodyModerateLoad',
  recoveryLabelKey: 'todayBodyRebuilding',
};

const focus: RecommendedFocus = { group: 'push', statusKey: 'todayFocusPush' };

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
      trackActivities: 2,
      learnLessons: 2,
    });
    assert.equal(out.messageKey, 'coachInsightSteady');
  });

  it('suggests Track when training without activity logs', () => {
    const out = applyCrossPillarCoachRules(
      { ...baseScores, strain: 45 },
      focus,
      steady,
      { trainDays: 4, trackActivities: 0, moveFlows: 2, mindSessions: 1, proteinDays: 2 }
    );
    assert.equal(out.messageKey, 'coachInsightNeedTrack');
    assert.equal(out.actionPath, '/track');
  });

  it('suggests Learn when training without education engagement', () => {
    const out = applyCrossPillarCoachRules(
      { ...baseScores, readiness: 55, strain: 40 },
      focus,
      steady,
      { trainDays: 3, learnLessons: 0, moveFlows: 2, mindSessions: 1, proteinDays: 2, trackActivities: 1 }
    );
    assert.equal(out.messageKey, 'coachInsightNeedLearn');
    assert.equal(out.actionPath, '/learn');
  });
});

describe('getCrossPillarSecondaryActions', () => {
  it('returns secondary CTAs for gaps excluding primary path', () => {
    const secondary = getCrossPillarSecondaryActions(
      { ...baseScores, strain: 50, recovery: 50 },
      { moveFlows: 0, mindSessions: 0, proteinDays: 0, trainDays: 3, trackActivities: 0, learnLessons: 0 },
      '/active'
    );
    assert.ok(secondary.length >= 2);
    assert.ok(secondary.every((a) => a.actionPath !== '/active'));
    assert.ok(secondary.some((a) => a.actionPath === '/move'));
    assert.ok(secondary.some((a) => a.actionPath === '/nutrition'));
  });

  it('returns empty when assessment risk is high', () => {
    const secondary = getCrossPillarSecondaryActions(
      baseScores,
      { trainDays: 0 },
      '/move',
      { assessmentRisk: 'high' }
    );
    assert.equal(secondary.length, 0);
  });
});
