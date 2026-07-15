import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  EXTENDED_NAV_SECTIONS,
  extendedNavSectionsForPhase,
  pageTitleForPath,
  STATIC_PAGE_TITLES,
} from '@/lib/navConfig';

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

  it('focuses Basic Training nav on train tools only', () => {
    const basic = extendedNavSectionsForPhase('basic');
    assert.equal(basic.length, 1);
    assert.equal(basic[0].id, 'train');
    const hrefs = basic[0].items.map((i) => i.href);
    assert.ok(hrefs.includes('/library'));
    assert.ok(hrefs.includes('/coach'));
    assert.ok(!hrefs.includes('/move'));
    assert.ok(!hrefs.includes('/bundle'));
  });

  it('shows full extended nav when commissioned', () => {
    const full = extendedNavSectionsForPhase('commissioned');
    assert.equal(full.length, EXTENDED_NAV_SECTIONS.length);
    assert.ok(full.some((s) => s.id === 'recover'));
    assert.ok(full.some((s) => s.id === 'premium'));
  });
});
