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
});
