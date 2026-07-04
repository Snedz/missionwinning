import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { weightStep } from '@/lib/units';

describe('weightStep', () => {
  it('metric returns 2.5', () => {
    assert.equal(weightStep('metric'), 2.5);
  });

  it('imperial returns 5', () => {
    assert.equal(weightStep('imperial'), 5);
  });
});
