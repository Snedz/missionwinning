import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  faqPageJsonLd,
  organizationJsonLd,
  productJsonLd,
  softwareApplicationJsonLd,
  webSiteJsonLd,
} from '@/lib/publicSeo';
import { BUNDLE_PLANS } from '@/lib/bundleConfig';

describe('publicSeo', () => {
  it('organization has name and url', () => {
    const o = organizationJsonLd('https://www.missionwinning.com');
    assert.equal(o['@type'], 'Organization');
    assert.equal(o.name, 'Mission Winning');
  });

  it('website has no SearchAction', () => {
    const w = webSiteJsonLd('https://www.missionwinning.com');
    assert.equal(w['@type'], 'WebSite');
    assert.equal((w as { potentialAction?: unknown }).potentialAction, undefined);
  });

  it('software application offers free tier', () => {
    const s = softwareApplicationJsonLd();
    assert.equal(s.applicationCategory, 'HealthApplication');
    assert.equal(s.offers.price, '0');
  });

  it('product offers match BUNDLE_PLANS prices', () => {
    const p = productJsonLd('https://www.missionwinning.com');
    assert.equal(p['@type'], 'Product');
    assert.equal(p.offers.length, 3);
    for (const offer of p.offers) {
      const plan = BUNDLE_PLANS[offer.name as keyof typeof BUNDLE_PLANS];
      assert.ok(plan, offer.name);
      assert.equal(offer.price, plan.price);
    }
  });

  it('faq page has questions from landing keys', () => {
    const f = faqPageJsonLd();
    assert.equal(f['@type'], 'FAQPage');
    assert.ok(f.mainEntity.length >= 4);
    assert.ok(f.mainEntity[0].name.length > 5);
  });
});
