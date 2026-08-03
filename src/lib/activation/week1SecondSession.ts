/**
 * Week-1 activation: pull the second training session after the first log.
 *
 * Boss proxy while private: ≥2 sessions early beats pillar tourism. First Steps
 * used to promote Fuel the moment `basic.workout` flipped true — Horizon W wants
 * one clear next *session*, not a six-pillar chore list.
 *
 * Pure — UI and journey checklist only consume the decision.
 */

export const WEEK1_SECOND_SESSION_TARGET = 2;

export type Week1SecondSessionCue = {
  /** Exactly one completed session — the only window this cue is honest. */
  show: true;
  href: '/active';
  labelKey: string;
  defaultLabel: string;
  kickerKey: string;
  defaultKicker: string;
  reasonKey: string;
  defaultReason: string;
};

export type Week1SecondSessionInput = {
  /** `workoutHistory.length` including any session just finished. */
  completedSessions: number;
  hasActiveWorkout?: boolean;
};

/**
 * Whether Today / First Steps should name "session 2" as the next train act.
 * Null when the athlete is not in that window (0 sessions, already 2+, mid-session).
 */
export function week1SecondSessionCue(
  input: Week1SecondSessionInput
): Week1SecondSessionCue | null {
  if (input.hasActiveWorkout) return null;
  if (input.completedSessions !== 1) return null;
  return {
    show: true,
    href: '/active',
    labelKey: 'week1SecondSessionCta',
    defaultLabel: 'Start session 2',
    kickerKey: 'week1SecondSessionKicker',
    defaultKicker: 'Week one habit',
    reasonKey: 'week1SecondSessionReason',
    defaultReason:
      'One session logged. A second this week locks the loop — Coach builds from the logs, not another pillar.',
  };
}

/** True when the week-1 second-session checklist item is complete. */
export function week1SecondSessionDone(completedSessions: number): boolean {
  return completedSessions >= WEEK1_SECOND_SESSION_TARGET;
}
