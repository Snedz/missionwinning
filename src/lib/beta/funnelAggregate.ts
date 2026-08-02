/**
 * The arithmetic behind `launchReady` — the number the beta is steered by.
 *
 * `.226` — lifted out of `computeBetaFunnelAggregate`, which calls
 * `getSupabaseAdmin()` on its first line, so **none of this had ever been
 * executed by a test**: 337 lines, zero coverage, computing the one figure
 * `ORCHESTRATION.md` keys the launch decision off.
 *
 * `.223` already found one defect in here, and it was this exact shape — the file
 * kept a private `allBasicDone` demanding all five pillars while the product had
 * narrowed to the first workout, so `basicCompletePct` scored testers against a
 * rule the app no longer implemented and the gate could not go green no matter how
 * well the beta went. That fix gave the *predicate* a home and a test
 * (`journey/basicComplete.ts`). It did not give one to the **consumer that turns
 * the predicate into the launch decision**, which is this.
 *
 * Pure and dependency-free (the `journey/basicComplete.ts` shape): the caller
 * still owns the queries, and the type imports below are erased at compile time,
 * so nothing `server-only` is dragged in to reach the maths.
 */

import type { JourneyPhase, JourneyState } from '@/lib/missionJourney';
import { allBasicDone } from '@/lib/journey/basicComplete';

/** The shape `computeBetaFunnelAggregate` selects from `profiles`. */
export type BetaProfileRow = {
  journey_state?: JourneyState | null;
  created_at?: string | null;
};

export type BetaFunnelTargets = {
  iDayPct: number;
  basicPct: number;
  commissionedPct: number;
  launchBasicPct: number;
};

/**
 * `launchBasicPct` is the gate; `basicPct` is the softer aspiration reported
 * alongside it. They are deliberately different numbers and were `40` and `60`
 * when this was extracted — collapsing them would either loosen the gate or
 * make the dashboard nag at a threshold nothing enforces.
 */
export const BETA_FUNNEL_TARGETS: BetaFunnelTargets = {
  iDayPct: 80,
  basicPct: 40,
  commissionedPct: 25,
  launchBasicPct: 60,
};

/** How many beta users must exist before the gate can be considered at all. */
export const MIN_BETA_PROFILES = 10;

const PHASES: JourneyPhase[] = ['i-day', 'basic', 'readiness', 'commissioned'];

function emptyPhaseCounts(): Record<JourneyPhase, number> {
  return { 'i-day': 0, basic: 0, readiness: 0, commissioned: 0 };
}

export type BetaFunnelCounts = {
  totalProfiles: number;
  signedUpLast14Days: number;
  iDayComplete: number;
  iDayCompletionPct: number;
  basicComplete: number;
  basicCompletePct: number;
  commissioned: number;
  commissionedPct: number;
  phaseCounts: Record<JourneyPhase, number>;
  targets: BetaFunnelTargets;
  launchReady: boolean;
  launchNotes: string[];
};

/**
 * Aggregate the journey funnel from profile rows.
 *
 * `now` is injected rather than read from the clock so the 14-day window can be
 * asserted — `.211`/`.212`'s rule, that a test which cannot control time is a test
 * with an expiry date.
 */
export function aggregateBetaFunnel(
  profiles: BetaProfileRow[] | null | undefined,
  opts: { now?: number; targets?: BetaFunnelTargets } = {}
): BetaFunnelCounts {
  const rows = profiles ?? [];
  const now = opts.now ?? Date.now();
  const targets = opts.targets ?? BETA_FUNNEL_TARGETS;

  const phaseCounts = emptyPhaseCounts();
  let iDayComplete = 0;
  let basicComplete = 0;
  let commissioned = 0;
  let signedUpLast14Days = 0;
  const cutoff = now - 14 * 86400000;

  for (const row of rows) {
    if (row.created_at && new Date(row.created_at).getTime() >= cutoff) {
      signedUpLast14Days++;
    }

    const js = row.journey_state;
    if (!js?.phase) continue;

    /*
     * `journey_state` is a jsonb column, so `phase` is whatever was written to it
     * — the TypeScript type is a claim about the writer, not a guarantee about the
     * row. The original `phaseCounts[js.phase] = (phaseCounts[js.phase] ?? 0) + 1`
     * would mint a new key for any unrecognised string, and `phaseCounts` is
     * rendered as a fixed four-row breakdown; a stray key is a phase the panel
     * cannot show and a total that no longer matches the rows above it.
     */
    if (PHASES.includes(js.phase)) phaseCounts[js.phase] += 1;

    if (js.iDay?.completedAt) iDayComplete++;
    // One definition of Basic Training, imported — see journey/basicComplete.ts.
    if (js.basic && allBasicDone(js.basic)) basicComplete++;
    if (js.commissionedAt || js.phase === 'commissioned') commissioned++;
  }

  const totalProfiles = rows.length;
  const pct = (n: number) => (totalProfiles ? Math.round((n / totalProfiles) * 100) : 0);

  const iDayCompletionPct = pct(iDayComplete);
  const basicCompletePct = pct(basicComplete);
  const commissionedPct = pct(commissioned);

  const launchNotes: string[] = [];
  if (totalProfiles < MIN_BETA_PROFILES) {
    launchNotes.push(`Need ≥${MIN_BETA_PROFILES} beta users (currently ${totalProfiles}).`);
  }
  if (iDayCompletionPct < targets.iDayPct) {
    launchNotes.push(`I-Day completion ${iDayCompletionPct}% — target ≥${targets.iDayPct}%.`);
  }
  if (basicCompletePct < targets.launchBasicPct) {
    launchNotes.push(
      `Basic Training complete ${basicCompletePct}% — launch gate ≥${targets.launchBasicPct}%.`
    );
  }
  if (commissionedPct < targets.commissionedPct) {
    launchNotes.push(
      `Commissioned ${commissionedPct}% — target ≥${targets.commissionedPct}% in 14 days.`
    );
  }

  /*
   * Commissioned is reported and noted but is **not** part of the gate — only
   * headcount, I-Day and Basic are. Deliberate: commissioning takes weeks of real
   * training, so gating launch on it would mean the beta could never clear.
   * Stated here because the note above it says "target", and a reader comparing
   * the two lists would otherwise reasonably assume all four are enforced.
   */
  const launchReady =
    totalProfiles >= MIN_BETA_PROFILES &&
    iDayCompletionPct >= targets.iDayPct &&
    basicCompletePct >= targets.launchBasicPct;

  return {
    totalProfiles,
    signedUpLast14Days,
    iDayComplete,
    iDayCompletionPct,
    basicComplete,
    basicCompletePct,
    commissioned,
    commissionedPct,
    phaseCounts,
    targets,
    launchReady,
    launchNotes,
  };
}
