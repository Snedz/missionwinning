import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatGpsActivityNotes,
  formatPaceMinPerKm,
  isGpsActivity,
  livePaceFromPoints,
  paceMinPerKm,
  segmentPaceSeries,
  summarizeGpsWeek,
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

  it('builds segment pace series and filters outliers', () => {
    const points = [
      { lat: 40.7, lng: -74.0, at: 0 },
      { lat: 40.701, lng: -74.0, at: 60_000 },
      { lat: 40.702, lng: -74.0, at: 120_000 },
    ];
    const series = segmentPaceSeries(points);
    assert.equal(series.length, 2);
    assert.ok(series.every((p) => p.pace < 30));
  });

  it('detects GPS activities from notes prefix', () => {
    assert.equal(isGpsActivity('GPS · Walk · 12 pts · 5:30/km'), true);
    assert.equal(isGpsActivity('Morning loop'), false);
    assert.equal(isGpsActivity(undefined), false);
  });

  it('formats GPS activity notes', () => {
    const notes = formatGpsActivityNotes('Run', 42, 5.5);
    assert.match(notes, /^GPS · Run · 42 pts · 5:30\/km$/);
  });

  it('summarizes GPS week stats', () => {
    const summary = summarizeGpsWeek([
      { notes: 'GPS · Walk · 10 pts', distanceKm: 3, durationMin: 30 },
      { notes: 'park loop', distanceKm: 2, durationMin: 20 },
      { notes: 'gps · run · 8 pts', distanceKm: 5, durationMin: 25 },
    ]);
    assert.ok(summary);
    assert.equal(summary!.sessions, 2);
    assert.equal(summary!.totalKm, 8);
    assert.equal(summary!.avgPace, 6.875);
  });
});
