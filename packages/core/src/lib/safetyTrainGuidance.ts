/**
 * One decision for "should we tell them to train right now?"
 *
 * Pregnancy, a high assessment, and reported pain withhold the recommendation.
 * A moderate assessment or a hard session keeps a path and drops train-now phrasing.
 * The free logger still starts — Log set is not a recommendation.
 *
 * Copy is the existing stop lines and PAR-Q notes. Device flags stay on device.
 */

import type { CoachInsight } from '@/lib/score';
import type { JustGoHeroCopy } from '@/lib/justGoHeroMeta';
import {
  HARD_SESSION_STOP_DEFAULT,
  HARD_SESSION_STOP_PREGNANCY,
  isPregnancySafetyHold,
  loadPregnancyFlag,
} from '@/lib/pregnancySafety';
import { type ParqSnapshot } from '@/lib/journey/parqIntake';
import { needsHardSessionWarning } from '@/lib/workout/hardSession';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson } from '@/lib/storage/safeStorage';

/** Same sentence as `coachInsightMessageDefaults` — one fact, asserted in the test. */
export const COACH_INSIGHT_HIGH_RISK_COPY =
  'Your assessment flagged elevated risk. Prioritize recovery, mobility, and light movement today.';

/** Same sentence as `firstStepParqNotesModerate`. */
export const PARQ_NOTES_MODERATE =
  'Some flags. Train, but get medical advice if anything worsens.';

export const SAFETY_HELD_MESSAGE_KEYS = [
  'hardSessionStop',
  'hardSessionStopPregnancy',
  'coachInsightHighRisk',
  'firstStepParqNotesModerate',
  'hardSessionLead',
] as const;

export type SafetyKind =
  | 'clear'
  | 'pregnancy'
  | 'assessment-high'
  | 'pain'
  | 'hard-session'
  | 'assessment-moderate';

export type SafetyMode = 'clear' | 'withhold' | 'soften';

export type SafetyTrainDecision = {
  mode: SafetyMode;
  kind: SafetyKind;
  copyKey: string | null;
  copy: string | null;
};

export type SafetyTrainInput = {
  pregnancyFlag?: string | null;
  assessmentRisk?: string | null;
  painOrInjury?: boolean;
  hardSession?: boolean;
  reportText?: string | null;
};

export const CLEAR_SAFETY_TRAIN: SafetyTrainDecision = {
  mode: 'clear',
  kind: 'clear',
  copyKey: null,
  copy: null,
};

const TRAIN_NOW_RES: readonly RegExp[] = [
  /just go/i,
  /ready to train/i,
  /primed to train/i,
  /start this session/i,
  /start workout/i,
  /start now/i,
  /go train/i,
  /log one set/i,
  /next session/i,
  /keep going/i,
  /repeat last/i,
  /log it when the rep is yours/i,
  /^start\b/i,
];

export function isTrainNowCopy(text: string | null | undefined): boolean {
  if (!text) return false;
  return TRAIN_NOW_RES.some((re) => re.test(text));
}

/** Pregnancy words, or pain/injury. "No pain" is not a report. Bare "hurt" is not a screen. */
export function reportSafetyKind(text: string | null | undefined): 'pregnancy' | 'pain' | null {
  if (!text || !text.trim()) return null;
  if (/pregnan|postpartum|miscarriage/i.test(text)) return 'pregnancy';
  const stripped = text.replace(/\bno\s+pain\b/gi, ' ');
  if (/\bpain\b|\binjur|\bbleeding\b|\bcramping\b|\bfaint|\bhurts?\b/i.test(stripped)) return 'pain';
  return null;
}

function withhold(
  kind: SafetyKind,
  copyKey: string,
  copy: string
): SafetyTrainDecision {
  return { mode: 'withhold', kind, copyKey, copy };
}

function soften(kind: SafetyKind, copyKey: string, copy: string): SafetyTrainDecision {
  return { mode: 'soften', kind, copyKey, copy };
}

/**
 * Priority: pregnancy, assessment high, pain/injury, hard session, moderate, clear.
 */
export function resolveSafetyTrainGuidance(input: SafetyTrainInput = {}): SafetyTrainDecision {
  const reported = reportSafetyKind(input.reportText);
  if (isPregnancySafetyHold(input.pregnancyFlag) || reported === 'pregnancy') {
    return withhold('pregnancy', 'hardSessionStopPregnancy', HARD_SESSION_STOP_PREGNANCY);
  }
  if (input.assessmentRisk === 'high') {
    return withhold('assessment-high', 'coachInsightHighRisk', COACH_INSIGHT_HIGH_RISK_COPY);
  }
  if (input.painOrInjury || reported === 'pain') {
    return withhold('pain', 'hardSessionStop', HARD_SESSION_STOP_DEFAULT);
  }
  if (input.hardSession) {
    return soften('hard-session', 'hardSessionStop', HARD_SESSION_STOP_DEFAULT);
  }
  if (input.assessmentRisk === 'moderate') {
    return soften('assessment-moderate', 'firstStepParqNotesModerate', PARQ_NOTES_MODERATE);
  }
  return CLEAR_SAFETY_TRAIN;
}

export function sessionIsHard(name: string | null | undefined): boolean {
  if (!name) return false;
  return needsHardSessionWarning({ name });
}

export function loadSafetyTrainDecision(sessionName?: string | null): SafetyTrainDecision {
  const snap = readJson<ParqSnapshot | null>(STORAGE_KEYS.lastAssessment, null);
  return resolveSafetyTrainGuidance({
    pregnancyFlag: loadPregnancyFlag(),
    assessmentRisk: snap?.risk,
    painOrInjury: snap?.painOrInjury === true,
    hardSession: sessionIsHard(sessionName),
  });
}

