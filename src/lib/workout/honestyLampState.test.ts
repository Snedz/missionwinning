import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  LAMPS,
  allowedStates,
  nextState,
  stripToken,
} from './honestyLampState';

describe('honestyLampState', () => {
  it('LAMPS length 7 and order WARMUP…FUEL', () => {
    assert.strictEqual(LAMPS.length, 7);
    assert.deepStrictEqual(LAMPS, ['WARMUP', 'DRILL', 'SYNC', 'PATH', 'REVIEW', 'WINDOW', 'FUEL']);
  });

  it('REVIEW allows UNREAD; WARMUP does not allow UNREAD', () => {
    assert.strictEqual(allowedStates('REVIEW').includes('UNREAD'), true);
    assert.strictEqual(allowedStates('WARMUP').includes('UNREAD'), false);
  });

  it('empty_critic on REVIEW → UNREAD', () => {
    const result = nextState('REVIEW', 'PASS', 'empty_critic');
    assert.strictEqual(result, 'UNREAD');
  });

  it('unreachable_source from PASS → UNKNOWN', () => {
    const result = nextState('WARMUP', 'PASS', 'unreachable_source');
    assert.strictEqual(result, 'UNKNOWN');
  });

  it('unreachable_source from WIN → UNKNOWN', () => {
    const result = nextState('WARMUP', 'WIN', 'unreachable_source');
    assert.strictEqual(result, 'UNKNOWN');
  });

  it('fresh_evidence on WARMUP from UNREAD → null', () => {
    const result = nextState('WARMUP', 'UNREAD', 'fresh_evidence');
    assert.strictEqual(result, null);
  });

  it('side_check_ok from HOLD → null (forbidden)', () => {
    const result = nextState('WARMUP', 'HOLD', 'side_check_ok');
    assert.strictEqual(result, null);
  });

  it("stripToken('FUEL', 'UNKNOWN') === 'FUEL=UNKNOWN'", () => {
    assert.strictEqual(stripToken('FUEL', 'UNKNOWN'), 'FUEL=UNKNOWN');
  });
});
