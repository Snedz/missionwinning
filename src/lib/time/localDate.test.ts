import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  localDateKey,
  localDateKeyFromIso,
  localWeekKey,
  startOfLocalWeek,
  formatLocalDateKey,
  formatLocalMonthKey,
} from '@/lib/time/localDate';

/**
 * The bands that actually broke.
 *
 * `Pacific/Kiritimati` (UTC+14) and `Pacific/Midway` (UTC−11) are the extremes;
 * they are here because a noon anchor — which looks like a fix and shipped as
 * one in `coach/splitPlanner` — covers everything strictly inside ±12 and fails
 * outside it. `Pacific/Chatham` is UTC+12:45, a non-integer offset, for the same
 * reason.
 */
const ZONES = [
  'Pacific/Kiritimati', // UTC+14
  'Pacific/Chatham', // UTC+12:45
  'Pacific/Auckland',
  'Asia/Tokyo',
  'Europe/London',
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Pacific/Midway', // UTC−11
];

/** Run `fn` with the process timezone set, restoring it afterwards. */
function inZone<T>(tz: string, fn: () => T): T {
  const previous = process.env.TZ;
  process.env.TZ = tz;
  try {
    return fn();
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
}

/** A local wall-clock time, constructed inside whatever zone is active. */
function localAt(y: number, m: number, d: number, h: number, min = 0): Date {
  return new Date(y, m - 1, d, h, min, 0, 0);
}

describe('localDateKey', () => {
  it('reads local fields, never UTC', () => {
    for (const tz of ZONES) {
      inZone(tz, () => {
        // 23:30 local on the 30th is the 30th, in every zone on earth.
        assert.equal(localDateKey(localAt(2026, 7, 30, 23, 30)), '2026-07-30', tz);
        assert.equal(localDateKey(localAt(2026, 7, 30, 0, 30)), '2026-07-30', tz);
      });
    }
  });

  it('pads single-digit months and days', () => {
    assert.equal(localDateKey(localAt(2026, 1, 5, 12)), '2026-01-05');
  });

  it('an unparseable timestamp is empty, not a guessed date', () => {
    assert.equal(localDateKeyFromIso('not a date'), '');
    assert.equal(localDateKeyFromIso(''), '');
  });

  it('round-trips an ISO timestamp through its own local day', () => {
    const d = localAt(2026, 7, 30, 15);
    assert.equal(localDateKeyFromIso(d.toISOString()), '2026-07-30');
  });
});

describe('startOfLocalWeek', () => {
  /**
   * The whole bug in one assertion. Every hour of every day of a week, in nine
   * zones, must resolve to the same Monday — 2026-07-27.
   *
   * The three `toISOString()` implementations failed the evening hours east of
   * UTC; the noon-anchored one failed every hour at UTC+13 and +14.
   */
  it('is the same Monday from every hour of the week, in every zone', () => {
    for (const tz of ZONES) {
      inZone(tz, () => {
        for (let dayOfWeek = 27; dayOfWeek <= 31 + 2; dayOfWeek++) {
          for (const hour of [0, 1, 6, 12, 18, 22, 23]) {
            // 2026-07-27 is a Monday; the window runs Mon 27th → Sun 2nd Aug.
            const date =
              dayOfWeek <= 31
                ? localAt(2026, 7, dayOfWeek, hour, 30)
                : localAt(2026, 8, dayOfWeek - 31, hour, 30);
            assert.equal(
              localWeekKey(date),
              '2026-07-27',
              `${tz} ${date.toString().slice(0, 21)}`
            );
          }
        }
      });
    }
  });

  it('Sunday belongs to the week that started six days earlier, not the next one', () => {
    for (const tz of ZONES) {
      inZone(tz, () => {
        // Sunday 2026-08-02, late evening — the case `day === 0 ? -6` exists for.
        assert.equal(localWeekKey(localAt(2026, 8, 2, 23, 30)), '2026-07-27', tz);
        // Monday 2026-08-03 starts the next week.
        assert.equal(localWeekKey(localAt(2026, 8, 3, 0, 30)), '2026-08-03', tz);
      });
    }
  });

  it('returns local midnight, not an arbitrary time of day', () => {
    const start = startOfLocalWeek(localAt(2026, 7, 30, 23, 30));
    assert.equal(start.getHours(), 0);
    assert.equal(start.getMinutes(), 0);
    assert.equal(start.getSeconds(), 0);
    assert.equal(start.getMilliseconds(), 0);
    assert.equal(start.getDay(), 1, 'Monday');
  });

  it('crosses a month boundary without leaving the month', () => {
    // Wed 2026-07-01 → Monday 2026-06-29.
    assert.equal(localWeekKey(localAt(2026, 7, 1, 12)), '2026-06-29');
    // Fri 2026-01-01 → Monday 2025-12-29, across the year too.
    assert.equal(localWeekKey(localAt(2026, 1, 1, 12)), '2025-12-29');
  });

  /**
   * Spring-forward: 2026-03-08 02:00 America/New_York does not exist. Zeroing
   * the clock before shifting the date is what keeps this on the right day —
   * doing it the other way round can land an hour before midnight on Sunday.
   */
  it('survives a DST transition', () => {
    inZone('America/New_York', () => {
      assert.equal(localWeekKey(localAt(2026, 3, 8, 12)), '2026-03-02');
      assert.equal(localWeekKey(localAt(2026, 3, 9, 0, 30)), '2026-03-09');
    });
  });

  it('never returns a UTC date for a local week', () => {
    // The precise failure that shipped: 23:30 local, east of UTC.
    inZone('Asia/Tokyo', () => {
      const late = localAt(2026, 7, 30, 23, 30);
      assert.equal(localWeekKey(late), '2026-07-27');
      assert.notEqual(
        localWeekKey(late),
        startOfLocalWeek(late).toISOString().split('T')[0],
        'if these agree the test has stopped proving anything — pick a later hour'
      );
    });
  });
});

describe('formatLocalDateKey', () => {
  it('formats YYYY-MM-DD without UTC shift', () => {
    const s = formatLocalDateKey('2026-08-05', 'en-US');
    assert.match(s, /2026/);
    assert.match(s, /Aug|August|5/);
  });

  it('returns key when malformed', () => {
    assert.equal(formatLocalDateKey('nope', 'en-US'), 'nope');
  });
});

describe("formatLocalMonthKey", () => {
  it("formats YYYY-MM", () => {
    const s = formatLocalMonthKey("2026-08", "en-US");
    assert.match(s, /2026/);
    assert.match(s, /Aug|August/);
  });

  it("returns key when malformed", () => {
    assert.equal(formatLocalMonthKey("nope", "en-US"), "nope");
  });
});
