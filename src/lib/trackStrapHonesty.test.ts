/**
 * C3 — Track must not imply a live strap when wearables are parked.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

test('Track first-paint does not sell a live wearable sync', () => {
  const page = read('src/page-components/TrackPage.tsx');
  const card = read('src/components/profile/ProfileWearablesCard.tsx');
  assert.match(page, /<BodyMetricsCard\b/);
  assert.doesNotMatch(page, /track-no-strap/);
  assert.doesNotMatch(page, /<ProfileWearablesCard\b/);
  assert.doesNotMatch(page, /Body, wearables & trends/);
  assert.match(card, /isWearablesPubliclyEnabled/);
  assert.match(card, /if \(!enabled\) return null/);
});

test('wearables stay parked by default', () => {
  const src = read('src/lib/surface.ts');
  assert.match(src, /'wearables'/);
  const parked = src.slice(src.indexOf('PARKED_BY_DEFAULT'), src.indexOf('SECONDARY_PILLARS'));
  assert.match(parked, /wearables/);
});
