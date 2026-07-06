import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { haversineKm, totalTrackDistanceKm } from './trackGps.ts';

describe('trackGps', () => {
  it('haversineKm is zero for identical points', () => {
    const p = { lat: 40.7, lng: -74.0, at: 0 };
    assert.equal(haversineKm(p, p), 0);
  });

  it('totalTrackDistanceKm sums segments', () => {
    const points = [
      { lat: 0, lng: 0, at: 0 },
      { lat: 0, lng: 0.01, at: 1000 },
      { lat: 0, lng: 0.02, at: 2000 },
    ];
    const d = totalTrackDistanceKm(points);
    assert.ok(d > 0);
    assert.ok(d < 5);
  });
});
