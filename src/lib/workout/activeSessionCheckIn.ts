/**
 * Pure decisions for Active session check-in dismiss + volume-trim CTA.
 * Keeps ActiveWorkoutPage free of readiness/trim branching (T2.1 · `.406`).
 */

import { shouldOfferVolumeTrim } from '@/lib/workout/activeWorkoutHelpers';

export type SessionCheckInDismissPlan = {
  /** True when the athlete closed without completing the strip. */
  markSkipped: boolean;
  readinessBefore: number;
  readinessAfter: number;
  offerVolumeTrim: boolean;
};

/**
 * After the pre-session readiness sheet closes: what readiness chrome to show
 * and whether to offer "Reduce today's volume".
 */
export function planSessionCheckInDismiss(params: {
  completed: boolean;
  /** Score without applying the new check-in. */
  baseReadiness: number;
  /** Score with the dismiss check-in applied (or base when skipped). */
  adjReadiness: number;
  volumeTrimThreshold?: number;
}): SessionCheckInDismissPlan {
  return {
    markSkipped: !params.completed,
    readinessBefore: params.baseReadiness,
    readinessAfter: params.adjReadiness,
    offerVolumeTrim: shouldOfferVolumeTrim({
      checkInCompleted: params.completed,
      readinessAfter: params.adjReadiness,
      threshold: params.volumeTrimThreshold,
    }),
  };
}

/** Toast kind after the athlete taps "Reduce today's volume". */
export type VolumeTrimToastKind = 'reduced' | 'no_plan';

export function volumeTrimToastKind(adjustSucceeded: boolean): VolumeTrimToastKind {
  return adjustSucceeded ? 'reduced' : 'no_plan';
}

/** i18n keys + defaults for the volume-trim result toast (page still calls `toast`). */
export type VolumeTrimToastCopy = {
  titleKey: string;
  titleDefault: string;
  descKey: string;
  descDefault: string;
};

export function volumeTrimToastCopy(kind: VolumeTrimToastKind): VolumeTrimToastCopy {
  if (kind === 'reduced') {
    return {
      titleKey: 'sessionVolumeReduced',
      titleDefault: 'Volume reduced',
      descKey: 'sessionVolumeReducedDesc',
      descDefault: 'One set trimmed from accessories (min 2). Plan marked Adapted.',
    };
  }
  return {
    titleKey: 'sessionVolumeNoPlan',
    titleDefault: 'No coach session today',
    descKey: 'sessionVolumeNoPlanDesc',
    descDefault:
      'Start from Mission Coach for plan volume cuts. Sets here stay yours.',
  };
}
