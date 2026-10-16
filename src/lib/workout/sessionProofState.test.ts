import { describe, it } from 'node:test';
import assert from 'node:assert';
import { applyProofEvent, LoggedSetProof } from './sessionProofState';

describe('sessionProofState', () => {
  it('open + claim → claimed', () => {
    const result = applyProofEvent('open', { type: 'claim' });
    assert.deepStrictEqual(result, { state: 'claimed' });
  });

  it('claim from claimed is invalid (stays claimed)', () => {
    const result = applyProofEvent('claimed', { type: 'claim' });
    assert.deepStrictEqual(result, { state: 'claimed', reason: 'invalid claim' });
  });

  it('claimed + finish with valid proof → done', () => {
    const proof: LoggedSetProof = {
      exerciseId: 'bench-press',
      sets: 3,
      dateSource: '2024-01-15',
    };
    const result = applyProofEvent('claimed', { type: 'finish', proof });
    assert.deepStrictEqual(result, { state: 'done' });
  });

  it('claimed + finish with null proof → refused missing logged-set proof', () => {
    const result = applyProofEvent('claimed', { type: 'finish', proof: null });
    assert.deepStrictEqual(result, { state: 'refused', reason: 'missing logged-set proof' });
  });

  it('claimed + finish with sets 0 → refused', () => {
    const proof: LoggedSetProof = {
      exerciseId: 'bench-press',
      sets: 0,
      dateSource: '2024-01-15',
    };
    const result = applyProofEvent('claimed', { type: 'finish', proof });
    assert.deepStrictEqual(result, { state: 'refused', reason: 'missing logged-set proof' });
  });

  it('open + finish → invalid finish', () => {
    const proof: LoggedSetProof = {
      exerciseId: 'bench-press',
      sets: 3,
      dateSource: '2024-01-15',
    };
    const result = applyProofEvent('open', { type: 'finish', proof });
    assert.deepStrictEqual(result, { state: 'open', reason: 'invalid finish' });
  });

  it('refuse from open → refused with reason', () => {
    const result = applyProofEvent('open', { type: 'refuse', reason: 'too tired' });
    assert.deepStrictEqual(result, { state: 'refused', reason: 'too tired' });
  });

  it('reset from done → open', () => {
    const result = applyProofEvent('done', { type: 'reset' });
    assert.deepStrictEqual(result, { state: 'open' });
  });
});
