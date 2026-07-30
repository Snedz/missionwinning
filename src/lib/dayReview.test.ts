import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { composeDayReview, dayReviewLines } from '@/lib/dayReview';
import { findToneViolations } from '@/lib/reentryTone';
import type { MindCheckIn } from '@/lib/mindCheckIns';
import type { CompletedWorkoutLog } from '@/types';

const NOW = new Date('2026-07-30T20:00:00');
const TODAY = '2026-07-30';

/**
 * `minutes` matters more than sets here: session load is RPE × duration, so a
 * fixture that varies only volume produces an identical load and never
 * exercises the above/below-average branches at all.
 */
function log(dateIso: string, sets = 12, weight = 100, minutes = 60): CompletedWorkoutLog {
  return {
    id: `log-${dateIso}`,
    workoutName: 'Session',
    startedAt: dateIso,
    completedAt: dateIso,
    durationSeconds: minutes * 60,
    totalVolume: sets * weight * 5,
    exercises: [
      {
        exerciseId: 'bench-press',
        sets: Array.from({ length: sets }, () => ({ reps: 5, weight })),
      },
    ],
  };
}

function checkIn(date: string, over: Partial<MindCheckIn> = {}): MindCheckIn {
  return { date, sleep: 3, mood: 3, stress: 3, energy: 3, ...over };
}

/** A few weeks of ordinary training so compareToBaseline has something to say. */
function history(): CompletedWorkoutLog[] {
  const out: CompletedWorkoutLog[] = [];
  for (let d = 2; d < 30; d += 2) {
    const day = new Date(NOW);
    day.setDate(day.getDate() - d);
    out.push(log(day.toISOString(), 12, 100));
  }
  return out;
}

describe('composeDayReview', () => {
  it('a day with nothing known produces no card at all', () => {
    // The competitor failure this avoids: generating reflection over a day the
    // athlete told us nothing about.
    assert.equal(composeDayReview({ history: [], checkIns: [], now: NOW }), null);
    assert.equal(
      composeDayReview({ history: history(), checkIns: [], now: NOW }),
      null,
      'past sessions are not today'
    );
  });

  it('a session today leads the card', () => {
    const review = composeDayReview({
      history: [log(`${TODAY}T18:00:00`), ...history()],
      checkIns: [],
      now: NOW,
    });
    assert.ok(review);
    assert.match(review.fact, /sets logged today/);
  });

  it('behaviors alone are enough to earn a card — logging is the habit', () => {
    const review = composeDayReview({
      history: [],
      checkIns: [checkIn(TODAY, { behaviors: { creatine: true, bedTime: '23:00' } })],
      now: NOW,
    });
    assert.ok(review);
    assert.match(review.fact, /behaviors logged today/);
  });

  it('the reason is the athlete\'s own input, said back', () => {
    const review = composeDayReview({
      history: [log(`${TODAY}T18:00:00`), ...history()],
      checkIns: [checkIn(TODAY, { behaviors: { caffeineServings: 3, caffeineLastAt: '16:30' } })],
      now: NOW,
    });
    assert.match(review!.reason!, /3 caffeine servings/);
    assert.match(review!.reason!, /16:30/);
  });

  it('never renders more than fact, reason and option', () => {
    const review = composeDayReview({
      history: [log(`${TODAY}T18:00:00`), ...history()],
      checkIns: [checkIn(TODAY, { sleep: 1, behaviors: { caffeineServings: 2 } })],
      now: NOW,
    });
    assert.ok(dayReviewLines(review!).length <= 3);
  });
});

describe('the copy constitution', () => {
  /** Every shape the card can take, so no branch escapes the tone check. */
  function everyShape(): string[] {
    const shapes = [
      composeDayReview({ history: [log(`${TODAY}T18:00:00`), ...history()], checkIns: [], now: NOW }),
      // A much longer session than usual → the "above your average" branch.
      composeDayReview({
        history: [log(`${TODAY}T18:00:00`, 30, 140, 120), ...history()],
        checkIns: [checkIn(TODAY, { sleep: 1 })],
        now: NOW,
      }),
      // A much shorter one → the "lighter than usual" branch, which is exactly
      // where a "strain floor" claim would be tempting to write.
      composeDayReview({
        history: [log(`${TODAY}T18:00:00`, 3, 40, 20), ...history()],
        checkIns: [checkIn(TODAY, { behaviors: { alcoholServings: 2 } })],
        now: NOW,
      }),
      composeDayReview({
        history: [],
        checkIns: [checkIn(TODAY, { behaviors: { caffeineServings: 4, caffeineLastAt: '17:00' } })],
        now: NOW,
      }),
      composeDayReview({
        history: [],
        checkIns: [checkIn(TODAY, { behaviors: { creatine: true, bedTime: '22:45' } })],
        now: NOW,
      }),
    ].filter((r): r is NonNullable<typeof r> => r !== null);
    assert.ok(shapes.length >= 5, 'every branch must be exercised by the tone tests');
    return shapes.flatMap(dayReviewLines);
  }

  it('shares the push tone contract — no absence length, no streak loss', () => {
    // The same helper the nudge copy is held to. One contract, not a second one
    // that can drift: a digest that nags is a soft injury mechanic in a lifting
    // app, because streak-protection means training when you should not.
    for (const line of everyShape()) {
      assert.deepEqual(findToneViolations(line), [], `tone contract broken: ${line}`);
    }
  });

  it('never prescribes, warns, or diagnoses', () => {
    for (const line of everyShape()) {
      for (const word of [
        'you should',
        'you must',
        'need to',
        'make sure',
        'risk',
        'injury',
        'danger',
        'warning',
        'overtrain',
        'unhealthy',
        'disorder',
        'recovery is impaired',
      ]) {
        assert.ok(!line.toLowerCase().includes(word), `line prescribes or diagnoses: ${line}`);
      }
    }
  });

  it('never invents precision — no seconds, no sleep debt, no score', () => {
    for (const line of everyShape()) {
      assert.ok(!/\d+\s?s\b|\d{1,2}:\d{2}:\d{2}/.test(line), `seconds precision: ${line}`);
      assert.ok(!/debt|deficit/i.test(line), `sleep debt: ${line}`);
      assert.ok(!/\d+\s?\/\s?100|\bscore\b/i.test(line), `score leaked: ${line}`);
    }
  });

  it('never claims a strain floor or any ACWR-derived target', () => {
    // The screenshot's phrase. It is derived from a personalized daily target we
    // do not compute, over a ratio the literature contests.
    for (const line of everyShape()) {
      assert.ok(!/strain floor|below your target|under your floor|acwr/i.test(line), line);
    }
  });

  it('every option is an offer, never an order', () => {
    const reviews = [
      composeDayReview({ history: [], checkIns: [checkIn(TODAY, { behaviors: { creatine: true } })], now: NOW }),
      composeDayReview({ history: [log(`${TODAY}T18:00:00`), ...history()], checkIns: [], now: NOW }),
    ].filter((r): r is NonNullable<typeof r> => r !== null);
    for (const r of reviews) {
      if (!r.option) continue;
      assert.ok(
        /if you want|takes|keeps|is one tap/i.test(r.option),
        `option reads as an instruction: ${r.option}`
      );
    }
  });
});

