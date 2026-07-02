import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getMarketingSiteUrl,
  landingPageMetadata,
  bundlePageMetadata,
} from '@/lib/marketingMetadata';

describe('marketingMetadata (Phase M4)', () => {
  it('defaults site URL to production domain', () => {
    const url = getMarketingSiteUrl();
    assert.match(url, /^https:\/\//);
    assert.ok(!url.endsWith('/'));
  });

  it('landing metadata includes openGraph and twitter', () => {
    const meta = landingPageMetadata();
    assert.ok(meta.openGraph?.title);
    assert.ok((meta.twitter as { card?: string } | undefined)?.card === 'summary_large_image');
    assert.ok(meta.alternates?.languages?.en);
    assert.ok(meta.openGraph?.alternateLocale?.includes('es_ES'));
  });

  it('bundle metadata has distinct description', () => {
    const meta = bundlePageMetadata();
    assert.match(String(meta.description), /subscription/i);
  });
});
