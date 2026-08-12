/**
 * Log-cited “why this week” / adapt rationale — inspectability without chat chrome.
 *
 * Athletes (and demos) must see three honest parts grounded in signals the coach
 * path already computes — never invented metrics:
 *   1. Inputs from logs (missed days, logged sessions, readiness swap, whyKeys)
 *   2. Rule applied (plain-language equivalent of adaptPlan / progression / loadGuard)
 *   3. Expected effect (what the plan change did)
 *
 * Pure. UI wraps via CoachAdaptBanner / CoachPage week block.
 */

import type { CoachPlan, PlanSession } from '@/lib/coach/types';
import { weekdayLabel } from '@/lib/coach/adaptSummary';
import type { LoadZone } from '@/lib/coach/load';

export type WeekRationaleHints = {
  /** Workout history length already on CoachContext — cite only when > 0. */
  loggedWorkoutCount?: number;
  /** Descriptive ACWR band from loadBands — never predictive. */
  loadZone?: LoadZone | null;
};

export type CoachWeekRationale = {
  /** Stable key for the story kind (tests + analytics-friendly). */
  kind:
    | 'missed-respread'
    | 'readiness-swap'
    | 'logged-update'
    | 'progression-deload'
    | 'progression-plateau'
    | 'load-hold'
    | 'progression-load-up'
    | 'progression-hold'
    | 'generate-week';
  inputKey: string;
  inputDefault: string;
  inputParams?: Record<string, string | number>;
  ruleKey: string;
  ruleDefault: string;
  effectKey: string;
  effectDefault: string;
  /** One-line compact form (Today card / compact banner). */
  compactKey: string;
  compactDefault: string;
  compactParams?: Record<string, string | number>;
};

function dayList(sessions: PlanSession[]): string {
  const labels = sessions
    .map((s) => weekdayLabel(s.dayOffset))
    .filter((v, i, a) => a.indexOf(v) === i);
  return labels.join(', ');
}