describe('purity', () => {
  it('a stored streak override cannot change a single word', () => {
    // getTrainingStreak can be overridden by a localStorage key, which makes it
    // unfit for a factual sentence. This proves the module never consults it:
    // the output is a function of its inputs alone.
    const input = {
      history: [log(`${TODAY}T18:00:00`), ...history()],
      checkIns: [checkIn(TODAY, { behaviors: { bedTime: '23:00' } })],
      now: NOW,
    };
    const first = composeDayReview(input);
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: () => '999',
      setItem: () => {},
      removeItem: () => {},
    };
    const second = composeDayReview(input);
    delete (globalThis as { localStorage?: unknown }).localStorage;
    assert.deepEqual(second, first);
  });

  it('tombstoned sessions do not count as today', () => {
    const deleted = { ...log(`${TODAY}T18:00:00`), deletedAt: `${TODAY}T19:00:00` };
    assert.equal(composeDayReview({ history: [deleted], checkIns: [], now: NOW }), null);
  });
});

describe('the comparison branches actually render', () => {
  /**
   * Guard for the tone tests above: if no fixture produces an above/below
   * average sentence, every tone assertion silently skips the branch where a
   * "strain floor" claim would live. Session load is RPE x duration, so this
   * has to vary minutes, not sets.
   */
  it('a much longer session reads as above the usual', () => {
    const r = composeDayReview({
      history: [log(`${TODAY}T18:00:00`, 30, 140, 120), ...history()],
      checkIns: [],
      now: NOW,
    });
    assert.match(r!.fact, /above your recent average/);
  });

  it('a much shorter session reads as lighter than the usual', () => {
    const r = composeDayReview({
      history: [log(`${TODAY}T18:00:00`, 3, 40, 20), ...history()],
      checkIns: [],
      now: NOW,
    });
    assert.match(r!.fact, /lighter than your recent average/);
  });
});

describe('citing an established impact', () => {
  const established = {
    kind: 'established' as const,
    factor: 'creatine' as const,
    condition: 'creatine days',
    flaggedSessions: 14,
    otherSessions: 11,
    loadDeltaPct: 12,
  };

  it('a finding the athlete earned can be the reason, with its sample sizes', () => {
    const r = composeDayReview({
      history: [log(`${TODAY}T18:00:00`), ...history()],
      checkIns: [checkIn(TODAY)],
      impacts: [established],
      now: NOW,
    });
    assert.match(r!.reason!, /creatine days/);
    assert.match(r!.reason!, /\(14 vs 11 sessions\)/);
  });

  it('a still-collecting result never reaches the evening card', () => {
    // Progress bars belong on the weekly card. The digest reports findings.
    const r = composeDayReview({
      history: [log(`${TODAY}T18:00:00`), ...history()],
      checkIns: [checkIn(TODAY)],
      impacts: [
        {
          kind: 'collecting',
          factor: 'creatine',
          condition: 'creatine days',
          flagged: 7,
          unflagged: 3,
          neededFlagged: 10,
          neededUnflagged: 10,
        },
      ],
      now: NOW,
    });
    assert.ok(!/not enough data|7 of 10/.test(r?.reason ?? ''), r?.reason ?? '');
  });

  it('an impact-cited line still obeys the copy constitution', () => {
    const r = composeDayReview({
      history: [log(`${TODAY}T18:00:00`), ...history()],
      checkIns: [checkIn(TODAY)],
      impacts: [established],
      now: NOW,
    });
    for (const line of dayReviewLines(r!)) {
      assert.deepEqual(findToneViolations(line), [], line);
      assert.ok(!/because|cause|risk|injury|you should/i.test(line), line);
    }
  });
});
