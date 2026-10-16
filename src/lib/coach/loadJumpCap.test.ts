import { test } from 'node:test';
import assert from 'node:assert/strict';
import { capLoadJump, maxJumpForUnit, MAX_JUMP_KG, MAX_JUMP_LB } from './loadJumpCap.ts';

test('capLoadJump: caps kg jump from 100 to 107.5', () => {
  const result = capLoadJump({ proposed: 107.5, lastLogged: 100, unit: 'kg' });
  assert.strictEqual(result.capped, true);
  assert.strictEqual(result.weight, 105);
  assert.strictEqual(result.reason, 'capped to max jump');
});

test('capLoadJump: allows kg jump within limit', () => {
  const result = capLoadJump({ proposed: 104, lastLogged: 100, unit: 'kg' });
  assert.strictEqual(result.capped, false);
  assert.strictEqual(result.weight, 104);
  assert.strictEqual(result.reason, 'within max jump');
});

test('capLoadJump: allows kg decrease', () => {
  const result = capLoadJump({ proposed: 95, lastLogged: 100, unit: 'kg' });
  assert.strictEqual(result.capped, false);
  assert.strictEqual(result.weight, 95);
  assert.strictEqual(result.reason, 'within or below last');
});

test('capLoadJump: returns null when lastLogged is null', () => {
  const result = capLoadJump({ proposed: 100, lastLogged: null, unit: 'kg' });
  assert.strictEqual(result.weight, null);
  assert.strictEqual(result.reason, 'no last logged weight');
});

test('capLoadJump: returns null for invalid proposed', () => {
  const resultNaN = capLoadJump({ proposed: NaN, lastLogged: 100, unit: 'kg' });
  assert.strictEqual(resultNaN.weight, null);
  assert.strictEqual(resultNaN.reason, 'invalid proposed');

  const resultNeg = capLoadJump({ proposed: -5, lastLogged: 100, unit: 'kg' });
  assert.strictEqual(resultNeg.weight, null);
  assert.strictEqual(resultNeg.reason, 'invalid proposed');
});

test('capLoadJump: caps lb jump from 210 to 225', () => {
  const result = capLoadJump({ proposed: 225, lastLogged: 210, unit: 'lb' });
  assert.strictEqual(result.capped, true);
  assert.strictEqual(result.weight, 220);
  assert.strictEqual(result.reason, 'capped to max jump');
});

test('maxJumpForUnit returns correct values', () => {
  assert.strictEqual(maxJumpForUnit('kg'), MAX_JUMP_KG);
  assert.strictEqual(maxJumpForUnit('lb'), MAX_JUMP_LB);
});
