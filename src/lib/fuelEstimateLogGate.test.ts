import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  estimateLogAllowed,
  estimateLogNeedsAthleteEdit,
} from './fuelEstimateLogGate.ts';

describe('estimateLogAllowed', () => {
  it('blocks when name is empty (any confidence)', () => {
    assert.equal(
      estimateLogAllowed({
        name: '   ',
        confidence: 'high',
        athleteTouched: true,
      }),
      false
    );
    assert.equal(
      estimateLogAllowed({
        name: '',
        confidence: 'low',
        athleteTouched: true,
      }),
      false
    );
  });

  it('low confidence + no touch → Log disabled', () => {
    assert.equal(
      estimateLogAllowed({
        name: 'Mystery meal',
        confidence: 'low',
        athleteTouched: false,
      }),
      false
    );
  });

  it('low confidence + edit → Log enabled when name non-empty', () => {
    assert.equal(
      estimateLogAllowed({
        name: 'Mystery meal',
        confidence: 'low',
        athleteTouched: true,
      }),
      true
    );
  });

  it('medium/high → Log enabled with name only (no touch required)', () => {
    assert.equal(
      estimateLogAllowed({
        name: 'Chicken rice',
        confidence: 'medium',
        athleteTouched: false,
      }),
      true
    );
    assert.equal(
      estimateLogAllowed({
        name: 'Chicken rice',
        confidence: 'high',
        athleteTouched: false,
      }),
      true
    );
  });

  it('missing confidence defaults like medium (name only)', () => {
    assert.equal(
      estimateLogAllowed({ name: 'Eggs', athleteTouched: false }),
      true
    );
  });

  it('requireEdit gates even at medium confidence until touch', () => {
    assert.equal(
      estimateLogAllowed({
        name: 'Color guess meal',
        confidence: 'medium',
        requireEdit: true,
        athleteTouched: false,
      }),
      false
    );
    assert.equal(
      estimateLogAllowed({
        name: 'Color guess meal',
        confidence: 'medium',
        requireEdit: true,
        athleteTouched: true,
      }),
      true
    );
  });

  it('requireEdit false does not force touch on medium', () => {
    assert.equal(
      estimateLogAllowed({
        name: 'Matched',
        confidence: 'medium',
        requireEdit: false,
        athleteTouched: false,
      }),
      true
    );
  });
});

describe('estimateLogNeedsAthleteEdit', () => {
  it('true only while gated and untouched', () => {
    assert.equal(
      estimateLogNeedsAthleteEdit({
        confidence: 'low',
        athleteTouched: false,
      }),
      true
    );
    assert.equal(
      estimateLogNeedsAthleteEdit({
        confidence: 'low',
        athleteTouched: true,
      }),
      false
    );
    assert.equal(
      estimateLogNeedsAthleteEdit({
        confidence: 'high',
        athleteTouched: false,
      }),
      false
    );
    assert.equal(
      estimateLogNeedsAthleteEdit({
        confidence: 'medium',
        requireEdit: true,
        athleteTouched: false,
      }),
      true
    );
  });
});
