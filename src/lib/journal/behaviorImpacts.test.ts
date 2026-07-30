import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MIN_FLAGGED,
  MIN_UNFLAGGED,
  behaviorImpactLine,
  collectingLine,
  computeBehaviorImpacts,
  type BehaviorImpact,
} from '@/lib/journal/behaviorImpacts';
import { computeImpacts } from '@/lib/journal/impacts';
import type { MindCheckIn } from '@/lib/mindCheckIns';
import type { BehaviorEntry } from '@/lib/behaviors';
import type { CompletedWorkoutLog } from '@/types';

/** No timezone suffix: parses as local, matching how check-in dates are written. */
function log(date: string, minutes: number, deletedAt?: string): CompletedWorkoutLog {
  return {
    id: `log-${date}`,
    workoutName: 'Session',
    startedAt: `${date}T11:00:00`,
    completedAt: `${date}T12:00:00`,
    durationSeconds: minutes * 60,
    totalVolume: 1000,
    ...(deletedAt ? { deletedAt } : {}),
    exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] }],
  };
}

function day(i: number): string {
  const d = new Date(2026, 0, 1);
  d.setDate(d.getDate() + i);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

function checkIn(date: string, behaviors?: BehaviorEntry): MindCheckIn {
  return { date, sleep: 3, mood: 3, stress: 3, energy: 3, ...(behaviors ? { behaviors } : {}) };
}

/**
 * `flaggedCount` days with the behavior (short sessions) and `otherCount`
 * without (long ones) — a clean, detectable difference.
 */
function scenario(
  flaggedCount: number,
  otherCount: number,
  on: BehaviorEntry,
  off: BehaviorEntry,
  minutes = { flagged: 40, other: 60 }
) {
  const history: CompletedWorkoutLog[] = [];
  const checkIns: MindCheckIn[] = [];
  for (let i = 0; i < flaggedCount + otherCount; i++) {
    const isFlagged = i < flaggedCount;
    history.push(log(day(i), isFlagged ? minutes.flagged : minutes.other));
    checkIns.push(checkIn(day(i), isFlagged ? on : off));
  }
  return { history, checkIns };
}

function find(impacts: BehaviorImpact[], factor: string) {
  return impacts.find((i) => i.factor === factor);
}

describe('computeBehaviorImpacts', () => {
  it('a real difference over enough sessions is reported, with the counts in the line', () => {
    const { history, checkIns } = scenario(12, 12, { creatine: false }, { creatine: true });
    const impact = find(computeBehaviorImpacts(history, checkIns), 'creatine');
    assert.equal(impact?.kind, 'established');
    if (impact?.kind !== 'established') return;
    // 280 vs 420 Foster load → −33%, reported against the "no creatine" group.
    assert.equal(impact.flaggedSessions, 12);
    assert.equal(impact.otherSessions, 12);
    const line = behaviorImpactLine(impact);
    assert.match(line, /\(12 vs 12 sessions\)/);
    assert.match(line, /\d+%/);
  });

  it(`under ${MIN_FLAGGED}/${MIN_UNFLAGGED} it collects rather than claims`, () => {
    const { history, checkIns } = scenario(9, 20, { creatine: true }, { creatine: false });
    const impact = find(computeBehaviorImpacts(history, checkIns), 'creatine');
    assert.equal(impact?.kind, 'collecting');
    if (impact?.kind !== 'collecting') return;
    assert.equal(impact.flagged, 9);
    assert.equal(impact.neededFlagged, MIN_FLAGGED);
    assert.match(collectingLine(impact), /9 of 10/);
  });

  it('a day the athlete did not log is dropped, never counted as a "no"', () => {
    // Twelve flagged days, twelve sessions with NO check-in at all. Treating
    // silence as a control arm would manufacture a 12-vs-12 finding out of
    // forgetfulness.
    const history: CompletedWorkoutLog[] = [];
    const checkIns: MindCheckIn[] = [];
    for (let i = 0; i < 12; i++) {
      history.push(log(day(i), 40));
      checkIns.push(checkIn(day(i), { creatine: true }));
    }
    for (let i = 12; i < 24; i++) history.push(log(day(i), 60));
    const impact = find(computeBehaviorImpacts(history, checkIns), 'creatine');
    assert.equal(impact?.kind, 'collecting', 'unlogged days are not the comparison group');
    if (impact?.kind !== 'collecting') return;
    assert.equal(impact.unflagged, 0);
  });

  it('a behavior the athlete has never touched says nothing at all', () => {
    const { history, checkIns } = scenario(12, 12, { creatine: false }, { creatine: true });
    // Hydration was never logged on any day.
    assert.equal(find(computeBehaviorImpacts(history, checkIns), 'hydration'), undefined);
  });

  it('a next-day behavior pairs with the following session, not the same one', () => {
    /*
     * Decisive by construction: check-ins exist ONLY on even days and sessions
     * ONLY on odd days, so same-day pairing finds zero matches and reports
     * nothing at all. Any result here can only have come from the lag.
     */
    const history: CompletedWorkoutLog[] = [];
    const checkIns: MindCheckIn[] = [];
    for (let i = 0; i < 48; i += 2) {
      const drank = i % 4 === 0;
      checkIns.push(checkIn(day(i), { alcoholServings: drank ? 2 : 0 }));
      history.push(log(day(i + 1), drank ? 40 : 60));
    }
    const impact = find(computeBehaviorImpacts(history, checkIns), 'alcohol');
    assert.ok(impact, 'next-day lag must find the pairs same-day pairing cannot');
    assert.equal(impact.kind, 'established');
    if (impact.kind !== 'established') return;
    assert.equal(impact.flaggedSessions, 12);
    assert.equal(impact.otherSessions, 12);
    assert.ok(impact.loadDeltaPct < 0, 'the shorter sessions followed the drink days');
  });

  it('an effect smaller than the floor is noise, not an impact', () => {
    const { history, checkIns } = scenario(
      12,
      12,
      { creatine: false },
      { creatine: true },
      { flagged: 59, other: 60 }
    );
    assert.equal(find(computeBehaviorImpacts(history, checkIns), 'creatine'), undefined);
  });

  it('tombstoned sessions are deleted content and do not count', () => {
    // `on` is the flagged group, so index 0 is a creatine day — deleting it
    // must reduce `flaggedSessions` specifically.
    const { history, checkIns } = scenario(12, 12, { creatine: true }, { creatine: false });
    const withDeleted = history.map((l, i) =>
      i === 0 ? { ...l, deletedAt: '2026-06-30T00:00:00' } : l
    );
    const impact = find(computeBehaviorImpacts(withDeleted, checkIns), 'creatine');
    // Still above the bar at 11, so the proof is the count itself falling —
    // asserting the state would have passed even if the tombstone were ignored.
    assert.equal(impact?.kind, 'established');
    if (impact?.kind !== 'established') return;
    assert.equal(impact.flaggedSessions, 11, 'the deleted session left the pool');
  });
});

describe('the readiness engine is not reachable from here', () => {
  it('behavior factors are not readiness factors — the type system says so', () => {
    // @ts-expect-error caffeine is a BehaviorFactor and must never be assignable
    // to ReadinessFactor; widening that union would let READINESS_RULES fire off
    // a coffee count, which is the `.178` defect.
    const leaked: import('@/lib/mindCheckIns').ReadinessFactor = 'caffeine';
    assert.equal(leaked, 'caffeine');
  });

  it('readiness impacts are byte-identical whether or not behaviors exist', () => {
    const bare: MindCheckIn[] = [];
    const withBehaviors: MindCheckIn[] = [];
    const history: CompletedWorkoutLog[] = [];
    for (let i = 0; i < 20; i++) {
      const bad = i < 8;
      history.push(log(day(i), bad ? 40 : 60));
      bare.push({ date: day(i), sleep: bad ? 2 : 4, mood: 3, stress: 3, energy: 3 });
      withBehaviors.push({
        date: day(i),
        sleep: bad ? 2 : 4,
        mood: 3,
        stress: 3,
        energy: 3,
        behaviors: { caffeineServings: bad ? 5 : 0, creatine: true },
      });
    }
    assert.deepEqual(
      computeImpacts(history, withBehaviors),
      computeImpacts(history, bare),
      'adding behavior data must not move a readiness impact by a single digit'
    );
  });
});

describe('the lines describe and stop', () => {
  function everyLine(): string[] {
    const out: string[] = [];
    for (const [on, off] of [
      [{ creatine: true }, { creatine: false }],
      [{ proteinHit: true }, { proteinHit: false }],
      [{ caffeineServings: 3 }, { caffeineServings: 0 }],
      [{ alcoholServings: 2 }, { alcoholServings: 0 }],
      [{ lateMeal: true }, { lateMeal: false }],
    ] as [BehaviorEntry, BehaviorEntry][]) {
      const { history, checkIns } = scenario(12, 12, on, off);
      for (const impact of computeBehaviorImpacts(history, checkIns)) {
        out.push(impact.kind === 'established' ? behaviorImpactLine(impact) : collectingLine(impact));
      }
      const { history: h2, checkIns: c2 } = scenario(4, 6, on, off);
      for (const impact of computeBehaviorImpacts(h2, c2)) {
        out.push(impact.kind === 'established' ? behaviorImpactLine(impact) : collectingLine(impact));
      }
    }
    assert.ok(out.length >= 8, 'both states must be exercised');
    return out;
  }

  it('no causal, medical, or advisory language in any state', () => {
    for (const line of everyLine()) {
      for (const word of [
        'because',
        'cause',
        'causes',
        'impair',
        'risk',
        'injury',
        'danger',
        'warning',
        'you should',
        'avoid',
        'harmful',
        'unhealthy',
        'overtrain',
      ]) {
        assert.ok(!line.toLowerCase().includes(word), `line makes a claim it cannot: ${line}`);
      }
    }
  });

  it('every established line carries its sample sizes', () => {
    const { history, checkIns } = scenario(12, 12, { creatine: false }, { creatine: true });
    for (const impact of computeBehaviorImpacts(history, checkIns)) {
      if (impact.kind !== 'established') continue;
      assert.match(behaviorImpactLine(impact), /\(\d+ vs \d+ sessions\)/);
    }
  });

  it('alcohol is a neutral variable, never a lecture', () => {
    const { history, checkIns } = scenario(
      12,
      12,
      { alcoholServings: 2 },
      { alcoholServings: 0 },
      { flagged: 40, other: 60 }
    );
    const impact = find(computeBehaviorImpacts(history, checkIns), 'alcohol');
    if (!impact) return;
    const line = impact.kind === 'established' ? behaviorImpactLine(impact) : collectingLine(impact);
    assert.ok(!/drink less|cut back|quit|problem/i.test(line), line);
  });
});
