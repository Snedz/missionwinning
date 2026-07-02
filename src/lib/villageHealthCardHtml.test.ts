import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatVillageHealthCardHtml } from './villageHealthCardHtml';

describe('villageHealthCardHtml', () => {
  it('includes pathfinder badge and assessment summary', () => {
    const html = formatVillageHealthCardHtml({
      assessment: {
        risk: 'moderate',
        notes: 'Start gentle.',
        date: '2026-06-29',
        pathfinderTrack: true,
        programGate: 'standard',
        recommendations: ['Daily Mobility Circuit'],
      },
      workoutCount: 3,
      lastWorkoutName: 'Bodyweight Habit',
      streak: 2,
      trainLocation: 'village',
    });
    assert.match(html, /Village Health Card/);
    assert.match(html, /Pathfinder track/);
    assert.match(html, /MODERATE/);
    assert.match(html, /Bodyweight Habit/);
    assert.match(html, /Not medical advice/);
  });

  it('escapes html in workout name', () => {
    const html = formatVillageHealthCardHtml({
      assessment: { risk: 'low', notes: 'OK', date: '2026-01-01' },
      workoutCount: 1,
      lastWorkoutName: '<script>',
    });
    assert.match(html, /&lt;script&gt;/);
    assert.doesNotMatch(html, /<script>/);
  });
});
