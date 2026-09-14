/**
 * Catalog is a closed set. A console that could mint `logger` would be a
 * second way to gate the free logger, which CONTEXT hard rule 2 forbids.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FEATURE_FLAG_CATALOG,
  FLAG_PERCENT_PRESETS,
  FORBIDDEN_FLAG_KEYS,
  isFeatureFlagKey,
} from './catalog';

test('forbidden key spellings are a closed list', () => {
  assert.deepEqual(
    [...FORBIDDEN_FLAG_KEYS].sort(),
    ['log_set', 'logger', 'private_mode'],
    'these three names are the ones that would gate Train or PRIVATE_MODE if they leaked into the catalog'
  );
});

test('no catalog key uses a forbidden name', () => {
  const forbidden = new Set<string>(FORBIDDEN_FLAG_KEYS);
  for (const entry of FEATURE_FLAG_CATALOG) {
    assert.equal(
      forbidden.has(entry.key),
      false,
      `${entry.key} is a forbidden flag name — the logger stays ungated`
    );
  }
});

test('example_staged is the reserved seed and defaults off', () => {
  assert.equal(FEATURE_FLAG_CATALOG.length, 1);
  assert.equal(FEATURE_FLAG_CATALOG[0]?.key, 'example_staged');
  assert.equal(FEATURE_FLAG_CATALOG[0]?.defaultPercent, 0);
  assert.equal(isFeatureFlagKey('example_staged'), true);
  assert.equal(isFeatureFlagKey('logger'), false);
  assert.equal(isFeatureFlagKey('not_a_flag'), false);
});

test('percent presets are the staged-rollout ladder', () => {
  assert.deepEqual([...FLAG_PERCENT_PRESETS], [0, 1, 5, 10, 25, 50, 100]);
});
