import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  planSessionCheckInDismiss,
  volumeTrimToastKind,
} from './activeSessionCheckIn.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');

describe('planSessionCheckInDismiss', () => {
  it('marks skip and never offers trim when dismissed incomplete', () => {
    const plan = planSessionCheckInDismiss({
      completed: false,
      baseReadiness: 55,
      adjReadiness: 55,
    });
    assert.equal(plan.markSkipped, true);
    assert.equal(plan.offerVolumeTrim, false);
    assert.equal(plan.readinessBefore, 55);
    assert.equal(plan.readinessAfter, 55);
  });

  it('offers volume trim when completed and readiness is soft', () => {
    const plan = planSessionCheckInDismiss({
      completed: true,
      baseReadiness: 50,
      adjReadiness: 35,
    });
    assert.equal(plan.markSkipped, false);
    assert.equal(plan.offerVolumeTrim, true);
    assert.equal(plan.readinessAfter, 35);
  });

  it('does not offer trim when readiness stays high', () => {
    const plan = planSessionCheckInDismiss({
      completed: true,
      baseReadiness: 60,
      adjReadiness: 58,
    });
    assert.equal(plan.offerVolumeTrim, false);
  });
});

describe('volumeTrimToastKind', () => {
  it('maps adjust success to reduced vs no_plan', () => {
    assert.equal(volumeTrimToastKind(true), 'reduced');
    assert.equal(volumeTrimToastKind(false), 'no_plan');
  });
});

describe('Active wiring (.406)', () => {
  it('ActiveWorkoutPage uses planSessionCheckInDismiss and volumeTrimToastKind', () => {
    const src = readFileSync(
      path.join(root, 'src/page-components/ActiveWorkoutPage.tsx'),
      'utf8'
    );
    assert.match(src, /planSessionCheckInDismiss\(/);
    assert.match(src, /volumeTrimToastKind\(/);
    assert.doesNotMatch(
      src,
      /shouldOfferVolumeTrim\(/,
      'volume-trim offer must go through planSessionCheckInDismiss'
    );
  });
});
