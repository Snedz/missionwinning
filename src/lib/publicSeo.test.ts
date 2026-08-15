import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  asJsonLdGraph,
  faqPageJsonLd,
  organizationJsonLd,
  productJsonLd,
  softwareApplicationJsonLd,
  webSiteJsonLd,
} from '@/lib/publicSeo';
import { BUNDLE_PLANS } from '@/lib/bundleConfig';
import { LANDING_FAQ_KEYS, landingFaqKeysForSurface } from '@/i18n/landingLocales';

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
    assert.ok(f.mainEntity.length >= 3);
    assert.ok(f.mainEntity[0].name.length > 5);
  });

  it('free-beta FAQ JSON-LD omits Super Bundle question', () => {
    // isFreeBeta() defaults ON unless NEXT_PUBLIC_FREE_BETA is false.
    const keys = landingFaqKeysForSurface();
    assert.ok(keys.every((f) => f.qKey !== 'landingFaqBundleQ'));
    assert.ok(keys.length < LANDING_FAQ_KEYS.length);
    const f = faqPageJsonLd();
    const blob = JSON.stringify(f);
    assert.doesNotMatch(blob, /Super Bundle/i);
  });

  it('asJsonLdGraph exposes @context so a parser can call toLowerCase', () => {
    const payload = asJsonLdGraph([
      organizationJsonLd('https://www.missionwinning.com'),
      webSiteJsonLd('https://www.missionwinning.com'),
    ]);
    const parsed = JSON.parse(JSON.stringify(payload)) as { '@context'?: string; '@graph': unknown[] };
    assert.equal(typeof parsed['@context'], 'string');
    assert.equal(parsed['@context']!.toLowerCase(), 'https://schema.org');
    assert.equal(Array.isArray(parsed['@graph']), true);
    assert.equal(parsed['@graph'].length, 2);
    assert.equal(Array.isArray(JSON.parse(JSON.stringify([organizationJsonLd()]))), true);
  });

  it('the homepage wraps JSON-LD in asJsonLdGraph, not a bare array', () => {
    const src = readFileSync(path.join(import.meta.dirname, '..', '..', 'app/page.tsx'), 'utf8');
    assert.match(src, /asJsonLdGraph\(/);
    assert.doesNotMatch(src, /JSON\.stringify\(graph\)/);
  });
});
