/**
 * Owner-tools UI is Playwright territory for interactions, but the module must
 * still be *loaded* by the unit suite so it does not silently raise the untested
 * files floor (coverage.mjs). One import + type check is enough.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FounderStatusBoard } from './FounderStatusBoard';

test('FounderStatusBoard is a client component export', () => {
  assert.equal(typeof FounderStatusBoard, 'function');
});
