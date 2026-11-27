import type { CoachPlan, PlanSession } from './types';

/** One demo-readable beat describing how the week adapted. */
export type CoachAdaptBeat = {
  key: string;
  defaultMessage: string;
  count?: number;
  /** Comma-separated weekday labels (Mon, Wed) when known. */
  days?: string;
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

/** Monday-based dayOffset → short English weekday (UI may re-label via i18n later). */
export function weekdayLabel(dayOffset: number): string {
  const i = Math.max(0, Math.min(6, Math.floor(dayOffset)));
  return WEEKDAYS[i]!;
}

function dayList(sessions: PlanSession[]): string {
  const labels = sessions
    .map((s) => weekdayLabel(s.dayOffset))
    .filter((v, i, a) => a.indexOf(v) === i);
  return labels.join(', ');
}

/**
 * Surfaced on Coach and Today for demos:
 * partners must see “logs/miss → week changed” in ≤60s.
 *
 * `.287`: include **which days** when known so the banner is a real why panel,
 * not only a count.
 */
export function summarizeCoachAdaptations(plan: CoachPlan): CoachAdaptBeat[] {
  const beats: CoachAdaptBeat[] = [];
  const missedSessions = plan.sessions.filter((s) => s.status === 'missed');
  const swappedSessions = plan.sessions.filter((s) => s.status === 'swapped');
  const done = plan.sessions.filter((s) => s.status === 'done').length;
  const missed = missedSessions.length;
  const swapped = swappedSessions.length;

  if (missed > 0) {
    const days = dayList(missedSessions);
    beats.push({
      key: 'coachAdaptMissedNote',
      count: missed,
      days,
      defaultMessage: days
        ? missed === 1
          ? `Life happened — missed ${days}. Remaining days are re-spread so the week still fits. No shame; just continue.`
          : `Life happened — missed ${days} (${missed} sessions). Remaining days are re-spread so the week still fits. No shame; just continue.`
        : missed === 1
          ? 'Life happened — 1 session missed. Remaining days are re-spread so the week still fits. No shame; just continue.'
          : `Life happened — ${missed} sessions missed. Remaining days are re-spread so the week still fits. No shame; just continue.`,
    });
  }
  if (swapped > 0) {
    const days = dayList(swappedSessions);
    beats.push({
      key: 'coachAdaptSwappedNote',
      count: swapped,
      days,
      defaultMessage: days
        ? swapped === 1
          ? `${days} swapped to recovery from readiness / strain — from logs, not a wearable.`
          : `${days} swapped to recovery from readiness / strain (${swapped} days) — from logs, not a wearable.`
        : swapped === 1
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

/**
 * True when the UI should show the adaptation banner.
 *
 * Revision alone is not a story — mid-week generate / cold-start re-spread can
 * bump revision without a missed/swapped/logged beat. Showing "plan reshaped"
 * with no beat was empty theater (and read as AI slop on a first Coach visit).
 */
export function hasCoachAdaptationSignal(plan: CoachPlan): boolean {
  return summarizeCoachAdaptations(plan).length > 0;
}

/** Unique coach why-keys for today's not-done session (prescription rationale). */
export function todaySessionWhyKeys(
  plan: CoachPlan,
  todayOffset: number
): string[] {
  const session = plan.sessions.find(
    (s) => s.dayOffset === todayOffset && s.status !== 'done' && s.exercises.length > 0
  );
  if (!session) return [];
  const seen = new Set<string>();
  const keys: string[] = [];
  for (const ex of session.exercises) {
    if (!ex.whyKey || seen.has(ex.whyKey)) continue;
    seen.add(ex.whyKey);
    keys.push(ex.whyKey);
    if (keys.length >= 3) break;
  }
  return keys;
}
