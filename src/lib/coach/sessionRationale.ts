/**
 * Log-cited “why this session” — session-scoped inspectability (F-012 / F-002-session).
 *
 * Sibling to `weekRationale.ts`. Athletes who opted into Coach and have a
 * current/next session see one shame-free story grounded in signals the
 * prescription already carries — never invented metrics:
 *   1. Inputs from logs (readiness swap, progression whyKey, load band, history)
 *   2. Rule applied (plain-language equivalent of adapt / progression / loadGuard)
 *   3. Expected effect (what this session is for)
 *
 * Pure. UI mounts only on the Coach boss session card (`PlanSessionCard` when
 * primary Start) — never forced onto Train / Today / I-Day. Why stays free.
 * Known-empty history is an honest line, not silence (`.932` / reserved `.699`).
 */

import type { PlanSession } from '@/lib/coach/types';
import type { LoadZone } from '@/lib/coach/load';

export type SessionRationaleHints = {
  /** Workout history length already on CoachContext — cite only when > 0. */
  loggedWorkoutCount?: number;
  /** Descriptive ACWR band from loadBands — never predictive. */
  loadZone?: LoadZone | null;
};

export type CoachSessionRationale = {
  /** Stable key for the story kind (tests + analytics-friendly). */
  kind:
    | 'session-empty'
    | 'session-swapped'
    | 'session-recovery'
    | 'session-deload'
    | 'session-plateau'
    | 'session-load-hold'
    | 'session-load-up'
    | 'session-rep-progress'
    | 'session-hold'
    | 'session-conservative'
    | 'session-bodyweight'
    | 'session-focus';
  inputKey: string;
  inputDefault: string;
  inputParams?: Record<string, string | number>;
  ruleKey: string;
  ruleDefault: string;
  effectKey: string;
  effectDefault: string;
  effectParams?: Record<string, string | number>;
  /** One-line compact form (if a compact surface ever opts in). */
  compactKey: string;
  compactDefault: string;
  compactParams?: Record<string, string | number>;
};

