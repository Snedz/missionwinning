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

  it('focuses Basic Training nav on train tools only when free beta is off', () => {
    const prev = process.env.NEXT_PUBLIC_FREE_BETA;
    process.env.NEXT_PUBLIC_FREE_BETA = 'false';
    try {
      const basic = extendedNavSectionsForPhase('basic');
      assert.equal(basic.length, 1);
      assert.equal(basic[0].id, 'train');
      const hrefs = basic[0].items.map((i) => i.href);
      assert.ok(hrefs.includes('/library'));
      assert.ok(hrefs.includes('/builder'));
      assert.ok(hrefs.includes('/history'));
      assert.ok(!hrefs.includes('/move'));
      assert.ok(!hrefs.includes('/mind'));
      assert.ok(!hrefs.includes('/learn'));
      assert.ok(!hrefs.includes('/track'));
      assert.ok(!hrefs.includes('/bundle'));
    } finally {
      if (prev === undefined) delete process.env.NEXT_PUBLIC_FREE_BETA;
      else process.env.NEXT_PUBLIC_FREE_BETA = prev;
    }
  });

  it('opens full More nav for i-day and basic during free beta', () => {
    const prev = process.env.NEXT_PUBLIC_FREE_BETA;
    delete process.env.NEXT_PUBLIC_FREE_BETA; // default ON
    try {
      for (const phase of ['i-day', 'basic'] as const) {
        const sections = extendedNavSectionsForPhase(phase);
        assert.ok(sections.some((s) => s.id === 'recover'));
        assert.ok(sections.some((s) => s.id === 'train'));
        assert.ok(sections.some((s) => s.id === 'learn'));
        assert.ok(!sections.some((s) => s.id === 'premium'));
        const hrefs = sections.flatMap((s) => s.items.map((i) => i.href));
        assert.ok(hrefs.includes('/move'));
        assert.ok(hrefs.includes('/mind'));
        assert.ok(hrefs.includes('/learn'));
        assert.ok(hrefs.includes('/track'));
        assert.ok(!hrefs.includes('/bundle'));
      }
    } finally {
      if (prev === undefined) delete process.env.NEXT_PUBLIC_FREE_BETA;
      else process.env.NEXT_PUBLIC_FREE_BETA = prev;
    }
  });

  it('shows full extended nav when commissioned', () => {
    const prev = process.env.NEXT_PUBLIC_FREE_BETA;
    process.env.NEXT_PUBLIC_FREE_BETA = 'false';
    try {
      const full = extendedNavSectionsForPhase('commissioned');
      assert.equal(full.length, EXTENDED_NAV_SECTIONS.length);
      assert.ok(full.some((s) => s.id === 'recover'));
      assert.ok(full.some((s) => s.id === 'premium'));
    } finally {
      if (prev === undefined) delete process.env.NEXT_PUBLIC_FREE_BETA;
      else process.env.NEXT_PUBLIC_FREE_BETA = prev;
    }
  });

  it('hides premium nav during free beta', () => {
    const prev = process.env.NEXT_PUBLIC_FREE_BETA;
    delete process.env.NEXT_PUBLIC_FREE_BETA; // default ON
    try {
      const full = extendedNavSectionsForPhase('commissioned');
      assert.ok(!full.some((s) => s.id === 'premium'));
      assert.ok(!full.some((s) => s.items.some((i) => i.href === '/bundle')));
    } finally {
      if (prev === undefined) delete process.env.NEXT_PUBLIC_FREE_BETA;
      else process.env.NEXT_PUBLIC_FREE_BETA = prev;
    }
  });
});
