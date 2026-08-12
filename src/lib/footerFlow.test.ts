/**
 * Marketing Product footer must put ingress first and never short Mission Coach
 * with human Coaching or a bare “Coach” label on `/#coach`.
 *
 * docs/FLOW_ARCHITECTURE.md Flow-1.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { footerGroups } from '@/components/marketing/footerLinks';

test('Product footer is Start free → How Coach adapts (Bundle optional; no competitor compare)', () => {
  const product = footerGroups().find((g) => g.titleKey === 'footerGroupProduct');
  assert.ok(product);
  const hrefs = product!.links.map((l) => l.href);
  assert.equal(hrefs[0], '/welcome', 'ingress first');
  assert.equal(hrefs[1], '/#coach');
  // Bundle may be filtered under free-beta
  assert.ok(!hrefs.includes('/compare'), 'competitor compare hub removed');
  assert.ok(!hrefs.includes('/coaching'), 'never human coaching in Product');
  assert.ok(!hrefs.includes('/coach'), 'app Mission Coach is not the marketing adapt anchor');
});

test('Product Coach pad is labeled as adapt story, not bare Coach', () => {
  const product = footerGroups().find((g) => g.titleKey === 'footerGroupProduct');
  const coach = product!.links.find((l) => l.href === '/#coach');
  assert.ok(coach);
  assert.equal(coach!.defaultValue, 'How Coach adapts');
  assert.equal(coach!.labelKey, 'footerProductCoach');
});

test('Start free pad exists with stable key', () => {
  const product = footerGroups().find((g) => g.titleKey === 'footerGroupProduct');
  const start = product!.links.find((l) => l.href === '/welcome');
  assert.ok(start);
  assert.equal(start!.defaultValue, 'Begin I-Day');
  assert.equal(start!.labelKey, 'footerProductStart');
});
