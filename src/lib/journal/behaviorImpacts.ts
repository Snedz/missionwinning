/**
 * Behavior impacts — correlate to the barbell, not to the wrist.
 *
 * Every behavior-correlation product on the market resolves to HRV, resting
 * heart rate, or a proprietary recovery score. Those are proxies: no lifter's
 * coach has ever asked what their HRV did. This app already logs the thing they
 * would ask about — sets, loads and RPE — so the outcome here is **session
 * load**, and the sentence is about the barbell.
 *
 * ## Why this is a separate module from `impacts.ts`
 *
 * Readiness impacts (`impacts.ts`) run on `ReadinessFactor`, a closed union
 * shared with `READINESS_RULES`. Widening it so caffeine could ride along would
 * mean the readiness engine could start firing off a coffee count — the exact
 * one-definition-per-word failure `.178` was written to prevent. `BehaviorFactor`
 * is deliberately disjoint, and `impacts.ts` is untouched by this file.
 *
 * ## Statistical honesty, structurally
 *
 * WHOOP shows an impact at five yes and five no observations. Across ten
 * behaviors and six reported outcomes that is sixty comparisons per athlete, and
 * spurious findings stop being a risk and become a certainty — which is why
 * their most repeated review complaint is that everything appeared to hurt.
 * Three defences, all structural rather than statistical:
 *
 * 1. **One pre-registered outcome per behavior**, declared in `behaviors.ts`
 *    before any data exists. You cannot fish for the metric that moved.
 * 2. **Ten flagged and ten unflagged sessions**, double WHOOP's bar.
 * 3. **"Collecting" is a designed state, not a hidden one.** An athlete seven
 *    sessions in sees "7 of 10", not silence and not a premature claim. Most
 *    products hide this; it is the most credible thing we can show.
 *
 * A day the athlete did not log is **excluded**, never counted as a "no" — the
 * absence of an answer is not an answer, and treating it as a control arm would
 * manufacture effects out of forgetfulness.
 */

import type { CompletedWorkoutLog } from '@/types';
import type { MindCheckIn } from '@/lib/mindCheckIns';
import { BEHAVIORS, normalizeBehaviors, type BehaviorId } from '@/lib/behaviors';
import { sessionLoad } from '@/lib/coach/load';

/** Structurally disjoint from `ReadinessFactor` — see the module header. */
export type BehaviorFactor = BehaviorId;

export const MIN_FLAGGED = 10;
export const MIN_UNFLAGGED = 10;
export const MIN_EFFECT_PCT = 5;

export type BehaviorImpact =
  | {
      kind: 'established';
      factor: BehaviorFactor;
      condition: string;
      flaggedSessions: number;
      otherSessions: number;
      loadDeltaPct: number;
    }
  | {
      kind: 'collecting';
      factor: BehaviorFactor;
      condition: string;
      flagged: number;
      unflagged: number;
      neededFlagged: number;
      neededUnflagged: number;
    };

type BehaviorRule = {
  factor: BehaviorFactor;
  condition: string;
  /**
   * `undefined` means "not logged that day" and drops the day entirely.
   * Returning `false` is a real answer; returning `undefined` is silence.
   */
  value: (behaviors: NonNullable<ReturnType<typeof normalizeBehaviors>>) => boolean | undefined;
};

const RULES: BehaviorRule[] = [
  {
    factor: 'caffeine',
    condition: 'caffeine days',
    value: (b) => (b.caffeineServings === undefined ? undefined : b.caffeineServings > 0),
  },
  {
    factor: 'alcohol',
    condition: 'days after a drink',
    value: (b) => (b.alcoholServings === undefined ? undefined : b.alcoholServings > 0),
  },
  { factor: 'proteinHit', condition: 'protein-target days', value: (b) => b.proteinHit },
  { factor: 'creatine', condition: 'creatine days', value: (b) => b.creatine },
  { factor: 'hydration', condition: 'fluid-target days', value: (b) => b.hydration },
  { factor: 'screenInBed', condition: 'screen-in-bed nights', value: (b) => b.screenInBed },
  { factor: 'lateMeal', condition: 'late-meal nights', value: (b) => b.lateMeal },
];

function localDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** The day whose check-in this session should be read against, honoring lag. */
function pairedCheckInDate(sessionDate: string, lag: 'same-day' | 'next-day'): string {
  if (lag === 'same-day') return sessionDate;
  const d = new Date(`${sessionDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return sessionDate;
  d.setDate(d.getDate() - 1);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

/**
 * Strongest established effects first, then whatever is still collecting.
 * Never throws and never guesses: a behavior with no rule simply has no impact.
 */
export function computeBehaviorImpacts(
  history: CompletedWorkoutLog[],
  checkIns: MindCheckIn[]
): BehaviorImpact[] {
  const byDate = new Map<string, MindCheckIn>();
  for (const c of checkIns) byDate.set(c.date, c);

  const sessions = history
    .filter((log) => !log.deletedAt)
    .map((log) => ({ date: localDate(log.completedAt), load: sessionLoad(log).load }))
    .filter((s) => s.date && s.load > 0);

  const out: BehaviorImpact[] = [];

  for (const rule of RULES) {
    const def = BEHAVIORS.find((b) => b.id === rule.factor);
    if (!def) continue;

    const flagged: number[] = [];
    const unflagged: number[] = [];

    for (const session of sessions) {
      const checkIn = byDate.get(pairedCheckInDate(session.date, def.lag));
      const behaviors = normalizeBehaviors(checkIn?.behaviors);
      if (!behaviors) continue;
      const answered = rule.value(behaviors);
      // Not logged that day → the day is dropped, not counted as a "no".
      if (answered === undefined) continue;
      (answered ? flagged : unflagged).push(session.load);
    }

    if (flagged.length < MIN_FLAGGED || unflagged.length < MIN_UNFLAGGED) {
      // Only surface a collecting state once the athlete has actually started
      // on this behavior — otherwise every untouched question nags at "0 of 10".
      if (flagged.length + unflagged.length > 0) {
        out.push({
          kind: 'collecting',
          factor: rule.factor,
          condition: rule.condition,
          flagged: flagged.length,
          unflagged: unflagged.length,
          neededFlagged: MIN_FLAGGED,
          neededUnflagged: MIN_UNFLAGGED,
        });
      }
      continue;
    }

    const otherMean = mean(unflagged);
    if (otherMean <= 0) continue;
    const deltaPct = Math.round(((mean(flagged) - otherMean) / otherMean) * 100);
    if (Math.abs(deltaPct) < MIN_EFFECT_PCT) continue;

    out.push({
      kind: 'established',
      factor: rule.factor,
      condition: rule.condition,
      flaggedSessions: flagged.length,
      otherSessions: unflagged.length,
      loadDeltaPct: deltaPct,
    });
  }

  return out.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'established' ? -1 : 1;
    if (a.kind === 'established' && b.kind === 'established') {
      return Math.abs(b.loadDeltaPct) - Math.abs(a.loadDeltaPct);
    }
    return 0;
  });
}

/**
 * A comparison over the athlete's own sessions, with the counts in the sentence
 * so they can weigh the evidence themselves. Describes and stops — no cause, no
 * advice, nothing a regulator would read as a health claim.
 */
export function behaviorImpactLine(
  impact: Extract<BehaviorImpact, { kind: 'established' }>
): string {
  const sign = impact.loadDeltaPct > 0 ? '+' : '−';
  const pct = Math.abs(impact.loadDeltaPct);
  return `Sessions on ${impact.condition}: load ${sign}${pct}% vs your other days (${impact.flaggedSessions} vs ${impact.otherSessions} sessions).`;
}

/**
 * The state most products hide. Showing the progress bar is the credibility:
 * it tells the athlete exactly what the claim will be built from, before any
 * claim exists.
 */
export function collectingLine(
  impact: Extract<BehaviorImpact, { kind: 'collecting' }>
): string {
  return `${impact.condition}: not enough data yet — ${impact.flagged} of ${impact.neededFlagged} logged, ${impact.unflagged} of ${impact.neededUnflagged} without.`;
}
