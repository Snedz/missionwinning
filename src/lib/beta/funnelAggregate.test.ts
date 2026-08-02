/**
 * The launch gate, executable.
 *
 * `.224` — `betaMetricsServer.ts` was 337 lines that **no test imported**, and it
 * computes `launchReady`: the figure `ORCHESTRATION.md` keys the launch decision
 * off and the founder steers the beta by. `.223` already found one defect in it —
 * a private `allBasicDone` demanding all five pillars while the product had
 * narrowed to the first workout, so the gate could not go green no matter how well
 * the beta went. That fix gave the predicate a test; the consumer that turns the
 * predicate into the decision still had none.
 *
 * The failure mode is not a crash. It is a number that is quietly wrong in one
 * direction — a gate that cannot open, or one that opens early — and nobody can
 * tell by looking at the dashboard, because the dashboard *is* the thing that is
 * wrong.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { JourneyState } from '@/lib/missionJourney';
import {
  aggregateBetaFunnel,
  BETA_FUNNEL_TARGETS,
  MIN_BETA_PROFILES,
  type BetaProfileRow,
} from './funnelAggregate.ts';

const NOW = Date.UTC(2026, 6, 31, 12, 0, 0);
const daysAgo = (n: number) => new Date(NOW - n * 86400000).toISOString();

type ProfileOpts = {
  phase?: JourneyState['phase'];
  iDay?: boolean;
  workout?: boolean;
  commissionedAt?: string;
  createdAt?: string;
};

function profile(o: ProfileOpts = {}): BetaProfileRow {
  return {
    created_at: o.createdAt ?? daysAgo(1),
    journey_state: {
      phase: o.phase ?? 'basic',
      iDay: o.iDay ? { completedAt: daysAgo(2) } : {},
      basic: { workout: !!o.workout, fuel: false, move: false, mind: false, learn: false },
      ...(o.commissionedAt ? { commissionedAt: o.commissionedAt } : {}),
    } as unknown as JourneyState,
  };
}

const agg = (rows: BetaProfileRow[]) => aggregateBetaFunnel(rows, { now: NOW });

test('an empty beta is not launch-ready and says why', () => {
  const r = agg([]);
  assert.equal(r.totalProfiles, 0);
  assert.equal(r.launchReady, false);
  assert.equal(r.iDayCompletionPct, 0, 'no division by zero — 0 of 0 is 0%, not NaN');
  assert.equal(r.basicCompletePct, 0);
  assert.match(r.launchNotes[0], /Need ≥10 beta users \(currently 0\)/);
});

/**
 * The `.223` rule, at the level that consumes it: Basic Training is the **first
 * workout**, not all five pillars. A tester who logs one workout and nothing else
 * has done everything Horizon W asks, and must score as complete.
 */
test('Basic Training completion counts the first workout, not five pillars', () => {
  const r = agg([profile({ workout: true }), profile({ workout: false })]);
  assert.equal(r.basicComplete, 1);
  assert.equal(r.basicCompletePct, 50);
});

test('the launch gate opens only on headcount, I-Day and Basic together', () => {
  // 10 profiles, all I-Day done, all with a workout → every condition met.
  const ready = agg(Array.from({ length: 10 }, () => profile({ iDay: true, workout: true })));
  assert.equal(ready.launchReady, true);
  assert.deepEqual(ready.launchNotes.filter((n) => /Need ≥|I-Day|Basic Training/.test(n)), []);

  // One short of the headcount, everything else perfect.
  const tooFew = agg(Array.from({ length: 9 }, () => profile({ iDay: true, workout: true })));
  assert.equal(tooFew.launchReady, false, `${MIN_BETA_PROFILES} users is a hard floor`);
  assert.match(tooFew.launchNotes.join(' '), /Need ≥10 beta users \(currently 9\)/);
});

test('I-Day below target holds the gate shut', () => {
  // 10 users, 7 I-Day (70% < 80%), all with workouts.
  const rows = Array.from({ length: 10 }, (_, i) =>
    profile({ iDay: i < 7, workout: true })
  );
  const r = agg(rows);
  assert.equal(r.iDayCompletionPct, 70);
  assert.equal(r.launchReady, false);
  assert.match(r.launchNotes.join(' '), /I-Day completion 70% — target ≥80%/);
});

test('Basic below the launch gate holds it shut, and the note names the gate not the target', () => {
  // 10 users, all I-Day, 5 with a workout (50% < the 60% launch gate).
  const rows = Array.from({ length: 10 }, (_, i) => profile({ iDay: true, workout: i < 5 }));
  const r = agg(rows);
  assert.equal(r.basicCompletePct, 50);
  assert.equal(r.launchReady, false);
  assert.match(
    r.launchNotes.join(' '),
    /Basic Training complete 50% — launch gate ≥60%/,
    'the note must quote launchBasicPct (60), not the softer basicPct target (40)'
  );
});

/**
 * `basicPct` (40) and `launchBasicPct` (60) are different numbers on purpose. If
 * they were ever collapsed, either the gate loosens by 20 points or the dashboard
 * starts nagging at a threshold nothing enforces.
 */
