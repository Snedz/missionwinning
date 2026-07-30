import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DAY_REVIEW_MAX_HOUR,
  DAY_REVIEW_MIN_HOUR,
  dayReviewDue,
  isValidDayReviewHour,
  mayOfferDayReview,
  type DayReviewRow,
} from '@/lib/dayReviewNudge';
import { windDownDue } from '@/lib/windDown';

const ZONE = 'America/New_York';

/** 20:00 in New York on 2026-07-30. */
const EVENING = new Date('2026-07-31T00:00:00Z');

function row(over: Partial<DayReviewRow> = {}): DayReviewRow {
  return {
    dayReviewHour: 20,
    lastDayReviewAt: null,
    lastWindDownAt: null,
    timeZone: ZONE,
    ...over,
  };
}

describe('dayReviewDue', () => {
  it('fires at the hour the athlete chose, in their own zone', () => {
    assert.equal(dayReviewDue(row(), EVENING), true);
  });

  it('never fires without an opt-in hour — this nudge is strictly chosen', () => {
    assert.equal(dayReviewDue(row({ dayReviewHour: null }), EVENING), false);
  });

  it('never fires without a time zone — a guess risks 03:00', () => {
    assert.equal(dayReviewDue(row({ timeZone: null }), EVENING), false);
    assert.equal(dayReviewDue(row({ timeZone: 'Not/AZone' }), EVENING), false);
  });

  it('only at that hour, not merely in the evening', () => {
    const nineteen = new Date('2026-07-30T23:00:00Z'); // 19:00 New York
    assert.equal(dayReviewDue(row({ dayReviewHour: 20 }), nineteen), false);
    assert.equal(dayReviewDue(row({ dayReviewHour: 19 }), nineteen), true);
  });

  it('once per local day — the marker is the idempotency', () => {
    const earlierToday = new Date('2026-07-31T00:00:00Z');
    assert.equal(
      dayReviewDue(row({ lastDayReviewAt: earlierToday.toISOString() }), EVENING),
      false
    );
    // Yesterday's marker does not suppress tonight.
    const yesterday = new Date('2026-07-30T00:00:00Z');
    assert.equal(dayReviewDue(row({ lastDayReviewAt: yesterday.toISOString() }), EVENING), true);
  });

  it('stands down when wind-down already spoke tonight', () => {
    // Two pushes in one evening from a product whose position is restraint
    // would be self-refuting. Wind-down is rarer and time-critical, so it wins.
    const windDownTonight = new Date('2026-07-30T23:30:00Z'); // 19:30 New York
    assert.equal(
      dayReviewDue(row({ lastWindDownAt: windDownTonight.toISOString() }), EVENING),
      false
    );
  });

  it("last night's wind-down does not suppress tonight's review", () => {
    const lastNight = new Date('2026-07-29T23:30:00Z');
    assert.equal(dayReviewDue(row({ lastWindDownAt: lastNight.toISOString() }), EVENING), true);
  });

  it('an unparseable marker does not wedge the feature shut', () => {
    assert.equal(dayReviewDue(row({ lastDayReviewAt: 'not-a-date' }), EVENING), true);
    assert.equal(dayReviewDue(row({ lastWindDownAt: 'not-a-date' }), EVENING), true);
  });
});

describe('the precedence holds from the other side too', () => {
  it('wind-down stands down when the review already went out tonight', () => {
    const reviewTonight = new Date('2026-07-31T00:00:00Z'); // 20:00 New York
    const windDownWindow = new Date('2026-07-31T01:00:00Z'); // 21:00 New York
    const base = {
      lastSessionAt: new Date('2026-07-30T22:00:00Z').toISOString(),
      lastSessionHigh: true,
      lastWindDownAt: null,
      timeZone: ZONE,
    };
    assert.equal(windDownDue(base, windDownWindow), true, 'baseline: it would have fired');
    assert.equal(
      windDownDue({ ...base, lastDayReviewAt: reviewTonight.toISOString() }, windDownWindow),
      false,
      'the athlete has had their one push tonight'
    );
  });

  it('a review sent last night leaves wind-down free tonight', () => {
    const lastNight = new Date('2026-07-30T00:00:00Z');
    const windDownWindow = new Date('2026-07-31T01:00:00Z');
    assert.equal(
      windDownDue(
        {
          lastSessionAt: new Date('2026-07-30T22:00:00Z').toISOString(),
          lastSessionHigh: true,
          lastWindDownAt: null,
          lastDayReviewAt: lastNight.toISOString(),
          timeZone: ZONE,
        },
        windDownWindow
      ),
      true
    );
  });
});

describe('the chosen hour is bounded to the evening', () => {
  it('accepts only the evening window', () => {
    assert.equal(isValidDayReviewHour(DAY_REVIEW_MIN_HOUR), true);
    assert.equal(isValidDayReviewHour(DAY_REVIEW_MAX_HOUR), true);
    for (const bad of [null, undefined, 9, 3, 23, 17, 20.5, NaN]) {
      assert.equal(isValidDayReviewHour(bad as number), false, `${String(bad)} should be rejected`);
    }
  });

  it('a hour outside the window never fires even if stored', () => {
    const threeAm = new Date('2026-07-30T07:00:00Z'); // 03:00 New York
    assert.equal(dayReviewDue(row({ dayReviewHour: 3 }), threeAm), false);
  });
});

describe('mayOfferDayReview', () => {
  it('offers once a fortnight, and treats an unusable marker as never asked', () => {
    const now = Date.UTC(2026, 6, 30);
    assert.equal(mayOfferDayReview(null, now), true);
    assert.equal(mayOfferDayReview('gibberish', now), true);
    assert.equal(mayOfferDayReview(String(now - 3 * 86_400_000), now), false);
    assert.equal(mayOfferDayReview(String(now - 15 * 86_400_000), now), true);
  });
});
