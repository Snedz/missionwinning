import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { pageTitleForPath, STATIC_PAGE_TITLES } from '@/lib/navConfig';

describe('navConfig', () => {
  it('resolves static page titles', () => {
    assert.equal(pageTitleForPath('/calculators'), 'Calculators');
    assert.equal(pageTitleForPath('/welcome'), 'Welcome');
    assert.equal(pageTitleForPath('/fitness-test'), 'Fitness test');
  });

  it('resolves guidebook chapter prefix', () => {
    assert.equal(pageTitleForPath('/learn/guide/human-performance'), 'Guidebook');
  });

  it('exposes labelKey for i18n header chrome', () => {
    assert.ok(STATIC_PAGE_TITLES['/vision']?.labelKey);
    assert.ok(STATIC_PAGE_TITLES['/assessments']?.labelKey);
  });
});
