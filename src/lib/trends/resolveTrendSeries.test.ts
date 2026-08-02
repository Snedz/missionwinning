/**
 * A chart is a claim, and this is the file that decides what it claims.
 *
 * `.260` — landed on master without a test, caught by the coverage ratchet. Its
 * own header states the rule it exists to keep: *"Asking for ninety days with
 * three logged entries must not draw a flat line back to an invented zero — the
 * app would be showing a plateau that never happened."*
 *
 * That is one honest sentence and two opposite implementations, which is why it
 * needs pinning:
 *
 *   - **Body metrics are entries, not buckets.** Someone weighs in when they step
 *     on a scale. Padding those to the window draws weeks of zeroes between two
 *     real weigh-ins — a body-fat chart plunging to 0% and back.
 *   - **Daily buckets are buckets.** A rest day genuinely *is* zero volume, so
 *     padding is correct there and `short` has to mean something different:
 *     whether any of the window was lived in at all.
 *
 * Get the two the wrong way round and nothing errors. The chart just lies.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { resolveTrendSeries } from '@/lib/trends/resolveTrendSeries';
import { TREND_METRICS } from '@/lib/trends/trendMetrics';
import { buildTodayTrends } from '@/lib/todayTrends';
import { saveBodyMetric } from '@/lib/bodyMetrics';
import { __resetForTests as resetStorage } from '@/lib/storage/safeStorage';
import { localDateKey } from '@/lib/time/localDate';
import type { TrendQuery } from '@/lib/trends/parseTrendQuery';

function installStorage(): () => void {
  const map = new Map<string, string>();
  const g = globalThis as { localStorage?: Storage };
  const prev = g.localStorage;
  g.localStorage = {
    getItem: (k: string) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: (i: number) => [...map.keys()][i] ?? null,
    get length() {
      return map.size;
    },
  } as unknown as Storage;
  return () => {
    if (prev === undefined) delete g.localStorage;
    else g.localStorage = prev;
  };
}

let uninstall: () => void;
beforeEach(() => {
  uninstall = installStorage();
  resetStorage();
});
afterEach(() => {
  uninstall();
  resetStorage();
});

const query = (metric: string, windowDays: number): TrendQuery =>
  ({ metric, windowDays, windowAssumed: false }) as TrendQuery;

/** Days back from today, derived from the same clock `lastDayBuckets` reads. */
function dayKey(daysAgo: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return localDateKey(d);
}

describe('daily buckets — padded, because a rest day is data', () => {
  it('returns exactly the window asked for, even with no history', () => {
    for (const days of [7, 30, 90]) {
      const r = resolveTrendSeries(query('volume', days), []);
      assert.equal(r.points.length, days, `${days}-day window`);
      assert.equal(r.askedDays, days);
    }
  });

  it('an empty window is short — nothing in it was lived in', () => {
    const r = resolveTrendSeries(query('volume', 30), []);
    assert.equal(r.short, true);
    assert.ok(
      r.points.every((p) => p.value === 0),
      'unlogged days read as zero rather than as gaps'
    );
  });

  it('carries the metric definition through', () => {
    const r = resolveTrendSeries(query('volume', 7), []);
    assert.equal(r.metric.id, 'volume');
    assert.equal(r.metric.unit, 'weight');
  });

  it('buckets are consecutive local days ending today', () => {
    const r = resolveTrendSeries(query('sessions', 7), []);
    assert.equal(r.points[r.points.length - 1].key, dayKey(0), 'last bucket is today');
    assert.equal(r.points[0].key, dayKey(6), 'first bucket is six days back');
    for (const p of r.points) {
      assert.match(p.key, /^\d{4}-\d{2}-\d{2}$/, 'local day key, never a UTC timestamp');
    }
  });
});

/**
 * The axis switch. Thirty repeating "T"s is not an axis — the file says so — so
 * a week gets weekday letters and anything longer gets dates.
 */
describe('labels', () => {
  it('a week or less is weekday letters', () => {
    for (const days of [3, 7]) {
      const r = resolveTrendSeries(query('volume', days), []);
      for (const p of r.points) {
        assert.ok(p.label.length <= 2, `${days}d: ${JSON.stringify(p.label)} is not a weekday letter`);
        assert.ok(!p.label.includes('/'), `${days}d: got a date, expected a weekday letter`);
      }
    }
  });

  it('beyond a week is a numeric date', () => {
    const r = resolveTrendSeries(query('volume', 8), []);
    assert.ok(
      r.points.every((p) => /\d+\/\d+/.test(p.label)),
      `8-day window must use dates, got ${JSON.stringify(r.points.slice(0, 3).map((p) => p.label))}`
    );
  });
});

/**
 * The half that must **not** pad. `bodyMetricSeries` returns real weigh-ins; the
 * points come back at their own length and the caller is told the window was not
 * filled, rather than the axis implying a history nobody logged.
 */
