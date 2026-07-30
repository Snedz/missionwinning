/**
 * Impacts — what the check-in journal actually correlates with, computed on-device.
 *
 * The most-loved element of WHOOP's journal is the monthly "your data shows"
 * report; this is that payoff without the strap, from data both stores already
 * hold: mind check-ins (`mw_mind_checkins`) and the workout log. Everything runs
 * on this device; nothing here touches the network.
 *
 * ## Refusals, each tested
 *
 * - **Minimum 8 paired observations or silence** (the `.127` principle: no
 *   confident sentence resting on two data points), and at least 3 sessions on
 *   each side of the split — a mean of one session is an anecdote.
 * - **Small effects are silence.** A ±4% difference presented as an "impact" is
 *   noise dressed as insight; under `MIN_EFFECT_PCT` nothing is said.
 * - **Descriptive wording only** (LEGAL_SAFETY §3a): the line states a comparison
 *   over the athlete's own logged sessions and stops. No injury/risk/causal
 *   language — the tone test greps for it, same pattern as the band line.
 * - **Fields the athlete never fills never speak** — falls out of the pair
 *   minimum, and is tested on its own anyway.
 *
 * ## One rule table
 *
 * A "flagged day" uses the same thresholds as `READINESS_RULES` in
 * `mindCheckIns.ts` (sleep ≤2, energy ≤2, stress ≥4, soreness ≥4) — the `.178`
 * lesson: the sentence the athlete reads and the adjustment the engine makes
 * must not sit on different definitions of the same word.
 */

import type { CompletedWorkoutLog } from '@/types';
import { sessionLoad } from '@/lib/coach/load';
import type { MindCheckIn, ReadinessFactor } from '@/lib/mindCheckIns';
import { localDateKeyFromIso } from '@/lib/time/localDate';

export const MIN_PAIRED_OBSERVATIONS = 8;
export const MIN_GROUP_SESSIONS = 3;
export const MIN_EFFECT_PCT = 5;

export interface Impact {
  factor: ReadinessFactor;
  /** Human-readable flag condition, e.g. "sleep ≤ 2" — mirrors READINESS_RULES. */
  condition: string;
  flaggedSessions: number;
  otherSessions: number;
  /** Mean session load on flagged days vs other days, as a signed rounded percent. */
  loadDeltaPct: number;
}

type FactorRule = {
  factor: ReadinessFactor;
  condition: string;
  rated: (c: MindCheckIn) => number | undefined;
  flagged: (rating: number) => boolean;
};

/** Thresholds identical to the negative READINESS_RULES — one definition of "bad day". */
const FACTOR_RULES: FactorRule[] = [
  { factor: 'sleep', condition: 'sleep ≤ 2', rated: (c) => c.sleep, flagged: (r) => r <= 2 },
  { factor: 'energy', condition: 'energy ≤ 2', rated: (c) => c.energy, flagged: (r) => r <= 2 },
  { factor: 'stress', condition: 'stress ≥ 4', rated: (c) => c.stress, flagged: (r) => r >= 4 },
  {
    factor: 'soreness',
    condition: 'soreness ≥ 4',
    rated: (c) => c.soreness,
    flagged: (r) => r >= 4,
  },
];

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

/**
 * Correlations between check-in fields and session load, strongest first.
 * Empty array whenever the data cannot honestly support a sentence.
 */
export function computeImpacts(
  history: CompletedWorkoutLog[],
  checkIns: MindCheckIn[]
): Impact[] {
  const checkInByDate = new Map<string, MindCheckIn>();
  for (const c of checkIns) checkInByDate.set(c.date, c);

  // A pair = a completed session with a same-day check-in and a positive load.
  const pairs: { checkIn: MindCheckIn; load: number }[] = [];
  for (const log of history) {
    if (log.deletedAt) continue;
    const checkIn = checkInByDate.get(localDateKeyFromIso(log.completedAt));
    if (!checkIn) continue;
    const load = sessionLoad(log).load;
    if (load > 0) pairs.push({ checkIn, load });
  }

  const impacts: Impact[] = [];
  for (const rule of FACTOR_RULES) {
    const rated = pairs
      .map((p) => ({ rating: rule.rated(p.checkIn), load: p.load }))
      .filter((p): p is { rating: number; load: number } =>
        typeof p.rating === 'number' && p.rating >= 1 && p.rating <= 5
      );
    if (rated.length < MIN_PAIRED_OBSERVATIONS) continue;

    const flagged = rated.filter((p) => rule.flagged(p.rating)).map((p) => p.load);
    const other = rated.filter((p) => !rule.flagged(p.rating)).map((p) => p.load);
    if (flagged.length < MIN_GROUP_SESSIONS || other.length < MIN_GROUP_SESSIONS) continue;

    const otherMean = mean(other);
    if (otherMean <= 0) continue;
    const deltaPct = Math.round(((mean(flagged) - otherMean) / otherMean) * 100);
    if (Math.abs(deltaPct) < MIN_EFFECT_PCT) continue;

    impacts.push({
      factor: rule.factor,
      condition: rule.condition,
      flaggedSessions: flagged.length,
      otherSessions: other.length,
      loadDeltaPct: deltaPct,
    });
  }

  return impacts.sort((a, b) => Math.abs(b.loadDeltaPct) - Math.abs(a.loadDeltaPct));
}

/**
 * The Impacts sentence — a comparison over the athlete's own sessions, and a
 * stop. Session counts are in the line so the athlete can weigh the evidence
 * themselves; "n=6 vs 14" is the honesty WHOOP's report is loved for.
 */
export function impactLine(impact: Impact): string {
  const sign = impact.loadDeltaPct > 0 ? '+' : '−';
  const pct = Math.abs(impact.loadDeltaPct);
  return (
    `Sessions on ${impact.condition} days: load ${sign}${pct}% vs your other days ` +
    `(${impact.flaggedSessions} vs ${impact.otherSessions} sessions).`
  );
}
