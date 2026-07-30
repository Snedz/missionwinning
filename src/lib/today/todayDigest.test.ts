import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTodayDigest, isFullDebriefDay } from '@/lib/today/todayDigest';
import type { MindCheckIn } from '@/lib/mindCheckIns';
import type { CompletedWorkoutLog } from '@/types';
import type { WeeklyDebrief } from '@/lib/weeklyDebrief';

const NOW = new Date('2026-07-30T20:00:00'); // a Thursday

function session(daysAgo: number, minutes: number): CompletedWorkoutLog {
  const d = new Date(NOW);
  d.setDate(d.getDate() - daysAgo);
  return {
    id: `w${daysAgo}`,
    workoutName: 'Session',
    startedAt: d.toISOString(),
    completedAt: d.toISOString(),
    durationSeconds: minutes * 60,
    totalVolume: 5000,
    exercises: [{ exerciseId: 'bench-press', sets: [{ reps: 8, weight: 60 }] }],
  };
}

function checkIn(daysAgo: number, bedTime: string): MindCheckIn {
  const d = new Date(NOW);
  d.setDate(d.getDate() - daysAgo);
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
  return { date, sleep: 3, mood: 3, stress: 3, energy: 3, behaviors: { bedTime } };
}

const EMPTY = { history: [], checkIns: [], bodyMetrics: [], now: NOW, wantDebrief: false };

describe('isFullDebriefDay', () => {
  it('is Sunday and Monday, and nothing else', () => {
    // 2026-07-26 is a Sunday.
    const days = [26, 27, 28, 29, 30, 31, 1].map((d, i) => ({
      date: new Date(2026, 6, 26 + i, 12),
      expect: i === 0 || i === 1,
    }));
    for (const { date, expect } of days) {
      assert.equal(isFullDebriefDay(date), expect, date.toDateString());
    }
  });

  /**
   * This is the whole reason a Tuesday can skip the debrief: `weeklyDebrief`'s
   * own `isFullDebrief` is exactly `day === 0 || day === 1`, so deciding it here
   * is not a heuristic that could drift from the real answer — it *is* the real
   * answer, reached without building the thing that would have reported it.
   */
  it('agrees with the debrief it lets us skip', async () => {
    const { buildWeeklyDebrief } = await import('@/lib/weeklyDebrief');
    for (let i = 0; i < 7; i++) {
      const now = new Date(2026, 6, 26 + i, 12);
      assert.equal(
        buildWeeklyDebrief({ history: [], now }).isFullDebrief,
        isFullDebriefDay(now),
        now.toDateString()
      );
    }
  });
});

describe('buildTodayDigest', () => {
  it('says nothing on an empty device without throwing', () => {
    const d = buildTodayDigest(EMPTY);
    assert.equal(d.consistency, null);
    assert.equal(d.sleepProgress, null);
    assert.equal(d.review, null);
    assert.equal(d.debrief, null);
    assert.deepEqual(d.impacts, []);
    assert.deepEqual(d.behaviorImpacts, []);
  });

  /**
   * The duplication this module exists to remove. `TodayDayReviewCard` and
   * `TodayWeekRecapCard` each ran `computeBehaviorImpacts(history, checkIns)`
   * with byte-identical arguments, on the same render, over the same arrays.
   */
  it('runs the behavior correlation once and shares the result', () => {
    const history = [1, 3, 5, 7, 9].map((d) => session(d, 45));
    const checkIns = [1, 2, 3, 4, 5, 6].map((d) => checkIn(d, '23:00'));
    const d = buildTodayDigest({ ...EMPTY, history, checkIns });
    // Same array identity, not merely equal contents: two equal arrays would
    // mean two passes that happened to agree.
    assert.ok(
      d.establishedBehaviorImpacts.every((i) => d.behaviorImpacts.includes(i)),
      'the established subset must come from the one computed list'
    );
  });

  it('the evening review speaks only from established impacts', () => {
    const history = [1, 3, 5].map((d) => session(d, 45));
    const checkIns = [1, 2, 3].map((d) => checkIn(d, '23:00'));
    const d = buildTodayDigest({ ...EMPTY, history, checkIns });
    assert.ok(
      d.establishedBehaviorImpacts.every((i) => i.kind === 'established'),
      'a "still collecting" progress bar has no business in a one-line evening digest'
    );
  });

  it('sleep progress and the sleep band are never both present', () => {
    for (const nights of [0, 1, 3, 5, 8]) {
      const checkIns = Array.from({ length: nights }, (_, i) => checkIn(i + 1, '23:00'));
      const d = buildTodayDigest({ ...EMPTY, checkIns });
      assert.ok(
        !(d.consistency && d.sleepProgress),
        `${nights} nights produced both a band and a progress line`
      );
    }
  });

  it('shows the collecting line only while the band is silent', () => {
    const few = buildTodayDigest({ ...EMPTY, checkIns: [1, 2, 3].map((d) => checkIn(d, '23:00')) });
    assert.notEqual(few.sleepProgress, null);
    assert.equal(few.consistency, null);

    const many = buildTodayDigest({
      ...EMPTY,
      checkIns: [1, 2, 3, 4, 5, 6].map((d) => checkIn(d, '23:00')),
    });
    assert.notEqual(many.consistency, null);
    assert.equal(many.sleepProgress, null);
  });
});

describe('the weekly debrief is a Sunday cost', () => {
  const spy = () => {
    let calls = 0;
    const build = () => {
      calls += 1;
      return { isFullDebrief: true } as unknown as WeeklyDebrief;
    };
    return { build, calls: () => calls };
  };

  /**
   * A Tuesday used to build the entire weekly debrief in order to read
   * `isFullDebrief` off it and discover it was not the weekend. Asserting the
   * builder ran **zero** times is why it is injected rather than imported: a
   * comment claiming "we skip this midweek" cannot be checked.
   */
  it('never runs midweek', () => {
    const s = spy();
    const d = buildTodayDigest({ ...EMPTY, wantDebrief: false, buildDebrief: s.build });
    assert.equal(s.calls(), 0, 'the debrief must not be built on a day that cannot show it');
    assert.equal(d.debrief, null);
  });

  it('runs exactly once on the day that shows it', () => {
    const s = spy();
    const d = buildTodayDigest({ ...EMPTY, wantDebrief: true, buildDebrief: s.build });
    assert.equal(s.calls(), 1);
    assert.notEqual(d.debrief, null);
  });

  it('is null rather than a crash when the module has not loaded yet', () => {
    // The hook imports `weeklyDebrief` dynamically, so there is a frame on
    // Sunday where the day is right and the builder has not arrived.
    const d = buildTodayDigest({ ...EMPTY, wantDebrief: true });
    assert.equal(d.debrief, null);
  });
});
