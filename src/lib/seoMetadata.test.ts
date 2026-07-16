import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { canonicalPath, publicPageMetadata, siteBaseUrl } from '@/lib/seoMetadata';

describe('seoMetadata', () => {
  it('normalizes canonical paths', () => {
    assert.equal(canonicalPath('/bundle/'), '/bundle');
    assert.equal(canonicalPath('guide/foo'), '/guide/foo');
    assert.equal(canonicalPath('/'), '/');
    assert.equal(canonicalPath('/x?q=1'), '/x');
  });

  it('emits og/twitter overrides and relative canonical', () => {
    const m = publicPageMetadata({
      title: 'Super Bundle',
      description: 'Six pillars',
      path: '/bundle',
    });
    assert.equal(m.title, 'Super Bundle');
    assert.equal(m.description, 'Six pillars');
    assert.equal(m.alternates?.canonical, '/bundle');
    assert.equal((m.openGraph as { title?: string })?.title, 'Super Bundle');
    assert.equal((m.twitter as { title?: string })?.title, 'Super Bundle');
    assert.ok(String((m.openGraph as { url?: string })?.url).includes('/bundle'));
  });

  it('siteBaseUrl has no trailing slash', () => {
    assert.ok(!siteBaseUrl().endsWith('/'));
  });
});
