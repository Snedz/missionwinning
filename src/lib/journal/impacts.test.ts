import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MIN_EFFECT_PCT,
  MIN_PAIRED_OBSERVATIONS,
  computeImpacts,
  impactLine,
} from '@/lib/journal/impacts';
import type { MindCheckIn } from '@/lib/mindCheckIns';
import type { CompletedWorkoutLog } from '@/types';

// completedAt without a zone parses as local time, so the local-date pairing in
// computeImpacts round-trips regardless of the machine's timezone.
function log(date: string, durationMinutes: number, deletedAt?: string): CompletedWorkoutLog {
  return {
    id: `log-${date}`,
    workoutName: 'Session',
    startedAt: `${date}T11:00:00`,
    completedAt: `${date}T12:00:00`,
    durationSeconds: durationMinutes * 60,
    totalVolume: 1000,
    ...(deletedAt ? { deletedAt } : {}),
    // Unrated working set → RPE 7, so Foster load = 7 × durationMinutes exactly.
    exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 5, weight: 100 }] }],
  };
}

function checkIn(date: string, fields: Partial<MindCheckIn>): MindCheckIn {
  return { date, sleep: 3, mood: 3, stress: 3, energy: 3, ...fields };
}

function day(i: number): string {
  return `2026-06-${String(i + 1).padStart(2, '0')}`;
}

/** n sessions with check-ins: `flaggedCount` bad days (short sessions) + the rest good (long). */
function scenario(
  flaggedCount: number,
  otherCount: number,
  flag: Partial<MindCheckIn>,
  good: Partial<MindCheckIn>,
  minutes: { flagged: number; other: number } = { flagged: 40, other: 60 }
) {
  const history: CompletedWorkoutLog[] = [];
  const checkIns: MindCheckIn[] = [];
  for (let i = 0; i < flaggedCount + otherCount; i++) {
    const isFlagged = i < flaggedCount;
    history.push(log(day(i), isFlagged ? minutes.flagged : minutes.other));
    checkIns.push(checkIn(day(i), isFlagged ? flag : good));
  }
  return { history, checkIns };
}

describe('computeImpacts', () => {
  it('a real difference over enough sessions is reported, with the evidence in the line', () => {
    const { history, checkIns } = scenario(4, 6, { sleep: 2 }, { sleep: 4 });
    const impacts = computeImpacts(history, checkIns);
    const sleep = impacts.find((i) => i.factor === 'sleep');
    assert.ok(sleep, 'expected a sleep impact');
    // 280 vs 420 Foster load → −33%.
    assert.equal(sleep.loadDeltaPct, -33);
    assert.equal(sleep.flaggedSessions, 4);
    assert.equal(sleep.otherSessions, 6);
    const line = impactLine(sleep);
    assert.match(line, /sleep ≤ 2/);
    assert.match(line, /−33%/);
    assert.match(line, /\(4 vs 6 sessions\)/);
  });

  it(`fewer than ${MIN_PAIRED_OBSERVATIONS} pairs is silence — the .127 principle`, () => {
    const { history, checkIns } = scenario(3, 4, { sleep: 2 }, { sleep: 4 });
    assert.deepEqual(computeImpacts(history, checkIns), []);
  });

  it('a flagged group of two stays silent however many pairs exist — one mean is an anecdote', () => {
    const { history, checkIns } = scenario(2, 10, { sleep: 1 }, { sleep: 4 });
    assert.deepEqual(computeImpacts(history, checkIns), []);
  });

  it('a field the athlete does not fill never speaks — absence is not a rating', () => {
    // Soreness rated only on the six good days, never on the four bad ones. Sleep
    // is fully rated and IS reportable; soreness has six pairs (< 8) and must stay
    // silent. The mutant that fabricates a rating for missing days would flag all
    // four unrated days and confidently report an impact built on invented data.
    const { history, checkIns } = scenario(4, 6, { sleep: 2 }, { sleep: 4, soreness: 1 });
    const impacts = computeImpacts(history, checkIns);
    assert.ok(impacts.some((i) => i.factor === 'sleep'));
    assert.ok(!impacts.some((i) => i.factor === 'soreness'));
  });

  it(`an effect under ${MIN_EFFECT_PCT}% is noise, not an impact`, () => {
    const { history, checkIns } = scenario(4, 6, { sleep: 2 }, { sleep: 4 }, { flagged: 59, other: 60 });
    assert.deepEqual(computeImpacts(history, checkIns), []);
  });

  it('sessions without a same-day check-in are not pairs', () => {
    const { history, checkIns } = scenario(4, 6, { sleep: 2 }, { sleep: 4 });
    // Ten sessions but only seven check-ins → under the pair minimum → silence.
    assert.deepEqual(computeImpacts(history, checkIns.slice(0, 7)), []);
    // The full ten speak again — the exclusion above was the check-in, not luck.
    assert.ok(computeImpacts(history, checkIns).length > 0);
  });

  it('stress flags HIGH ratings — the readiness rule direction, not a generic "low is bad"', () => {
    const { history, checkIns } = scenario(4, 6, { stress: 5 }, { stress: 2 });
    const stress = computeImpacts(history, checkIns).find((i) => i.factor === 'stress');
    assert.ok(stress, 'high-stress days should be the flagged group');
    assert.equal(stress.condition, 'stress ≥ 4');
    assert.equal(stress.loadDeltaPct, -33);
  });

  it('tombstoned sessions are deleted content and do not count', () => {
    const { history, checkIns } = scenario(4, 6, { sleep: 2 }, { sleep: 4 });
    const withDeleted = history.map((l, i) =>
      i === 0 ? { ...l, deletedAt: '2026-06-30T00:00:00' } : l
    );
    // Deleting one flagged session drops that group to 3 — still speaks, but from
    // 3 sessions, proving the tombstone left the pool.
    const sleep = computeImpacts(withDeleted, checkIns).find((i) => i.factor === 'sleep');
    assert.equal(sleep?.flaggedSessions, 3);
  });

  it('the line describes and stops — no injury, risk, or causal language (LEGAL_SAFETY §3a)', () => {
    const scenarios = [
      scenario(4, 6, { sleep: 1 }, { sleep: 5 }),
      scenario(4, 6, { energy: 1 }, { energy: 5 }),
      scenario(4, 6, { stress: 5 }, { stress: 1 }),
      scenario(4, 6, { soreness: 5 }, { soreness: 1 }),
    ];
    const forbidden = ['injury', 'risk', 'overtrain', 'danger', 'warning', 'cause', 'predict', 'because'];
    let checked = 0;
    for (const { history, checkIns } of scenarios) {
      for (const impact of computeImpacts(history, checkIns)) {
        const line = impactLine(impact).toLowerCase();
        for (const word of forbidden) {
          assert.ok(!line.includes(word), `impact line must not say "${word}": ${line}`);
        }
        checked += 1;
      }
    }
    assert.ok(checked >= 4, 'every factor produced a line to tone-check');
  });
});
