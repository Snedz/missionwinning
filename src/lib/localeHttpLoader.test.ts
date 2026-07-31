import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  fetchLocaleHttpOverrides,
  mergeLocaleRecords,
  normalizeLocaleCode,
  shouldLoadLocaleHttp,
} from '@/lib/localeHttpLoader';

describe('localeHttpLoader', () => {
  it('normalizes language codes', () => {
    assert.equal(normalizeLocaleCode('en-US'), 'en');
    assert.equal(normalizeLocaleCode('ar'), 'ar');
  });

  /*
   * `.222` removed `localeCommonJsonPath` and its test. `common.json` was every
   * key again — the fourth copy of the catalogue — and once it was deleted the
   * helper had exactly one reference left: this assertion. A function kept alive
   * only by the test that checks it is a part, and the best part is no part.
   */

  it('mergeLocaleRecords combines objects', () => {
    const merged = mergeLocaleRecords([{ a: '1' }, { b: '2' }]);
    assert.deepEqual(merged, { a: '1', b: '2' });
  });

  it('shouldLoadLocaleHttp is false on server', () => {
    assert.equal(shouldLoadLocaleHttp(), false);
  });

  it('fetchLocaleHttpOverrides returns empty without fetch', async () => {
    const data = await fetchLocaleHttpOverrides('en');
    assert.ok(typeof data === 'object');
  });
});
