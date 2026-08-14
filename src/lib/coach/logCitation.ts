/**
 * The log fact a Coach line is standing on — or the admission that there isn't one.
 *
 * ## Why this exists
 *
 * East Asia survey shard (mission-ops #13): **coach-from-logs clarity scored
 * 2.56/5, the lowest item on the sheet**, from a cohort described as
 * AI-skeptical and Alpha-curious. The diagnosis was not that the plan is bad; it
 * is that *"coach output has no log-derived labels"*. Read the surfaces and it is
 * obvious: Today's Coach invite says **"AI weekly plan"** (`BOOTSTRAP_EN`, so it
 * is what actually paints), `/coach` says *"A week of training built from your
 * logs"*, and `CoachTodayCard` says *"Built from your logs — no wearable
 * required"*. Every one of those is a **claim about provenance**, none of them is
 * **evidence of it**. To a reader who suspects the number came from a language
 * model, a claim is the weakest possible move — it is exactly what a fabricated
 * plan would also say.
 *
 * `.693` shipped the honest version of this for adaptation
 * ([weekRationale.ts](./weekRationale.ts)): input · rule · effect, citing the
 * logs that moved the week. But it only renders when there is an *adaptation*
 * to explain, so the fresh-week and no-plan paths — the whole first-run
 * experience the survey measured — had nothing.
 *
 * This module is the floor under all of it: given the device's own workout
 * history, name a fact the reader can check against their own memory (this
 * exercise, this load, this date), or say plainly that there are no logs yet.
 * Nothing here predicts, scores or advises; it only quotes.
 *
 * ## Contract
 *
 * - **Quote, never infer.** Every field comes from a stored set. No estimates,
 *   no 1RM math, no "your average" — an athlete cannot check an average against
 *   memory, and a number they cannot check is the problem, not the fix.
 * - **`no-logs` is a first-class answer.** The alternative is what shipped: a
 *   provenance claim with nothing behind it.
 * - **Reads storage, not the store.** The Today lean shell is deliberately
 *   catalog-free on the cold path ([workoutPersistLite.ts](../workout/workoutPersistLite.ts)),
 *   and this has to work there.
 * - **The planner stays blind to standing.** Nothing here touches rewards,
 *   leaderboard or social — see `domainBoundary.test.ts` C1–C3.
 */

import type { CompletedWorkoutLog } from '@/types';
import { getExerciseById } from '@/data/exercises';
import { formatLocalDate, formatLocalNumber } from '@/lib/i18n/formatLocale';
import { localDateKey, localDateKeyFromIso } from '@/lib/time/localDate';
import { readWorkoutHistoryFromStorage } from '@/lib/workout/workoutPersistLite';

/** A quotable fact from the device's own log, or the absence of one. */
export type CoachLogCitation =
  | { kind: 'no-logs' }
  | {
      /** A completed set carrying a load — the strongest thing to quote. */
      kind: 'set';
      exerciseName: string;
      weight: number;
      reps: number;
      at: string;
      /** Sessions logged in the last 7 local days, for lines that want a count. */
      sessionsLast7: number;
    }
  | {
      /** A session with no loaded sets (bodyweight, mobility) — quote the session. */
      kind: 'session';
      sessionName: string;
      at: string;
      sessionsLast7: number;
    };

/**
 * A row on a *completed* log is a set that happened — `CompletedWorkoutLog`
 * carries no `completed` flag, unlike the active-session shape. So the only
 * thing to screen out is a zero-rep row, which older builds could write.
 */
function isPerformedSet(set: { reps: number }): boolean {
  return (set.reps ?? 0) > 0;
}

function sessionsInLast7Days(history: CompletedWorkoutLog[], now: Date): number {
  const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const cutoffKey = localDateKey(cutoff);
  const todayKey = localDateKey(now);
  return history.filter((w) => {
    const key = localDateKeyFromIso(w.completedAt);
    return key !== '' && key > cutoffKey && key <= todayKey;
  }).length;
}

/**
 * The most recent quotable fact in `history`.
 *
 * Most recent rather than heaviest: the reader is checking whether we can see
 * their log at all, and the set they remember best is the last one they did.
 */
