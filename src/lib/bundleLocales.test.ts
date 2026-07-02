import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { bundleStringsFor } from '@/i18n/bundleLocales.ts';

describe('bundleLocales FAQ (Phase M1)', () => {
  it('includes FAQ and checkout strings in EN', () => {
    const en = bundleStringsFor('en');
    assert.ok(en.bundleFaqTitle.length > 0);
    assert.ok(en.bundleFaq1Q.length > 0);
    assert.ok(en.bundleFaq6A.length > 0);
    assert.ok(en.bundleCheckoutSuccess.length > 0);
    assert.ok(en.bundleStartFreeFirst.length > 0);
  });

  it('learn free tier reflects 8 paths', () => {
    assert.match(bundleStringsFor('en').bundlePillarLearnFree, /8/);
  });
});