describe('body metrics — real entries, never padded', () => {
  it('returns only the entries that exist, not the window', () => {
    saveBodyMetric({ date: dayKey(1), weightKg: 80 });
    saveBodyMetric({ date: dayKey(10), weightKg: 82 });
    resetStorage();

    const r = resolveTrendSeries(query('bodyweight', 90), []);
    assert.equal(
      r.points.length,
      2,
      'padding two weigh-ins to 90 points draws eighty-eight days of invented zeroes'
    );
    assert.equal(r.askedDays, 90, 'what was asked for is still reported');
    assert.deepEqual(
      r.points.map((p) => p.value),
      [82, 80],
      'chronological — oldest first, as a chart reads'
    );
  });

  it('fewer than two entries is short — one point is not a trend', () => {
    saveBodyMetric({ date: dayKey(1), weightKg: 80 });
    resetStorage();
    const one = resolveTrendSeries(query('bodyweight', 30), []);
    assert.equal(one.points.length, 1);
    assert.equal(one.short, true);

    saveBodyMetric({ date: dayKey(5), weightKg: 81 });
    resetStorage();
    const two = resolveTrendSeries(query('bodyweight', 30), []);
    assert.equal(two.points.length, 2);
    assert.equal(two.short, false, 'two real weigh-ins are a trend');
  });

  /**
   * `short` means different things on the two paths, and that is deliberate: a
   * body metric is short when there is too little to draw, a daily bucket when
   * none of the window was lived in. Two real weigh-ins of value 0 would be a
   * legitimate series; thirty zero-volume days would not.
   */
  it('a body metric is not short merely because a value is zero', () => {
    saveBodyMetric({ date: dayKey(1), bodyFatPct: 0 });
    saveBodyMetric({ date: dayKey(4), bodyFatPct: 0 });
    resetStorage();
    const r = resolveTrendSeries(query('bodyfat', 30), []);
    assert.equal(r.points.length, 2);
    assert.equal(
      r.short,
      false,
      'the daily-bucket rule (every value zero ⇒ short) must not leak onto entries'
    );
  });

  it('no weigh-ins at all is an empty, short series rather than a padded one', () => {
    const r = resolveTrendSeries(query('waist', 30), []);
    assert.deepEqual(r.points, []);
    assert.equal(r.short, true);
  });
});

/**
 * The invariant behind `values[i] ?? 0`, pinned properly.
 *
 * A mutant removing that `?? 0` **survived**, and it is equivalent *today*:
 * `buildTodayTrends` emits exactly the four non-body ids and builds each with
 * `days.map(...)`, so `values` always matches the bucket count and the fallback
 * is unreachable. Contorting a test to kill it would pin the implementation.
 *
 * What it is actually defending is the future: add a fifth metric to
 * `TREND_METRICS` without giving `buildTodayTrends` a source for it, and
 * `find()` returns undefined, `values` is `[]`, and every point's value is
 * `undefined` — a chart drawing nothing where it claims to draw a quantity.
 * `trendMetric` guards the other half of that seam and says so in its own
 * comment; this guards this half, and it **discovers** rather than lists
 * (`.220`), so the fifth metric fails here rather than on a chart.
 */
describe('every askable non-body metric has a source', () => {
  /*
   * Asserted against `buildTodayTrends` directly rather than against the resolved
   * points — because `?? 0` makes the two indistinguishable at the output.
   *
   * The first version of this guard checked that every point came back numeric
   * and full-length, and **deleting a whole series from `buildTodayTrends` did
   * not turn it red**: `found` became undefined, `values` became `[]`, and the
   * fallback dutifully produced fourteen zeroes of the right type. A metric with
   * no source is indistinguishable from a metric with no data, downstream. The
   * only place the difference is visible is here, at the seam.
   */
  /*
   * Compared as plain strings on purpose. `TrendMetricId` is declared **twice** —
   * once in `trends/trendMetrics.ts` covering everything askable, once in
   * `todayTrends.ts` covering only what it emits — and the two unions genuinely
   * differ, which is what makes this seam able to drift in the first place. The
   * compiler therefore cannot compare them, and widening one to satisfy it would
   * erase the very distinction this test is here to check.
   */
  it('buildTodayTrends emits a series for every non-body metric in the registry', () => {
    const askable = TREND_METRICS.filter((m) => !m.bodyMetric)
      .map((m) => String(m.id))
      .sort();
    const emitted = buildTodayTrends([], 'en', 14).series.map((s) => String(s.id)).sort();

    assert.deepEqual(
      askable.filter((id) => !emitted.includes(id)),
      [],
      'these metrics can be asked for and have nowhere to get their numbers. ' +
        'They would chart as a flat zero line, indistinguishable from "you logged nothing".'
    );
    assert.deepEqual(
      emitted.filter((id) => !askable.includes(id)),
      [],
      'a series nothing can ask for — either add it to TREND_METRICS or drop it'
    );
  });

  it('every emitted series is exactly as long as the window', () => {
    const trends = buildTodayTrends([], 'en', 14);
    for (const s of trends.series) {
      assert.equal(
        s.values.length,
        14,
        `${s.id}: a short values array is what \`values[i] ?? 0\` silently pads over`
      );
    }
  });
});
