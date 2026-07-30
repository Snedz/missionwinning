import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { dayReviewMayMount } from '@/lib/today/dayReviewMount';
import { DAY_REVIEW_START_HOUR } from '@/lib/dayReview';

/** Every phase but `i-day` — the exclusion is the one thing this decides. */
const PHASES = ['basic', 'readiness', 'commissioned'] as const;

describe('dayReviewMayMount', () => {
  it('is silent all morning and afternoon', () => {
    for (let hour = 0; hour < DAY_REVIEW_START_HOUR; hour++) {
      for (const phase of PHASES) {
        assert.equal(
          dayReviewMayMount({ hour, phase }),
          false,
          `${hour}:00 (${phase}) should not mount the evening card`
        );
      }
    }
  });

  it('mounts from the start hour to the end of the day', () => {
    for (let hour = DAY_REVIEW_START_HOUR; hour <= 23; hour++) {
      for (const phase of PHASES) {
        assert.equal(dayReviewMayMount({ hour, phase }), true, `${hour}:00 (${phase})`);
      }
    }
  });

  /**
   * The first-run screen stays bare. An athlete who has been here twenty
   * minutes has no day to review, and offering one is the shape of product
   * that greets a new user with a dashboard of zeros.
   */
  it('never mounts during in-processing, at any hour', () => {
    for (let hour = 0; hour <= 23; hour++) {
      assert.equal(dayReviewMayMount({ hour, phase: 'i-day' }), false, `${hour}:00`);
    }
  });

  /**
   * `basic` is the default phase — `phase ?? 'basic'` — and the reason `.192`
   * reached nobody. Pinned as its own case so a future narrowing of the phase
   * list has to argue with this line.
   */
  it('includes the default phase every new athlete lands on', () => {
    assert.equal(dayReviewMayMount({ hour: DAY_REVIEW_START_HOUR, phase: 'basic' }), true);
  });
});
