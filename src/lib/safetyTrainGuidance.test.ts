/**
 * Safety screens used to leave train-now copy in place.
 * These cases fail if getCoachInsight, Just Go, chat, or nudges ignore the flag.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { computeBodyScores, computeReadiness, getCoachInsight, getRecommendedFocus } from '@/lib/score';
import { applyCrossPillarCoachRules } from '@/lib/crossPillarCoach';
import { buildJustGoHeroMeta, resolveJustGoHeroCopy } from '@/lib/justGoHeroMeta';
import { decideNudge } from '@/lib/nudgeCopy';
import { scoreParqAnswers } from '@/lib/journey/parqIntake';
import { coachInsightMessageDefaults } from '@/lib/readinessDisplay';
import { HARD_SESSION_STOP_DEFAULT, HARD_SESSION_STOP_PREGNANCY } from '@/lib/pregnancySafety';
import {
  COACH_INSIGHT_HIGH_RISK_COPY,
  PARQ_NOTES_MODERATE,
  guardCoachReply,
  guardHeroCopy,
  guardNudgeCandidate,
  isTrainNowCopy,
  presentTrainCta,
  reportSafetyKind,
  resolveSafetyTrainGuidance,
} from '@/lib/safetyTrainGuidance';

const root = path.join(import.meta.dirname, '..', '..');

function primedScores() {
  return { ...computeBodyScores([]), readiness: 80, strain: 20 };
}

function focus() {
  return getRecommendedFocus(computeReadiness([]));
}

test('high-risk copy and the moderate note stay the existing sentences', () => {
  assert.equal(
    coachInsightMessageDefaults('Legs').coachInsightHighRisk,
    COACH_INSIGHT_HIGH_RISK_COPY
  );
  const locale = readFileSync(path.join(root, 'src/i18n/firstStepsLocales.ts'), 'utf8');
  assert.match(locale, /Some flags\. Train, but get medical advice if anything worsens\./);
  assert.equal(
    PARQ_NOTES_MODERATE,
    'Some flags. Train, but get medical advice if anything worsens.'
  );
});

test('pregnancy withhold replaces primed train-now insight', () => {
  const insight = getCoachInsight(primedScores(), focus(), { pregnancyFlag: 'pregnant' });
  assert.equal(insight.messageKey, 'hardSessionStopPregnancy');
  assert.notEqual(insight.actionPath, '/active');
  assert.notEqual(insight.actionLabelKey, 'coachActionStartWorkout');
  assert.equal(insight.actionPath, '/move');
});

test('moderate assessment is not Start workout when readiness is high', () => {
  const insight = getCoachInsight(primedScores(), focus(), { assessmentRisk: 'moderate' });
  assert.notEqual(insight.actionLabelKey, 'coachActionStartWorkout');
  assert.notEqual(insight.messageKey, 'coachInsightPrimed');
  assert.equal(insight.messageKey, 'firstStepParqNotesModerate');
  assert.equal(insight.actionPath, '/log');
});

test('pain or injury withholds /active', () => {
  const insight = getCoachInsight(primedScores(), focus(), { painOrInjury: true });
  assert.notEqual(insight.actionPath, '/active');
  assert.equal(insight.messageKey, 'hardSessionStop');
});

test('a hard session softens instead of Start workout', () => {
  const insight = getCoachInsight(primedScores(), focus(), { hardSession: true });
  assert.notEqual(insight.actionLabelKey, 'coachActionStartWorkout');
  assert.equal(insight.messageKey, 'hardSessionStop');
  assert.match(HARD_SESSION_STOP_DEFAULT, /chest pain/);
  const decision = resolveSafetyTrainGuidance({ hardSession: true });
  assert.equal(decision.mode, 'soften');
  assert.equal(decision.copy, HARD_SESSION_STOP_DEFAULT);
});

test('assessment high still sends recovery, and a clear athlete stays primed', () => {
  const high = getCoachInsight(primedScores(), focus(), { assessmentRisk: 'high' });
  assert.equal(high.messageKey, 'coachInsightHighRisk');
  assert.equal(high.actionPath, '/move');
  const clear = getCoachInsight(primedScores(), focus(), {});
  assert.equal(clear.messageKey, 'coachInsightPrimed');
  assert.equal(clear.actionPath, '/active');
  assert.equal(clear.actionLabelKey, 'coachActionStartWorkout');
});

test('cross-pillar does not replace a safety insight with a train push', () => {
  const scores = { ...primedScores(), strain: 50 };
  const insight = getCoachInsight(scores, focus(), { pregnancyFlag: 'postpartum' });
  const out = applyCrossPillarCoachRules(scores, focus(), insight, {
    trainDays: 3,
    proteinDays: 0,
  });
  assert.equal(out.messageKey, insight.messageKey);
  assert.equal(out.actionPath, '/move');
});

test('Just Go hero under pregnancy does not say ready to train', () => {
  const meta = buildJustGoHeroMeta({
    hasActiveWorkout: false,
    trainReady: true,
    focusLabel: 'Training',
    coach: null,
  });
  assert.ok(meta);
  const copy = resolveJustGoHeroCopy(meta);
  const guarded = guardHeroCopy(copy, resolveSafetyTrainGuidance({ pregnancyFlag: 'pregnant' }));
  const blob = [guarded.defaultTitle, guarded.defaultKicker, guarded.defaultDesc, guarded.defaultLabel].join(' ');
  assert.doesNotMatch(blob, /just go|ready to train|primed to train/i);
  assert.match(blob, /bleeding/);
  assert.match(HARD_SESSION_STOP_PREGNANCY, /cramping/);
  assert.match(blob, /cramping|bleeding/);
});

test('a pain report drops a Just go train reply; a brace cue does not', () => {
  const decision = resolveSafetyTrainGuidance({ reportText: 'my knee hurts' });
  assert.equal(decision.mode, 'withhold');
  const guarded = guardCoachReply(
    { message: 'Just go train.', actionLabel: 'Train', actionPath: '/active' },
    decision
  );
  assert.notEqual(guarded.actionPath, '/active');
  assert.equal(guarded.message, HARD_SESSION_STOP_DEFAULT);
  const brace = guardCoachReply(
    { message: 'Brace hard.', actionLabel: 'Train', actionPath: '/active' },
    resolveSafetyTrainGuidance({ reportText: 'How should I brace?' })
  );
  assert.equal(brace.actionPath, '/active');
  assert.equal(brace.message, 'Brace hard.');
  assert.equal(reportSafetyKind('I have no pain'), null);
});

test('a comeback nudge with a pregnancy flag does not say start now', () => {
  const now = new Date();
  const quiet = new Date(now.getTime() - 9 * 86_400_000).toISOString();
  const nudge = decideNudge({
    email: 'a@b.test',
    userId: 'u1',
    createdAt: new Date(now.getTime() - 40 * 86_400_000).toISOString(),
    workoutDays: [quiet.slice(0, 10)],
    workoutCount14d: 1,
    totalVolume14d: 0,
    daysPerWeek: 3,
    now,
    appUrl: 'https://example.test',
    unsubscribeUrl: 'https://example.test/unsub',
    safety: { pregnancyFlag: 'pregnant' },
  });
  assert.ok(nudge);
  assert.equal(nudge.kind, 'comeback');
  assert.doesNotMatch(nudge.body, /start now/i);
  assert.match(nudge.body, /bleeding|cramping/);
  assert.match(nudge.push.body, /bleeding|cramping/);
  const plain = guardNudgeCandidate(nudge, resolveSafetyTrainGuidance({}));
  assert.equal(plain.body, nudge.body);
});

test('withhold does not start a recommendation; the logger still starts', () => {
  const decision = resolveSafetyTrainGuidance({ pregnancyFlag: 'miscarriage_recovery' });
  const rec = presentTrainCta(decision, { labelKey: 'justGoCta', defaultLabel: 'Just Go' });
  assert.equal(rec.startsWorkout, false);
  assert.equal(rec.href, '/move');
  assert.equal(rec.defaultLabel, 'Try recovery flow');
  const logger = presentTrainCta(
    decision,
    { labelKey: 'activeStartWorkout', defaultLabel: 'Start Workout' },
    { logger: true }
  );
  assert.equal(logger.startsWorkout, true);
  assert.equal(logger.defaultLabel, 'Log set');
  assert.equal(logger.href, null);
});

test('pain history does not loosen PAR-Q risk, and a pain snapshot withholds', () => {
  assert.equal(scoreParqAnswers({ pain_history: 'yes' }).risk, 'low');
  assert.equal(scoreParqAnswers({ chest_pain: 'yes' }).risk, 'moderate');
  assert.equal(
    scoreParqAnswers({ chest_pain: 'yes', fainting: 'yes', heart: 'yes' }).risk,
    'high'
  );
  const held = resolveSafetyTrainGuidance({ assessmentRisk: 'low', painOrInjury: true });
  assert.equal(held.mode, 'withhold');
  assert.equal(held.kind, 'pain');
});

test('stop lines and the understand button are not train-now copy', () => {
  assert.equal(isTrainNowCopy(HARD_SESSION_STOP_PREGNANCY), false);
  assert.equal(isTrainNowCopy(HARD_SESSION_STOP_DEFAULT), false);
  assert.equal(isTrainNowCopy('I understand — start'), false);
  assert.equal(isTrainNowCopy('Just Go'), true);
  assert.equal(isTrainNowCopy('Start this session'), true);
  assert.equal(isTrainNowCopy('Ready to train'), true);
});