test('the soft target and the hard gate stay distinct', () => {
  assert.notEqual(BETA_FUNNEL_TARGETS.basicPct, BETA_FUNNEL_TARGETS.launchBasicPct);
  assert.ok(BETA_FUNNEL_TARGETS.launchBasicPct > BETA_FUNNEL_TARGETS.basicPct);

  // 55% Basic: above the soft target, still below the gate.
  const rows = Array.from({ length: 20 }, (_, i) => profile({ iDay: true, workout: i < 11 }));
  const r = agg(rows);
  assert.equal(r.basicCompletePct, 55);
  assert.equal(r.launchReady, false, '55% clears basicPct 40 but not launchBasicPct 60');
});

/**
 * Commissioning takes weeks of real training, so it is reported and noted but
 * deliberately **not** gated on — otherwise the beta could never clear. Pinned
 * because the note says "target", and a reader comparing the notes to the gate
 * would reasonably assume all four are enforced.
 */
test('commissioned is reported and noted but never blocks launch', () => {
  const rows = Array.from({ length: 10 }, () => profile({ iDay: true, workout: true }));
  const r = agg(rows);
  assert.equal(r.commissioned, 0);
  assert.equal(r.commissionedPct, 0);
  assert.match(r.launchNotes.join(' '), /Commissioned 0% — target ≥25%/, 'still reported');
  assert.equal(r.launchReady, true, 'but the gate does not wait for it');
});

test('commissioned counts either the timestamp or the phase', () => {
  const r = agg([
    profile({ phase: 'commissioned' }),
    profile({ phase: 'basic', commissionedAt: daysAgo(3) }),
    profile({ phase: 'basic' }),
  ]);
  assert.equal(r.commissioned, 2);
});

test('percentages round rather than truncate', () => {
  // 1 of 3 = 33.33% → 33; 2 of 3 = 66.67% → 67.
  const oneOfThree = agg([profile({ iDay: true }), profile(), profile()]);
  assert.equal(oneOfThree.iDayCompletionPct, 33);

  const twoOfThree = agg([profile({ iDay: true }), profile({ iDay: true }), profile()]);
  assert.equal(twoOfThree.iDayCompletionPct, 67);
});

/**
 * The 14-day window is the beta's own clock — REDTEAM A5's falsifier is stated in
 * days. `now` is injected so this cannot rot: a test that reads the real clock
 * passes today and fails on a date nobody chose (`.211`, `.212`).
 */
test('the 14-day signup window is inclusive at the boundary and excludes older rows', () => {
  const r = agg([
    profile({ createdAt: daysAgo(0) }),
    profile({ createdAt: daysAgo(13) }),
    profile({ createdAt: daysAgo(14) }), // exactly on the cutoff — counted
    profile({ createdAt: daysAgo(15) }), // outside
    profile({ createdAt: daysAgo(400) }),
  ]);
  assert.equal(r.signedUpLast14Days, 3);
  assert.equal(r.totalProfiles, 5, 'the window narrows the recency count, never the total');
});

test('a profile with no journey_state still counts toward the total', () => {
  const r = agg([{ created_at: daysAgo(1), journey_state: null }, profile({ workout: true })]);
  assert.equal(r.totalProfiles, 2);
  assert.equal(r.basicComplete, 1);
  assert.equal(
    r.basicCompletePct,
    50,
    'a signed-up user who has done nothing is a real denominator, not an absent row'
  );
});

test('a missing created_at does not count as a recent signup', () => {
  const r = agg([{ journey_state: null }, { created_at: null, journey_state: null }]);
  assert.equal(r.signedUpLast14Days, 0);
  assert.equal(r.totalProfiles, 2);
});

/**
 * `journey_state` is a jsonb column, so `phase` is whatever was written to it —
 * the TypeScript type is a claim about the writer, not a guarantee about the row.
 * The original code did `phaseCounts[js.phase] = (phaseCounts[js.phase] ?? 0) + 1`,
 * which mints a key for any string. `phaseCounts` renders as a fixed four-row
 * breakdown, so a stray key is a phase the panel cannot show and a total that no
 * longer matches the rows above it.
 */
test('an unrecognised phase does not invent a bucket', () => {
  const r = agg([
    profile({ phase: 'basic' }),
    { created_at: daysAgo(1), journey_state: { phase: 'legacy-onboarding' } as unknown as JourneyState },
  ]);
  assert.deepEqual(Object.keys(r.phaseCounts).sort(), ['basic', 'commissioned', 'i-day', 'readiness']);
  assert.equal(r.phaseCounts.basic, 1);
  assert.equal(r.totalProfiles, 2, 'the row still counts — it just has no bucket');
});

test('phase counts tally the four known phases', () => {
  const r = agg([
    profile({ phase: 'i-day' }),
    profile({ phase: 'basic' }),
    profile({ phase: 'basic' }),
    profile({ phase: 'readiness' }),
    profile({ phase: 'commissioned' }),
  ]);
  assert.deepEqual(r.phaseCounts, { 'i-day': 1, basic: 2, readiness: 1, commissioned: 1 });
});

test('null and undefined profile lists are an empty beta, not a crash', () => {
  for (const input of [null, undefined]) {
    const r = aggregateBetaFunnel(input, { now: NOW });
    assert.equal(r.totalProfiles, 0);
    assert.equal(r.launchReady, false, 'a failed read must never read as launch-ready');
  }
});
