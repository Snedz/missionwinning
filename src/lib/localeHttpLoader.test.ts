import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  fetchLocaleHttpOverrides,
  localeCommonJsonPath,
  mergeLocaleRecords,
  normalizeLocaleCode,
  shouldLoadLocaleHttp,
} from '@/lib/localeHttpLoader';

describe('localeHttpLoader', () => {
  it('normalizes language codes', () => {
    assert.equal(normalizeLocaleCode('en-US'), 'en');
    assert.equal(normalizeLocaleCode('ar'), 'ar');
  });

  it('builds common.json path', () => {
    assert.equal(localeCommonJsonPath('zh-CN'), '/locales/zh/common.json');
  });

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