export type TrainCta = {
  startsWorkout: boolean;
  labelKey: string;
  defaultLabel: string;
  note: string | null;
  href: string | null;
};

export function presentTrainCta(
  decision: SafetyTrainDecision,
  fallback: { labelKey: string; defaultLabel: string },
  opts?: { logger?: boolean }
): TrainCta {
  if (decision.mode === 'clear' || !decision.copy) {
    return {
      startsWorkout: true,
      labelKey: fallback.labelKey,
      defaultLabel: fallback.defaultLabel,
      note: null,
      href: null,
    };
  }
  if (decision.mode === 'withhold') {
    if (opts?.logger) {
      return {
        startsWorkout: true,
        labelKey: 'activeLogSet',
        defaultLabel: 'Log set',
        note: decision.copy,
        href: null,
      };
    }
    return {
      startsWorkout: false,
      labelKey: 'coachActionRecoveryFlow',
      defaultLabel: 'Try recovery flow',
      note: decision.copy,
      href: '/move',
    };
  }
  const trainNow = isTrainNowCopy(fallback.defaultLabel);
  return {
    startsWorkout: true,
    labelKey: trainNow ? 'hardSessionContinue' : fallback.labelKey,
    defaultLabel: trainNow ? 'I understand — start' : fallback.defaultLabel,
    note: decision.copy,
    href: null,
  };
}

export function guardHeroCopy(
  copy: JustGoHeroCopy,
  decision: SafetyTrainDecision
): JustGoHeroCopy {
  if (decision.mode === 'clear' || !decision.copy || !decision.copyKey) return copy;
  const cta = presentTrainCta(decision, {
    labelKey: copy.labelKey,
    defaultLabel: copy.defaultLabel,
  });
  const next: JustGoHeroCopy = {
    ...copy,
    labelKey: cta.labelKey,
    defaultLabel: cta.defaultLabel,
    kickerKey: decision.copyKey,
    defaultKicker: decision.copy,
    descKey: decision.copyKey,
    defaultDesc: decision.copy,
    descParams: undefined,
  };
  if (decision.mode === 'withhold') {
    next.titleKey = decision.copyKey;
    next.defaultTitle = decision.copy;
    next.titleParams = undefined;
  }
  return next;
}

const SOFTEN_INSIGHT_KEYS = new Set([
  'coachInsightPrimed',
  'coachInsightSolidRecovery',
  'coachInsightLowReadiness',
]);

export function applySafetyToInsight(
  insight: CoachInsight,
  decision: SafetyTrainDecision
): CoachInsight {
  if (decision.mode === 'clear' || !decision.copyKey) return insight;
  if (decision.mode === 'withhold') {
    return {
      messageKey: decision.copyKey,
      actionLabelKey: 'coachActionRecoveryFlow',
      actionPath: '/move',
    };
  }
  const trainNow =
    insight.actionPath === '/active' ||
    insight.actionPath === '/builder' ||
    insight.actionLabelKey === 'coachActionStartWorkout' ||
    insight.actionLabelKey === 'coachActionGoBuilder' ||
    SOFTEN_INSIGHT_KEYS.has(insight.messageKey);
  if (!trainNow) return insight;
  return {
    messageKey: decision.copyKey,
    actionLabelKey: 'coachActionViewToday',
    actionPath: '/log',
  };
}

export type CoachReply = {
  message: string;
  actionLabel?: string;
  actionPath?: string;
};

const TRAIN_PATHS = new Set(['/active', '/builder']);

export function guardCoachReply<T extends CoachReply>(
  reply: T,
  decision: SafetyTrainDecision
): T {
  if (decision.mode === 'clear' || !decision.copy) return reply;
  const train =
    (reply.actionPath != null && TRAIN_PATHS.has(reply.actionPath)) ||
    isTrainNowCopy(reply.message) ||
    isTrainNowCopy(reply.actionLabel);
  if (!train) return reply;
  if (decision.mode === 'withhold') {
    return {
      ...reply,
      message: decision.copy,
      actionLabel: 'Try recovery flow',
      actionPath: '/move',
    };
  }
  const moved = reply.actionPath != null && TRAIN_PATHS.has(reply.actionPath);
  return {
    ...reply,
    message: decision.copy,
    actionLabel: moved ? 'I understand — start' : reply.actionLabel,
    actionPath: moved ? '/log' : reply.actionPath,
  };
}

export function guardTrainNowText(text: string, decision: SafetyTrainDecision): string {
  if (decision.mode === 'clear' || !decision.copy) return text;
  if (!isTrainNowCopy(text)) return text;
  return decision.copy;
}

export function safetyFromChat(message: string, priorUserText: string): SafetyTrainDecision {
  const reportText = [priorUserText, message].filter(Boolean).join('\n');
  return resolveSafetyTrainGuidance({ reportText });
}

type NudgeLike = {
  subject: string;
  body: string;
  push: { title: string; body: string; tag: string };
};

export function guardNudgeCandidate<T extends NudgeLike>(
  candidate: T,
  decision: SafetyTrainDecision
): T {
  if (decision.mode === 'clear' || !decision.copy) return candidate;
  const blob = `${candidate.subject}\n${candidate.body}\n${candidate.push.title}\n${candidate.push.body}`;
  if (!isTrainNowCopy(blob)) return candidate;
  const footer = candidate.body
    .split('\n')
    .filter((line) => /Stop training reminders/i.test(line) || /Health for everyone/i.test(line));
  return {
    ...candidate,
    subject: decision.copy,
    body: [decision.copy, '', ...footer].join('\n'),
    push: {
      ...candidate.push,
      title: decision.copy,
      body: decision.copy,
    },
  };
}
