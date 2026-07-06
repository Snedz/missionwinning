import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { applyCrossPillarCoachRules, listCrossPillarCoachSuggestions } from './crossPillarCoach.ts';
import type { BodyScores, CoachInsight, RecommendedFocus } from './score.ts';

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

describe('listCrossPillarCoachSuggestions', () => {
  it('returns multiple chips when several pillars need attention', () => {
    const out = listCrossPillarCoachSuggestions(
      { ...baseScores, strain: 70, recovery: 40 },
      { moveFlows: 0, mindSessions: 0, trainDays: 3, proteinDays: 0, trackActivities: 0 }
    );
    const keys = out.map((o) => o.messageKey);
    assert.ok(keys.includes('coachInsightNeedMove'));
    assert.ok(keys.includes('coachInsightNeedFuel'));
    assert.ok(keys.includes('coachInsightNeedMind'));
    assert.ok(keys.includes('coachInsightNeedTrack'));
  });

  it('suggests synergy when multiple pillars are active', () => {
    const out = listCrossPillarCoachSuggestions(baseScores, {
      trainDays: 3,
      moveFlows: 2,
      mindSessions: 1,
      learnLessons: 1,
      trackActivities: 0,
    });
    assert.ok(out.some((o) => o.messageKey === 'coachInsightSynergyMultipillar'));
  });

  it('suggests Learn when training plus move/mind without courses', () => {
    const out = listCrossPillarCoachSuggestions(baseScores, {
      trainDays: 3,
      moveFlows: 1,
      learnLessons: 0,
    });
    assert.ok(out.some((o) => o.messageKey === 'coachInsightNeedLearn'));
  });

  it('suggests Fuel Coach synergy when training load bumps carbs', () => {
    const out = listCrossPillarCoachSuggestions(baseScores, {
      trainDays: 2,
      fuelCoachCarbBump: 40,
    });
    const chip = out.find((o) => o.messageKey === 'coachInsightFuelCoachSynergy');
    assert.ok(chip);
    assert.equal(chip?.messageParams?.carbs, '40');
    assert.equal(chip?.actionPath, '/nutrition');
  });
});