export function coachLogCitation(
  history: CompletedWorkoutLog[],
  now: Date = new Date()
): CoachLogCitation {
  const logs = (Array.isArray(history) ? history : [])
    .filter((w) => w && typeof w.completedAt === 'string' && localDateKeyFromIso(w.completedAt) !== '')
    // Tombstoned rows are deletions the athlete asked for — never quote them.
    .filter((w) => !w.deletedAt)
    .slice()
    .sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1));

  if (logs.length === 0) return { kind: 'no-logs' };

  const sessionsLast7 = sessionsInLast7Days(logs, now);

  for (const log of logs) {
    for (const exercise of log.exercises ?? []) {
      const loaded = (exercise.sets ?? [])
        .filter(isPerformedSet)
        .filter((s) => (s.weight ?? 0) > 0);
      const set = loaded[loaded.length - 1];
      if (!set) continue;
      return {
        kind: 'set',
        exerciseName: getExerciseById(exercise.exerciseId)?.name ?? exercise.exerciseId,
        weight: set.weight,
        reps: set.reps,
        at: log.completedAt,
        sessionsLast7,
      };
    }
  }

  const newest = logs[0]!;
  return {
    kind: 'session',
    sessionName: newest.workoutName || 'Session',
    at: newest.completedAt,
    sessionsLast7,
  };
}

/** Cold-path convenience: the same answer straight off the persist blob. */
export function coachLogCitationFromStorage(now: Date = new Date()): CoachLogCitation {
  return coachLogCitation(readWorkoutHistoryFromStorage(), now);
}

/**
 * The quotable half, rendered — `"Bench Press 60 kg × 5 · 12 Aug"`.
 *
 * Returns `null` for `no-logs` on purpose, so a caller cannot accidentally
 * render an empty citation as though it were a fact; the no-logs sentence is a
 * separate string the UI must choose deliberately.
 *
 * Numbers and the date go through `formatLocale` rather than raw `Intl`: this
 * line is mostly numerals, and `62.5` is `62,5` in half the packs we ship
 * (`.242`).
 */
export function coachCitationFact(
  citation: CoachLogCitation,
  lang: string,
  unitLabel: string
): string | null {
  if (citation.kind === 'no-logs') return null;
  const when = formatLocalDate(citation.at, lang, { month: 'short', day: 'numeric' });
  if (citation.kind === 'session') {
    return when ? `${citation.sessionName} · ${when}` : citation.sessionName;
  }
  const load = `${formatLocalNumber(citation.weight, lang)}${unitLabel}`;
  const set = `${citation.exerciseName} ${load} × ${formatLocalNumber(citation.reps, lang)}`;
  return when ? `${set} · ${when}` : set;
}

/**
 * English floors for the two sentences that wrap a citation.
 *
 * Kept here beside the decision so the copy and the rule it describes cannot
 * drift apart — the shape [localFirstCopy.ts](../localFirstCopy.ts) uses.
 */
export const COACH_CITATION_COPY = {
  /** `{{fact}}` is `coachCitationFact()` output. Never a claim on its own. */
  fromLog: 'From your log: {{fact}}',
  /** Said out loud, because the alternative is a provenance claim with nothing behind it. */
  noLogs: 'No sets logged yet — log one and Coach builds the week from it.',
} as const;

/**
 * Phrases that describe the *technology* instead of the *evidence*.
 *
 * The list is closed and each entry is a spelling the repo actually shipped or
 * nearly shipped: `BOOTSTRAP_EN.todayCoachInviteEyebrow` was literally
 * `"AI weekly plan"` above the Coach invite on Today. An enumerated list cannot
 * see a phrasing nobody has written yet, which is why the guard that uses it
 * also requires a citation to be *present* — the two together are the check.
 */
export const FORBIDDEN_GENERIC_AI = [
  /\bAI\b(?![- ]skeptic)/,
  /\bA\.I\./,
  /artificial intelligence/i,
  /machine learning/i,
  /powered by (?:AI|GPT|an? (?:model|LLM))/i,
  /\bGPT\b/,
  /\bLLM\b/,
  /smart(?:er)? (?:coach|coaching|plan)/i,
] as const;

/** True when no value describes the technology rather than the evidence. */
export function coachCopyAvoidsGenericAi(
  copy: Record<string, string>
): { ok: true } | { ok: false; key: string; hit: string } {
  for (const [key, value] of Object.entries(copy)) {
    for (const re of FORBIDDEN_GENERIC_AI) {
      if (re.test(value)) return { ok: false, key, hit: re.source };
    }
  }
  return { ok: true };
}
