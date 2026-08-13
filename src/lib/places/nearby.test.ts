import { test } from 'node:test';
import assert from 'node:assert/strict';
import { haversineKm, sortByNearby } from './nearby';
import { plotLngLat } from './plot';
import { openStreetMapUrl } from './openInMaps';
import { EXAMPLE_PUBLIC_PLACES } from './examplePublicPlaces';
import type { PlacePin } from './types';

test('haversineKm: same point is ~0', () => {
  const p = { lat: 40.78, lng: -73.97 };
  assert.ok(haversineKm(p, p) < 0.01);
});

test('haversineKm: NYC–London is thousands of km', () => {
  const km = haversineKm({ lat: 40.78, lng: -73.97 }, { lat: 51.51, lng: -0.17 });
  assert.ok(km > 5000 && km < 6000, `got ${km}`);
});

test('sortByNearby without origin keeps catalog order', () => {
  const sorted = sortByNearby(EXAMPLE_PUBLIC_PLACES, null);
  assert.equal(sorted[0].id, EXAMPLE_PUBLIC_PLACES[0].id);
  assert.equal(sorted[0].distanceKm, null);
});

test('sortByNearby with origin puts nearest first and nameless-coords last', () => {
  const origin = { lat: 40.78, lng: -73.97 };
  const extra: PlacePin = { id: 'no-geo', name: 'Home gym (no pin)', kind: 'personal' };
  const sorted = sortByNearby([...EXAMPLE_PUBLIC_PLACES, extra], origin);
  assert.equal(sorted[0].id, 'example-central-park');
  assert.ok(sorted[0].distanceKm != null && sorted[0].distanceKm < 5);
  assert.equal(sorted[sorted.length - 1].id, 'no-geo');
  assert.equal(sorted[sorted.length - 1].distanceKm, null);
});

test('plotLngLat maps equator/prime-meridian near the board centre', () => {
  const p = plotLngLat(0, 0);
  assert.ok(Math.abs(p.xPct - 50) < 1);
  assert.ok(Math.abs(p.yPct - 50) < 1);
});

test('plotLngLat clamps poles and antimeridian inside the board', () => {
  const n = plotLngLat(89, 179);
  const s = plotLngLat(-89, -179);
  assert.ok(n.xPct >= 2 && n.xPct <= 98);
  assert.ok(n.yPct >= 2 && n.yPct <= 98);
  assert.ok(s.xPct >= 2 && s.xPct <= 98);
  assert.ok(s.yPct >= 2 && s.yPct <= 98);
});

test('openStreetMapUrl is OSM, not a social or Discord host', () => {
  const url = openStreetMapUrl(35.6717, 139.6949);
  assert.match(url, /^https:\/\/www\.openstreetmap\.org\//);
  assert.doesNotMatch(url, /discord/i);
});

test('example public pins are uncontested catalog (no owner/rank/likes)', () => {
  assert.equal(EXAMPLE_PUBLIC_PLACES.length, 4);
  for (const p of EXAMPLE_PUBLIC_PLACES) {
    assert.equal(p.kind, 'example-public');
    assert.ok(p.name.includes('(example)'));
    assert.equal('owner' in p, false);
    assert.equal('rank' in p, false);
    assert.equal('likes' in p, false);
  }
});