function dominantSessionWhyKey(session: PlanSession): string | null {
  const counts = new Map<string, number>();
  for (const ex of session.exercises) {
    if (!ex.whyKey) continue;
    counts.set(ex.whyKey, (counts.get(ex.whyKey) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestN = 0;
  for (const [k, n] of counts) {
    if (n > bestN) {
      best = k;
      bestN = n;
    }
  }
  return bestN > 0 ? best : null;
}

function focusLabel(session: PlanSession): string {
  const groups = session.focusGroups.slice(0, 3);
  return groups.length ? groups.join(' · ') : session.name;
}

function kindLabel(session: PlanSession): string {
  if (session.kind === 'recovery') return 'recovery';
  if (session.kind === 'conditioning') return 'conditioning';
  return 'strength';
}

/**
 * Build at most one primary session rationale. Null only for done/missed
 * (week-story territory). A planned/swapped boss session with a known empty
 * history gets `session-empty` — honest, not silent, not “0 workouts” theater.
 *
 * whyKey stories that cite “your logs” require `loggedWorkoutCount !== 0`.
 * An omitted count still lets story-kind unit tests fire; CoachPage always
 * passes `ctx.history.length`.
 */
export function buildSessionRationale(
  session: PlanSession,
  hints: SessionRationaleHints = {}
): CoachSessionRationale | null {
  // Past days are week-story territory (weekRationale) — not “why this session”.
  if (session.status === 'done' || session.status === 'missed') return null;

  if (hints.loggedWorkoutCount === 0) {
    return {
      kind: 'session-empty',
      inputKey: 'coachSessionRationaleEmptyInput',
      inputDefault:
        'No sets logged yet — this session is the week’s starting pick, not a wearable.',
      ruleKey: 'coachSessionRationaleEmptyRule',
      ruleDefault:
        'Session pick — week split and gear until a logged set can cite the next one.',
      effectKey: 'coachSessionRationaleEmptyEffect',
      effectDefault: 'Log a set and the next why-line will quote it.',
      compactKey: 'coachSessionRationaleEmptyCompact',
      compactDefault:
        'No sets logged yet — week split starting pick. Log one and Coach cites it.',
    };
  }

  const logCount = hints.loggedWorkoutCount ?? 0;
  const why = dominantSessionWhyKey(session);
  const focus = focusLabel(session);
  const kind = kindLabel(session);

  // 1) Readiness / strain → this day became recovery
  if (session.status === 'swapped' || (session.kind === 'recovery' && why === 'coachWhyRecovery')) {
    return {
      kind: session.status === 'swapped' ? 'session-swapped' : 'session-recovery',
      inputKey: 'coachSessionRationaleSwapInput',
      inputDefault:
        'Readiness / strain from your recent logs flagged today for a lighter day.',
      ruleKey: 'coachSessionRationaleSwapRule',
      ruleDefault:
        'Recovery session — mobility and activation instead of a heavy strength day.',
      effectKey: 'coachSessionRationaleSwapEffect',
      effectDefault: 'Keep quality high and strain low — earn tomorrow’s strength work.',
      compactKey: 'coachSessionRationaleSwapCompact',
      compactDefault:
        'Readiness from logs → recovery session → lighter day, same mission.',
    };
  }

  // 2) Prescription whyKey on this session’s exercises
  if (why === 'coachWhyDeload') {
    return {
      kind: 'session-deload',
      inputKey: 'coachSessionRationaleDeloadInput',
      inputDefault: 'Recent sets in your logs called for recovery (hard RPE / stall).',
      ruleKey: 'coachSessionRationaleDeloadRule',
      ruleDefault: 'Deload session — lighter load, same movement patterns.',
      effectKey: 'coachSessionRationaleDeloadEffect',
      effectDefault: 'Working sets stay patterned but lighter so you rebuild cleanly.',
      compactKey: 'coachSessionRationaleDeloadCompact',
      compactDefault: 'Logs showed recovery need → deload session → lighter load, same patterns.',
    };
  }
  if (why === 'coachWhyPlateauDeload') {
    return {
      kind: 'session-plateau',
      inputKey: 'coachSessionRationalePlateauInput',
      inputDefault: 'No new best in roughly a month across your logged sets.',
      ruleKey: 'coachSessionRationalePlateauRule',
      ruleDefault: 'Plateau deload session — step back to rebuild.',
      effectKey: 'coachSessionRationalePlateauEffect',
      effectDefault: 'Lighter work today so progress can restart from quality reps.',
      compactKey: 'coachSessionRationalePlateauCompact',
      compactDefault: 'No recent best in logs → plateau deload → lighter rebuild session.',
    };
  }
  if (
    why === 'coachWhySteadyWeek' ||
    (hints.loadZone === 'high' &&
      (why === 'coachWhyHold' || why === 'coachWhyHoldHard' || why === null))
  ) {
    return {
      kind: 'session-load-hold',
      inputKey: 'coachSessionRationaleSteadyInput',
      inputDefault:
        hints.loadZone === 'high'
          ? 'Your last week of logs is heavier than your month (load band).'
          : 'Recent week ran hot against your own logged average.',
      ruleKey: 'coachSessionRationaleSteadyRule',
      ruleDefault: 'Load guard — hold the rise this session; never auto-deload from the band alone.',
      effectKey: 'coachSessionRationaleSteadyEffect',
      effectDefault: 'Intensity held steady — clean reps over chasing fatigue.',
      compactKey: 'coachSessionRationaleSteadyCompact',
      compactDefault: 'Heavy recent week in logs → hold rise → intensity stays put today.',
    };
  }
  if (why === 'coachWhyLoadUp') {
    return {
      kind: 'session-load-up',
      inputKey: 'coachSessionRationaleLoadUpInput',
      inputDefault: 'Last logged session felt manageable — room for a small load bump.',
      ruleKey: 'coachSessionRationaleLoadUpRule',
      ruleDefault: 'Load progression — small bump from easy recent sets.',
      effectKey: 'coachSessionRationaleLoadUpEffect',
      effectDefault: 'Working weight steps up slightly on the main lifts this session.',
      compactKey: 'coachSessionRationaleLoadUpCompact',
      compactDefault: 'Easy recent sets in logs → load-up → small weight bump today.',
    };
  }
  if (why === 'coachWhyRepProgress') {
    return {
      kind: 'session-rep-progress',
      inputKey: 'coachSessionRationaleRepInput',
      inputDefault: 'Recent logged sets left room to build reps before adding weight.',
      ruleKey: 'coachSessionRationaleRepRule',
      ruleDefault: 'Rep progression — earn the next weight with solid reps.',
      effectKey: 'coachSessionRationaleRepEffect',
      effectDefault: 'More reps at the same load until the set challenges you.',
      compactKey: 'coachSessionRationaleRepCompact',
      compactDefault: 'Easy recent sets in logs → rep progress → build reps before load.',
    };
  }
  if (why === 'coachWhyBodyweightReps') {
    return {
      kind: 'session-bodyweight',
      inputKey: 'coachSessionRationaleBwInput',
      inputDefault: 'Bodyweight work in your logs still has room to grow via reps.',
      ruleKey: 'coachSessionRationaleBwRule',
      ruleDefault: 'Rep progression — add reps until the set feels challenging.',
      effectKey: 'coachSessionRationaleBwEffect',
      effectDefault: 'More quality reps today; load stays bodyweight until reps earn it.',
      compactKey: 'coachSessionRationaleBwCompact',
      compactDefault: 'Bodyweight logs → rep progress → more reps, same pattern.',
    };
  }
  if (why === 'coachWhyConservative') {
    return {
      kind: 'session-conservative',
      inputKey: 'coachSessionRationaleConservativeInput',
      inputDefault: 'You asked to avoid a movement — this session stays conservative.',
      ruleKey: 'coachSessionRationaleConservativeRule',
      ruleDefault: 'Adjust-today conservative load — quality over ego.',
      effectKey: 'coachSessionRationaleConservativeEffect',
      effectDefault: 'Safer loads and patterns so you can still train without the avoided work.',
      compactKey: 'coachSessionRationaleConservativeCompact',
      compactDefault: 'Avoid adjustment → conservative session → quality over ego.',
    };
  }
  if (why === 'coachWhyHold' || why === 'coachWhyHoldHard') {
    return {
      kind: 'session-hold',
      inputKey: 'coachSessionRationaleHoldInput',
      inputDefault:
        why === 'coachWhyHoldHard'
          ? 'Hard recent sets in your logs — consolidate before adding.'
          : 'Recent logged sets are still settling at this load.',
      ruleKey: 'coachSessionRationaleHoldRule',
      ruleDefault: 'Hold load — quality over ego until reps feel solid.',
      effectKey: 'coachSessionRationaleHoldEffect',
      effectDefault: 'Same working weight this session; focus on crisp reps and full sets.',
      compactKey: 'coachSessionRationaleHoldCompact',
      compactDefault: 'Logs say consolidate → hold load → same weight, better quality.',
    };
  }
  if (why === 'coachWhyRecovery') {
    return {
      kind: 'session-recovery',
      inputKey: 'coachSessionRationaleRecoveryInput',
      inputDefault: 'Your plan put recovery / mobility here from schedule and logs.',
      ruleKey: 'coachSessionRationaleRecoveryRule',
      ruleDefault: 'Recovery session — mobility and activation for better training.',
      effectKey: 'coachSessionRationaleRecoveryEffect',
      effectDefault: 'Move well today; keep strain low so strength days stay productive.',
      compactKey: 'coachSessionRationaleRecoveryCompact',
      compactDefault: 'Schedule + logs → recovery session → mobility, low strain.',
    };
  }

  // 3) Baseline focus story — only when we have real log history (post-first-workout)
  if (logCount > 0) {
    return {
      kind: 'session-focus',
      inputKey: 'coachSessionRationaleFocusInput',
      inputDefault: `${logCount} workout(s) in your log · next up: ${focus} (${kind}).`,
      inputParams: { count: logCount, focus, kind },
      ruleKey: 'coachSessionRationaleFocusRule',
      ruleDefault: 'Session pick — focus and kind from your week split and logged history.',
      effectKey: 'coachSessionRationaleFocusEffect',
      effectDefault: `Train ${focus} as planned — miss or crush it and the week flexes.`,
      effectParams: { focus },
      compactKey: 'coachSessionRationaleFocusCompact',
      compactDefault: `${logCount} logged → ${kind} session (${focus}) → next work from your plan.`,
      compactParams: { count: logCount, focus, kind },
    };
  }

  // No whyKey and no known history — stay quiet (do not invent a count).
  return null;
}

/** True when the UI should paint the why-this-session rationale block. */
export function hasSessionRationale(
  session: PlanSession,
  hints: SessionRationaleHints = {}
): boolean {
  return buildSessionRationale(session, hints) !== null;
}
