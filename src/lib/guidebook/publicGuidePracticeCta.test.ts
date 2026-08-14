import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { publicGuidePracticeCta } from '@/lib/guidebook/publicGuidePracticeCta';

describe('publicGuidePracticeCta', () => {
  it('keeps already-public routes', () => {
    const cta = publicGuidePracticeCta('/welcome', 'Review Welcome');
    assert.equal(cta.href, '/welcome');
    assert.match(cta.label, /Start free|I-Day/i);
  });

  it('maps library to exercises hub', () => {
    const cta = publicGuidePracticeCta('/library', 'Browse squat variations');
    assert.equal(cta.href, '/exercises');
    assert.match(cta.label, /exercise/i);
  });

  it('maps pillar routes to welcome with honest labels', () => {
    const fuel = publicGuidePracticeCta('/nutrition', 'Open Fuel log');
    assert.equal(fuel.href, '/welcome');
    assert.match(fuel.label, /Fuel|Start free/i);
    assert.notEqual(fuel.label, 'Open Fuel log');
  });

  it('maps Coach to welcome with a Coach label', () => {
    const coach = publicGuidePracticeCta('/coach', 'Open Mission Coach');
    assert.equal(coach.href, '/welcome');
    assert.match(coach.label, /Mission Coach/i);
  });
});
