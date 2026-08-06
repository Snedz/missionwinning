import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildVictorySecondaryLinks } from '@/lib/workout/victorySecondaryLinks';

describe('buildVictorySecondaryLinks', () => {
  it('offers fuel when protein not logged and primary is Coach', () => {
    const links = buildVictorySecondaryLinks({
      primaryHref: '/coach',
      proteinLoggedToday: false,
      strainDelta: 0,
    });
    assert.ok(links.some((l) => l.href === '/nutrition'));
    assert.ok(links.every((l) => l.href !== '/bundle'));
  });

  it('offers mind downshift on high strain', () => {
    const links = buildVictorySecondaryLinks({
      primaryHref: '/coach',
      proteinLoggedToday: true,
      strainDelta: 8,
    });
    assert.ok(links.some((l) => l.href === '/mind'));
  });

  it('does not duplicate primary path', () => {
    const links = buildVictorySecondaryLinks({
      primaryHref: '/nutrition',
      proteinLoggedToday: false,
    });
    assert.ok(!links.some((l) => l.href === '/nutrition'));
  });

  it('caps at two links', () => {
    const links = buildVictorySecondaryLinks({
      primaryHref: '/coach',
      proteinLoggedToday: false,
      strainDelta: 9,
    });
    assert.ok(links.length <= 2);
  });
});
