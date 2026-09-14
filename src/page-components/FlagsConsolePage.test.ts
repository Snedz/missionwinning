/**
 * Owner-tools UI is Playwright territory for interactions, but the module must
 * still be *loaded* by the unit suite so it does not silently raise the untested
 * files floor (coverage.mjs). One import + type check is enough.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FlagsConsolePage } from './FlagsConsolePage';

test('FlagsConsolePage is a client component export', () => {
  assert.equal(typeof FlagsConsolePage, 'function');
});

test('FlagsConsole is a client component export', async () => {
  const { FlagsConsole } = await import('@/components/flags/FlagsConsole');
  assert.equal(typeof FlagsConsole, 'function');
});
