import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildVictorySecondaryLinks } from '@/lib/workout/victorySecondaryLinks';

const PULL_MUSCLES = [
  ['Back', 'Arms'],
  ['Back', 'Arms'],
  ['Back', 'Arms'],
];

describe('buildVictorySecondaryLinks', () => {
  it('offers fuel when protein not logged, primary is Coach, and no trained muscles', () => {
    const links = buildVictorySecondaryLinks({
      primaryHref: '/coach',
      proteinLoggedToday: false,
      strainDelta: 0,
    });
    assert.equal(links.length, 1);
    assert.equal(links[0]?.href, '/nutrition');
    assert.ok(links.every((l) => l.href !== '/bundle'));
  });

  it('offers mind downshift on high strain when protein is logged and no Move match', () => {
    const links = buildVictorySecondaryLinks({
      primaryHref: '/coach',
      proteinLoggedToday: true,
      strainDelta: 8,
    });
    assert.equal(links.length, 1);
    assert.equal(links[0]?.href, '/mind');
  });

  it('does not duplicate primary path', () => {
    const links = buildVictorySecondaryLinks({
      primaryHref: '/nutrition',
      proteinLoggedToday: false,
    });
    assert.ok(!links.some((l) => l.href === '/nutrition'));
  });

  it('caps at one seam line', () => {
    const links = buildVictorySecondaryLinks({
      primaryHref: '/coach',
      proteinLoggedToday: false,
      strainDelta: 9,
    });
    assert.ok(links.length <= 1);
  });

  it('sample pull: Move seam is T-Spine Opener and skips fuel', () => {
    const links = buildVictorySecondaryLinks({
      primaryHref: '/coach',
      proteinLoggedToday: false,
      strainDelta: 0,
      workingMuscleGroups: PULL_MUSCLES,
    });
    assert.equal(links.length, 1);
    assert.equal(links[0]?.href, '/move?flow=tspine-opener');
    assert.equal(links[0]?.kind, 'move');
    assert.equal(links[0]?.muscle, 'Back');
    assert.match(links[0]?.defaultLabel ?? '', /because you trained Back/);
    assert.ok(!links.some((l) => l.href === '/nutrition'));
  });

  it('skips Move when the surface is parked', () => {
    const links = buildVictorySecondaryLinks({
      primaryHref: '/coach',
      proteinLoggedToday: false,
      workingMuscleGroups: PULL_MUSCLES,
      moveSurfaceEnabled: false,
    });
    assert.equal(links[0]?.href, '/nutrition');
  });

  it('does not import the mobility catalog or a score', () => {
    const src = readFileSync(join(import.meta.dirname, 'victorySecondaryLinks.ts'), 'utf8');
    assert.doesNotMatch(src, /mobilityFlows/);
    assert.doesNotMatch(src, /mobilityScore|mobility score/i);
  });
});
