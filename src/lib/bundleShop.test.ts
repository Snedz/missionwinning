import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { CONTENT_FLOORS } from '@/lib/contentFloors';
import {
  BUNDLE_PAID_INVENTORY,
  BUNDLE_VS_STACK,
  bundleShopCta,
} from '@/lib/bundleShop';

const root = path.join(import.meta.dirname, '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

describe('bundleShop merchandising', () => {
  it('paid inventory counts are the CONTENT_FLOORS (no hand-typed drift)', () => {
    const byId = Object.fromEntries(BUNDLE_PAID_INVENTORY.map((l) => [l.id, l]));
    assert.equal(byId.recipes.count, CONTENT_FLOORS.recipesPremium);
    assert.equal(byId.move.count, CONTENT_FLOORS.movePremium);
    assert.equal(byId.mind.count, CONTENT_FLOORS.mindPremium);
    assert.equal(byId.learn.count, CONTENT_FLOORS.learnPremiumSections);
    assert.equal(byId.coach.count, undefined);
  });

  it('vs-stack is Strong + MFP + Pliability + Calm — four apps, one bundle', () => {
    assert.deepEqual([...BUNDLE_VS_STACK], ['Strong', 'MyFitnessPal', 'Pliability', 'Calm']);
  });

  it('CTA: free-beta always notifies, even if checkout looks configured', () => {
    assert.equal(
      bundleShopCta({ freeBeta: true, checkoutConfigured: true, purchased: true }),
      'notify'
    );
    assert.equal(
      bundleShopCta({ freeBeta: true, checkoutConfigured: false, purchased: false }),
      'notify'
    );
  });

  it('CTA: real purchase (not free-beta) is already included', () => {
    assert.equal(
      bundleShopCta({ freeBeta: false, checkoutConfigured: true, purchased: true }),
      'included'
    );
  });

  it('CTA: Subscribe only when checkout can run and they have not purchased', () => {
    assert.equal(
      bundleShopCta({ freeBeta: false, checkoutConfigured: true, purchased: false }),
      'subscribe'
    );
    assert.equal(
      bundleShopCta({ freeBeta: false, checkoutConfigured: false, purchased: false }),
      'notify'
    );
  });
});

describe('shop source guards', () => {
  it('route does not redirect /bundle to /log', () => {
    const src = read('app/bundle/page.tsx');
    assert.doesNotMatch(src, /redirect\s*\(\s*['"]\/log['"]\s*\)/);
  });

  it('shop UI has no trial SKU and names the vs-stack', () => {
    const stack = read('src/components/bundle/BundleShopStack.tsx');
    const page = read('src/page-components/BundlePage.tsx');
    const shop = read('src/lib/bundleShop.ts');
    const blob = `${stack}\n${page}\n${shop}`;
    assert.doesNotMatch(blob, /7-day|7 day|one week trial|trial SKU|credit card required/i);
    assert.match(stack, /BUNDLE_VS_STACK/);
    assert.match(stack, /BUNDLE_PAID_INVENTORY/);
    assert.match(stack, /bundle-card-free/);
    assert.match(stack, /bundle-card-paid/);
  });

  it('free Start training is outline so Get notified is the one poster red', () => {
    const stack = read('src/components/bundle/BundleShopStack.tsx');
    const freeCard = stack.slice(
      stack.indexOf('bundle-card-free'),
      stack.indexOf('bundle-card-paid')
    );
    assert.match(freeCard, /variant=["']outline["']/);
    assert.doesNotMatch(freeCard, /primary-action|bg-primary-fill|bg-accent-poster/);
    assert.match(stack, /bundleShopGetNotified/);
  });

  it('paid card interpolates floors — no hardcoded catalog digits', () => {
    const stack = read('src/components/bundle/BundleShopStack.tsx');
    // Strip interpolations / imports; leftover 110/48/60/16 would be the .606 defect.
    const stripped = stack.replace(/CONTENT_FLOORS\.\w+/g, '').replace(/line\.count/g, '');
    assert.doesNotMatch(stripped, /\b110\b/);
    assert.doesNotMatch(stripped, /\b60\b/);
    assert.match(stack, /BUNDLE_PAID_INVENTORY/);
  });
});
