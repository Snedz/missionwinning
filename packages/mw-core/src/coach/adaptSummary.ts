import type { CoachPlan } from './types';

/** One demo-readable beat describing how the week adapted. */
export type CoachAdaptBeat = {
  key: string;
  defaultMessage: string;
  count?: number;
};

/**
 * Surfaced on Coach and Today for demos:
 * partners must see “logs/miss → week changed” in ≤60s.
 */
export function summarizeCoachAdaptations(plan: CoachPlan): CoachAdaptBeat[] {
  const beats: CoachAdaptBeat[] = [];
  const missed = plan.sessions.filter((s) => s.status === 'missed').length;
  const swapped = plan.sessions.filter((s) => s.status === 'swapped').length;
  const done = plan.sessions.filter((s) => s.status === 'done').length;

  if (missed > 0) {
    beats.push({
      key: 'coachAdaptMissedNote',
      count: missed,
      defaultMessage:
        missed === 1
          ? '1 session missed earlier — remaining days re-spread so the week still fits.'
          : `${missed} sessions missed earlier — remaining days re-spread so the week still fits.`,
    });
  }
  if (swapped > 0) {
    beats.push({
      key: 'coachAdaptSwappedNote',
      count: swapped,
      defaultMessage:
        swapped === 1
          ? '1 day swapped to recovery from readiness / strain — from logs, not a wearable.'
          : `${swapped} days swapped to recovery from readiness / strain — from logs, not a wearable.`,
    });
  }
  if (done > 0 && missed === 0 && swapped === 0 && plan.revision > 1) {
    beats.push({
      key: 'coachAdaptLoggedNote',
      count: done,
      defaultMessage:
        'Week updated from workouts you already logged — plan revision bumped, no wearable required.',
    });
  }
  return beats;
}

/** True when the UI should show the adaptation banner (demo-critical). */
export function hasCoachAdaptationSignal(plan: CoachPlan): boolean {
  return summarizeCoachAdaptations(plan).length > 0 || plan.revision > 1;
}
