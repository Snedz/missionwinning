import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DAY_REVIEW_DEFAULT_HOUR,
  DAY_REVIEW_HOURS,
  cadenceHourPatch,
  dayReviewOfferState,
  readDayReviewHour,
  type DayReviewOfferInput,
} from '@/lib/dayReviewPrefs';
import { DAY_REVIEW_MAX_HOUR, DAY_REVIEW_MIN_HOUR } from '@/lib/dayReviewNudge';

const BASE: DayReviewOfferInput = {
  hasPush: false,
  supported: true,
  iosNeedsInstall: false,
  storedHour: null,
  dismissed: false,
};

describe('readDayReviewHour', () => {
  it('reads back what the picker writes, for every offerable hour', () => {
    for (const h of DAY_REVIEW_HOURS) {
      assert.equal(readDayReviewHour(String(h)), h);
    }
  });

  it('the default hour is one the picker actually offers', () => {
    assert.ok(DAY_REVIEW_HOURS.includes(DAY_REVIEW_DEFAULT_HOUR));
  });

  it('the offered hours are exactly the band the server accepts', () => {
    assert.equal(DAY_REVIEW_HOURS[0], DAY_REVIEW_MIN_HOUR);
    assert.equal(DAY_REVIEW_HOURS[DAY_REVIEW_HOURS.length - 1], DAY_REVIEW_MAX_HOUR);
  });

  /**
   * Garbage means *not opted in*, never a default hour. This reads device
   * storage, including values written by an older build or edited by hand, and
   * an unrequested nightly notification is the one failure this feature cannot
   * have — so every unreadable input has to fall to null, not to 20:00.
   */
  it('anything unreadable is not-opted-in, never a fallback hour', () => {
    for (const bad of [
      null,
      undefined,
      '',
      '  ',
      'twenty',
      '20:00',
      '20.5',
      '-20',
      '1e1',
      20,
      {},
      [],
      true,
    ]) {
      assert.equal(readDayReviewHour(bad), null, `${JSON.stringify(bad)} must read as null`);
    }
  });

  it('an hour outside the band is refused, not clamped', () => {
    for (const out of ['0', '9', '17', '23', '99']) {
      assert.equal(readDayReviewHour(out), null, out);
    }
  });
});

describe('dayReviewOfferState', () => {
  /**
   * The row `.194` got wrong, and the whole reason this module exists.
   *
   * The old card returned early on `hasLocalPushSubscription()`, reasoning that
   * a device with push had already been asked about notifications. True, and
   * irrelevant: it was asked about the *wind-down* note. Nothing had ever asked
   * it about the evening review, so `day_review_hour` stayed NULL for every
   * athlete who would plausibly want one, and the push fired for nobody.
   */
  it('offers the hour to a device that already has push', () => {
    assert.equal(dayReviewOfferState({ ...BASE, hasPush: true }), 'offer');
  });

  it('offers the hour to a device with no push yet', () => {
    assert.equal(dayReviewOfferState({ ...BASE, hasPush: false }), 'offer');
  });

  it('having push and having an hour are independent facts', () => {
    for (const hasPush of [true, false]) {
      assert.equal(dayReviewOfferState({ ...BASE, hasPush }), 'offer', `hasPush=${hasPush}`);
    }
  });

  it('says nothing once an hour is chosen — changing it belongs in Profile', () => {
    for (const h of DAY_REVIEW_HOURS) {
      assert.equal(dayReviewOfferState({ ...BASE, storedHour: h }), 'hidden', String(h));
    }
  });

  it('a chosen hour outranks a dismissal, and both silence the card', () => {
    assert.equal(dayReviewOfferState({ ...BASE, storedHour: 19, dismissed: true }), 'hidden');
    assert.equal(dayReviewOfferState({ ...BASE, dismissed: true }), 'hidden');
  });

  it('offers the install on iOS before the app is on the home screen', () => {
    assert.equal(
      dayReviewOfferState({ ...BASE, supported: false, iosNeedsInstall: true }),
      'install'
    );
  });

  it('a browser that cannot take push and is not iOS gets nothing', () => {
    assert.equal(
      dayReviewOfferState({ ...BASE, supported: false, iosNeedsInstall: false }),
      'hidden'
    );
  });

  /**
   * Total over the input space, not merely correct on the cases someone thought
   * of. Thirty-two combinations; the assertion is that every one resolves and
   * that the two suppressing facts always win.
   */
  it('is total over the whole table', () => {
    for (const hasPush of [true, false]) {
      for (const supported of [true, false]) {
        for (const iosNeedsInstall of [true, false]) {
          for (const storedHour of [null, 20]) {
            for (const dismissed of [true, false]) {
              const input = { hasPush, supported, iosNeedsInstall, storedHour, dismissed };
              const state = dayReviewOfferState(input);
              assert.ok(
                ['hidden', 'offer', 'install'].includes(state),
                `${JSON.stringify(input)} → ${state}`
              );
              if (storedHour !== null || dismissed) {
                assert.equal(state, 'hidden', `${JSON.stringify(input)} should be silent`);
              }
            }
          }
        }
      }
    }
  });
});

/**
 * The clobber this exists to prevent: a laptop that has never set an evening
 * hour must not clear the one set on a phone, just by opening Profile.
 *
 * This was a source-text check first and a mutant walked straight through it —
 * grepping for a field name cannot tell `{ dayReviewHour: storedHour }` from
 * `...(storedHour !== null ? { dayReviewHour: storedHour } : {})`, and those two
 * differ by whether a passive page mount silently turns the feature off. The
 * rule became a function so a test can hold its output instead of its spelling.
 */
describe('cadenceHourPatch', () => {
  it('says nothing when this device has no hour of its own', () => {
    const patch = cadenceHourPatch(null);
    assert.ok(
      !('dayReviewHour' in patch),
      'a device with no stored hour must omit the field entirely — sending null clears an hour set elsewhere'
    );
    assert.deepEqual(patch, {});
  });

  it('carries the hour when this device has one', () => {
    for (const h of DAY_REVIEW_HOURS) {
      assert.deepEqual(cadenceHourPatch(h), { dayReviewHour: h }, String(h));
    }
  });

  it('never emits an explicit null — clearing is a deliberate act, not a side effect', () => {
    for (const stored of [null, ...DAY_REVIEW_HOURS]) {
      const patch = cadenceHourPatch(stored);
      assert.notEqual(
        patch.dayReviewHour,
        null,
        `cadenceHourPatch(${stored}) emitted null; only the Off control may do that`
      );
    }
  });
});
