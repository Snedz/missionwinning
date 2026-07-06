import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatPaceMinPerKm,
  livePaceFromPoints,
  paceMinPerKm,
  totalTrackDistanceKm,
} from '@/lib/trackGps';

describe('trackGps', () => {
  it('computes pace min per km', () => {
    assert.equal(paceMinPerKm(5, 25), 5);
    assert.equal(paceMinPerKm(0, 10), null);
  });

  it('formats pace as mm:ss/km', () => {
    assert.equal(formatPaceMinPerKm(5.5), '5:30/km');
  });

  it('sums track distance', () => {
    const points = [
      { lat: 0, lng: 0, at: 0 },
      { lat: 0, lng: 0.01, at: 60_000 },
    ];
    assert.ok(totalTrackDistanceKm(points) > 0);
  });

  it('live pace from recent points', () => {
    const points = [
      { lat: 40.7, lng: -74.0, at: 0 },
      { lat: 40.701, lng: -74.0, at: 60_000 },
      { lat: 40.702, lng: -74.0, at: 120_000 },
    ];
    const pace = livePaceFromPoints(points);
    assert.ok(pace != null && pace > 0);
  });
});
