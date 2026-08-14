import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { shouldOfferSessionCheckInDecision } from './sessionCheckInOffer.ts';

describe('shouldOfferSessionCheckInDecision', () => {
  const open: Parameters<typeof shouldOfferSessionCheckInDecision>[0] = {
    completedHistoryLength: 2,
    skippedForToday: false,
    todayCheckInComplete: false,
    loggedSetsThisSession: 1,
  };

  it('never offers on the first mission (empty history)', () => {
    assert.equal(
      shouldOfferSessionCheckInDecision({ ...open, completedHistoryLength: 0 }),
      false
    );
  });

  it('may offer from the second completed session onward', () => {
    assert.equal(
      shouldOfferSessionCheckInDecision({ ...open, completedHistoryLength: 1 }),
      true
    );
    assert.equal(shouldOfferSessionCheckInDecision(open), true);
  });

  /**
   * `.767` — shard 3 (IL/IN/SEA, ops #14) measured "too many taps to log a set"
   * on the *returning* path, the one the first-mission rule above excluded. The
   * sheet is a full-viewport overlay, so before this the logger was on screen
   * and unclickable until the athlete dealt with a questionnaire.
   */
  it('never stands between arriving on Active and the first set', () => {
    assert.equal(
      shouldOfferSessionCheckInDecision({ ...open, loggedSetsThisSession: 0 }),
      false,
      'a returning athlete must reach Log set without answering anything'
    );
    assert.equal(
      shouldOfferSessionCheckInDecision({ ...open, loggedSetsThisSession: 1 }),
      true,
      'once a set is on the board the sheet may ask'
    );
  });

  it('applies every gate independently — no single condition carries the rule', () => {
    // Each false-maker alone must be enough; a rule that only fails when two
    // things are wrong is a rule with a hole in it.
    for (const override of [
      { completedHistoryLength: 0 },
      { loggedSetsThisSession: 0 },
      { skippedForToday: true },
      { todayCheckInComplete: true },
    ]) {
      assert.equal(
        shouldOfferSessionCheckInDecision({ ...open, ...override }),
        false,
        `offered anyway with ${JSON.stringify(override)}`
      );
    }
  });

  it('respects skip-for-today and already-complete check-in', () => {
    assert.equal(
      shouldOfferSessionCheckInDecision({ ...open, skippedForToday: true }),
      false
    );
    assert.equal(
      shouldOfferSessionCheckInDecision({ ...open, todayCheckInComplete: true }),
      false
    );
  });
});

describe('session check-in offer wiring (.293)', () => {
  const root = path.join(import.meta.dirname, '..', '..', '..');

  it('the sheet delegates to the pure decision (one definition)', () => {
    const sheet = readFileSync(
      path.join(root, 'src/components/workout/SessionCheckInSheet.tsx'),
      'utf8'
    );
    assert.match(
      sheet,
      /shouldOfferSessionCheckInDecision/,
      'SessionCheckInSheet must call the pure decision — not re-implement W1 inline'
    );
    assert.match(
      sheet,
      /completedHistoryLength/,
      'history length must be passed into the decision, not only mentioned in a comment'
    );
  });

  it('Active still gates open on shouldOfferSessionCheckIn', () => {
    const active = readFileSync(
      path.join(root, 'src/page-components/ActiveWorkoutPage.tsx'),
      'utf8'
    );
    assert.match(active, /shouldOfferSessionCheckIn\(/);
  });

  it('Active passes the live set count, and re-runs when it changes', () => {
    const active = readFileSync(
      path.join(root, 'src/page-components/ActiveWorkoutPage.tsx'),
      'utf8'
    );
    assert.match(
      active,
      /shouldOfferSessionCheckIn\(loggedSetsThisSession\)/,
      'the count must reach the decision, or the sheet opens before the first set again'
    );
    assert.match(
      active,
      /\[sessionKey, loggedSetsThisSession\]/,
      'the effect must depend on the count — otherwise it only ever runs at set 0'
    );
  });

  /**
   * The other half of the same defect: every row starts at 3, so tapping the
   * primary to get past the sheet used to record a 3/3/3 readiness check-in the
   * athlete never answered — into the scores Mission Coach reasons from.
   */
  it('the sheet records only rows the athlete moved', () => {
    const sheet = readFileSync(
      path.join(root, 'src/components/workout/SessionCheckInSheet.tsx'),
      'utf8'
    );
    assert.match(sheet, /touched/, 'the sheet must track which rows were moved');
    assert.match(
      sheet,
      /if \(touched\.size === 0\) \{\s*skip\(\);/,
      'an untouched Save must write nothing — not a neutral 3/3/3 row'
    );
    assert.doesNotMatch(
      sheet,
      /upsertTodayPartial\(\{\s*soreness,\s*sleep,\s*energy: motivation,\s*\}\)/,
      'unconditional write is back: this is the fabricated-readiness path'
    );

    /*
     * Every row, not just the mechanism. A mutant that dropped `touch()` from
     * one `QuickRow` survived the assertions above: that row could be moved and
     * still not be saved, which is the same lie in the other direction.
     */
    const rows = sheet.split('<QuickRow').slice(1);
    assert.equal(rows.length, 3, `expected three check-in rows, found ${rows.length}`);
    for (const row of rows) {
      const label = /label=\{t\('([^']+)'/.exec(row)?.[1] ?? '(unknown)';
      assert.match(
        row.slice(0, row.indexOf('/>')),
        /touch\(/,
        `${label} does not record that it was moved, so a real answer is dropped`
      );
    }
  });
});
