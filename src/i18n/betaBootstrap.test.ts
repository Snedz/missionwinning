/**
 * `/beta` first paint must never show bare keys — beta strings ship in
 * BOOTSTRAP_EN (Wave 8 · `.632`). Hydrate still merges full locale packs.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BETA_EN, BETA_STEP_DEFS } from '@/i18n/betaLocales';
import { BOOTSTRAP_EN } from '@/i18n/bootstrapResources';

test('every beta step key is in BOOTSTRAP_EN', () => {
  for (const step of BETA_STEP_DEFS) {
    for (const key of [step.titleKey, step.bodyKey, step.ctaKey] as const) {
      assert.ok(
        key in BOOTSTRAP_EN && typeof BOOTSTRAP_EN[key] === 'string' && BOOTSTRAP_EN[key].length > 0,
        `BOOTSTRAP_EN missing beta key ${key}`
      );
      assert.equal(BOOTSTRAP_EN[key], BETA_EN[key], `bootstrap drift on ${key}`);
    }
  }
});

test('beta need + foot strings are bootstrapped', () => {
  for (const key of [
    'betaNeedLi1',
    'betaNeedLi2',
    'betaNeedLi3',
    'betaFootWedge',
    'betaFootWedgeNoSw',
  ] as const) {
    assert.ok(BOOTSTRAP_EN[key], `BOOTSTRAP_EN missing ${key}`);
  }
});