function dominantWhyKey(plan: CoachPlan): string | null {
  const counts = new Map<string, number>();
  for (const s of plan.sessions) {
    if (s.status === 'missed') continue;
    for (const ex of s.exercises) {
      if (!ex.whyKey) continue;
      counts.set(ex.whyKey, (counts.get(ex.whyKey) ?? 0) + 1);
    }
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

function equipmentLabel(profile: CoachPlan['equipmentProfile']): string {
  if (profile === 'full-gym') return 'full gym';
  if (profile === 'dumbbells') return 'dumbbells';
  return 'bodyweight';
}

/**
 * Build at most one primary rationale. Null when nothing true to say
 * (empty plan / no sessions).
 */
export function buildWeekRationale(
  plan: CoachPlan,
  hints: WeekRationaleHints = {}
): CoachWeekRationale | null {
  if (!plan.sessions.length) return null;

  const missedSessions = plan.sessions.filter((s) => s.status === 'missed');
  const swappedSessions = plan.sessions.filter((s) => s.status === 'swapped');
  const doneCount = plan.sessions.filter((s) => s.status === 'done').length;

  // 1) Adapt: missed → re-spread (adaptPlan)
  if (missedSessions.length > 0) {
    const days = dayList(missedSessions);
    const count = missedSessions.length;
    return {
      kind: 'missed-respread',
      inputKey: 'coachRationaleMissedInput',
      inputDefault: days
        ? count === 1
          ? `Missed ${days} in your plan log — a past session with no finish.`
          : `Missed ${days} (${count} sessions) in your plan log — past days with no finish.`
        : count === 1
          ? '1 past session in your plan log with no finish.'
          : `${count} past sessions in your plan log with no finish.`,
      inputParams: { count, days },
      ruleKey: 'coachRationaleMissedRule',
      ruleDefault: 'Missed-day re-spread — remaining days still fit the week.',
      effectKey: 'coachRationaleMissedEffect',
      effectDefault:
        'Later sessions keep their focus; the calendar shifts forward. No shame; just continue.',
      compactKey: 'coachRationaleMissedCompact',
      compactDefault: days
        ? `Missed ${days} in your logs → re-spread remaining days → week still fits.`
        : `Missed ${count} session(s) in your logs → re-spread remaining days → week still fits.`,
      compactParams: { count, days },
    };
  }

  // 2) Adapt: readiness / strain → recovery swap
  if (swappedSessions.length > 0) {
    const days = dayList(swappedSessions);
    const count = swappedSessions.length;
    return {
      kind: 'readiness-swap',
      inputKey: 'coachRationaleSwapInput',
      inputDefault: days
        ? `Readiness / strain from your logs flagged ${days} for a lighter day.`
        : `Readiness / strain from your logs flagged ${count} day(s) for a lighter day.`,
      inputParams: { count, days },
      ruleKey: 'coachRationaleSwapRule',
      ruleDefault: 'Readiness recovery swap — strength day becomes recovery when readiness is low.',
      effectKey: 'coachRationaleSwapEffect',
      effectDefault: 'That day is recovery / mobility — keep quality high, strain low.',
      compactKey: 'coachRationaleSwapCompact',
      compactDefault: days
        ? `${days}: readiness from logs → recovery swap → lighter day, same week.`
        : `Readiness from logs → recovery swap → lighter day, same week.`,
      compactParams: { count, days },
    };
  }

  // 3) Adapt: logged sessions bumped the week
  if (doneCount > 0 && plan.revision > 1) {
    return {
      kind: 'logged-update',
      inputKey: 'coachRationaleLoggedInput',
      inputDefault:
        doneCount === 1
          ? '1 session already finished in your workout log this week.'
          : `${doneCount} sessions already finished in your workout log this week.`,
      inputParams: { count: doneCount },
      ruleKey: 'coachRationaleLoggedRule',
      ruleDefault: 'Log match — finished workouts mark plan days done (no wearable).',
      effectKey: 'coachRationaleLoggedEffect',
      effectDefault: 'Week revision updated from what you logged; remaining days stay on mission.',
      compactKey: 'coachRationaleLoggedCompact',
      compactDefault: `${doneCount} logged → plan marked done → week updated from history alone.`,
      compactParams: { count: doneCount },
    };
  }

  // 4) Why this week looks this way — dominant prescription whyKey from progression / loadGuard
  const why = dominantWhyKey(plan);
  if (why === 'coachWhyDeload') {
    return {
      kind: 'progression-deload',
      inputKey: 'coachRationaleDeloadInput',
      inputDefault: 'Recent sets in your logs called for recovery (hard RPE / stall signals).',
      ruleKey: 'coachRationaleDeloadRule',
      ruleDefault: 'Deload progression — lighter load, same movement patterns.',
      effectKey: 'coachRationaleDeloadEffect',
      effectDefault: 'Working sets stay patterned but lighter so you rebuild from a solid base.',
      compactKey: 'coachRationaleDeloadCompact',
      compactDefault: 'Logs showed recovery need → deload rule → lighter load, same patterns.',
    };
  }
  if (why === 'coachWhyPlateauDeload') {
    return {
      kind: 'progression-plateau',
      inputKey: 'coachRationalePlateauInput',
      inputDefault: 'No new best in roughly a month across your logged sets.',
      ruleKey: 'coachRationalePlateauRule',
      ruleDefault: 'Plateau deload — step back to rebuild.',
      effectKey: 'coachRationalePlateauEffect',
      effectDefault: 'Lighter week so progress can restart from quality reps.',
      compactKey: 'coachRationalePlateauCompact',
      compactDefault: 'No recent best in logs → plateau deload → lighter rebuild week.',
    };
  }
  // Load-guard story only when the plan already speaks hold/steady — never
  // override a deload/recovery/load-up whyKey just because the band is high.
  if (
    why === 'coachWhySteadyWeek' ||
    (hints.loadZone === 'high' &&
      (why === 'coachWhyHold' || why === 'coachWhyHoldHard' || why === null))
  ) {
    return {
      kind: 'load-hold',
      inputKey: 'coachRationaleSteadyInput',
      inputDefault:
        hints.loadZone === 'high'
          ? 'Your last week of logs is heavier than your month (load band).'
          : 'Recent week ran hot against your own logged average.',
      ruleKey: 'coachRationaleSteadyRule',
      ruleDefault: 'Load guard — hold the rise; never auto-deload from the band alone.',
      effectKey: 'coachRationaleSteadyEffect',
      effectDefault: 'Intensity held steady — clean reps over chasing fatigue.',
      compactKey: 'coachRationaleSteadyCompact',
      compactDefault: 'Heavy recent week in logs → hold rise → intensity stays put.',
    };
  }
  if (why === 'coachWhyLoadUp' || why === 'coachWhyRepProgress') {
    return {
      kind: 'progression-load-up',
      inputKey: 'coachRationaleLoadUpInput',
      inputDefault:
        why === 'coachWhyRepProgress'
          ? 'Recent logged sets left room to build reps before adding weight.'
          : 'Last logged session felt manageable — room for a small load bump.',
      ruleKey: 'coachRationaleLoadUpRule',
      ruleDefault:
        why === 'coachWhyRepProgress'
          ? 'Rep progression — earn the next weight with solid reps.'
          : 'Load progression — small bump from easy recent sets.',
      effectKey: 'coachRationaleLoadUpEffect',
      effectDefault:
        why === 'coachWhyRepProgress'
          ? 'More reps at the same load until the set challenges you.'
          : 'Working weight steps up slightly on the main lifts.',
      compactKey: 'coachRationaleLoadUpCompact',
      compactDefault:
        why === 'coachWhyRepProgress'
          ? 'Easy recent sets in logs → rep progress → build reps before load.'
          : 'Easy recent sets in logs → load-up → small weight bump.',
    };
  }
  if (
    why === 'coachWhyHold' ||
    why === 'coachWhyHoldHard' ||
    why === 'coachWhyConservative'
  ) {
    return {
      kind: 'progression-hold',
      inputKey: 'coachRationaleHoldInput',
      inputDefault:
        why === 'coachWhyHoldHard'
          ? 'Hard recent sets in your logs — consolidate before adding.'
          : 'Recent logged sets are still settling at this load.',
      ruleKey: 'coachRationaleHoldRule',
      ruleDefault: 'Hold load — quality over ego until reps feel solid.',
      effectKey: 'coachRationaleHoldEffect',
      effectDefault: 'Same working weight; focus on crisp reps and full sets.',
      compactKey: 'coachRationaleHoldCompact',
      compactDefault: 'Logs say consolidate → hold load → same weight, better quality.',
    };
  }

  // 5) Fresh generate / baseline week — cite schedule + gear already on the plan
  const days = plan.daysPerWeek;
  const gear = equipmentLabel(plan.equipmentProfile);
  const logCount = hints.loggedWorkoutCount ?? 0;
  const inputDefault =
    logCount > 0
      ? `${logCount} workout(s) in your log · ${days} training days · ${gear}.`
      : `${days} training days · ${gear} — week shaped from your log history (or a clean start).`;

  return {
    kind: 'generate-week',
    inputKey: 'coachRationaleGenerateInput',
    inputDefault,
    inputParams: { count: logCount, days, gear },
    ruleKey: 'coachRationaleGenerateRule',
    ruleDefault: 'Weekly generate — split and sessions from logs and gear, not a wearable.',
    effectKey: 'coachRationaleGenerateEffect',
    effectDefault: `${plan.sessions.length} sessions on the calendar — miss or crush a day and the plan flexes.`,
    compactKey: 'coachRationaleGenerateCompact',
    compactDefault:
      logCount > 0
        ? `${logCount} logged workouts → weekly generate → ${plan.sessions.length} sessions this week.`
        : `${days} days/${gear} → weekly generate → ${plan.sessions.length} sessions this week.`,
    compactParams: { count: logCount, days, gear, sessions: plan.sessions.length },
  };
}

/** True when the UI should paint the why-this-week / adapt rationale block. */
export function hasWeekRationale(
  plan: CoachPlan,
  hints: WeekRationaleHints = {}
): boolean {
  return buildWeekRationale(plan, hints) !== null;
}
