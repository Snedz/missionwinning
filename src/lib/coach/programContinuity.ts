/**
 * Where this session sits in the athlete's own history — "SESSION 14 · PUSH /
 * PULL / LEGS".
 *
 * The reference app for `.240` shows "WORKOUT #2 · Foundation: Advanced
 * Bodyweight Program · Phase 1", and continuity is the strongest idea in it: a
 * session that knows its place in a progression is a different object from a
 * workout that happens to be today's. Mission Winning had none of that on
 * screen — `CoachTodayCard` printed a session name and nothing else.
 *
 * **What is honest here, and what is deliberately absent.**
 *
 * The ordinal is real: it counts what the athlete has actually logged. The
 * block name is real: it is read out of the plan that exists, not re-derived by
 * calling `chooseSplit` again (`.178` — the split would then be decided twice,
 * and the label could disagree with the sessions under it).
 *
 * There is **no week number and no "Phase 1 of 3"**, because
 * `useCoachPlan` regenerates on Monday and overwrites the previous plan. With
 * no plan history there is nothing that knows this is week three, and a field
 * nothing writes is exactly `.195`: `weeklyDebrief` read a `personalRecords`
 * property that existed nowhere in the repo, so the recap card's PR line was
 * dead on arrival and the hand-written cast is what stopped the compiler from
 * saying so. Program arc needs the plan to become durable first; that is its
 * own change, not a label.
 */

import type { CompletedWorkoutLog } from '@/types';
import type { CoachPlan } from '@/lib/coach/types';

/**
 * How many sessions the athlete has completed, tombstones excluded.
 *
 * `dayReview.ts` and `behaviorImpacts.ts` both drop `deletedAt` rows and
 * `weekRecap.ts` did not until `.223` — where the miscount reached a PNG shared
 * to a public feed. A deleted session is not a session you did.
 */
export function completedSessionCount(history: CompletedWorkoutLog[]): number {
  return history.filter((log) => !log.deletedAt).length;
}

/**
 * The ordinal to print for the session being offered now — one past what is
 * already logged. Returns `null` for an athlete with no history: "SESSION 1"
 * beside a Start button reads as a claim about the past, and there isn't one.
 */
export function nextSessionOrdinal(history: CompletedWorkoutLog[]): number | null {
  const done = completedSessionCount(history);
  return done === 0 ? null : done + 1;
}

/**
 * A name for the shape of the week, read out of the plan itself.
 *
 * Strength sessions carry the split; recovery and conditioning are the same in
 * every block and would only make every label identical. Returns `null` rather
 * than a filler string when the plan has no strength work to describe — an
 * eyebrow that says "Training" tells the athlete nothing they cannot see.
 */
export function planBlockName(plan: CoachPlan | null): string | null {
  if (!plan) return null;

  const strength = plan.sessions.filter((s) => s.kind === 'strength');
  if (strength.length === 0) return null;

  // Distinct, in the order the week runs. `Set` preserves insertion order, which
  // is what makes "Push / Pull / Legs" come out in that order rather than sorted.
  const names = [...new Set(strength.map((s) => shortName(s.name)))];
  if (names.length === 0) return null;

  // Four or more distinct names is a rotation, not a split anyone would read as
  // a title — say how many days it runs instead of listing them all.
  if (names.length > 3) return `${strength.length}-day split`;
  return names.join(' / ');
}

/**
 * "Push Strength" → "Push". The card already says Mission Coach and the session
 * name sits directly underneath; repeating "Strength" three times in one
 * eyebrow is noise.
 */
function shortName(name: string): string {
  return name
    .replace(/\s+strength$/i, '')
    .replace(/\s+circuit$/i, '')
    .trim();
}

export interface SessionContinuity {
  ordinal: number | null;
  blockName: string | null;
  /** Pre-joined eyebrow, or null when there is nothing true to say. */
  line: string | null;
}

export function sessionContinuity(
  history: CompletedWorkoutLog[],
  plan: CoachPlan | null
): SessionContinuity {
  const ordinal = nextSessionOrdinal(history);
  const blockName = planBlockName(plan);
  const parts = [
    ordinal === null ? null : `Session ${ordinal}`,
    blockName,
  ].filter((x): x is string => !!x);

  return { ordinal, blockName, line: parts.length > 0 ? parts.join(' · ') : null };
}
