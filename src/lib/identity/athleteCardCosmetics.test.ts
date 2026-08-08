/**
 * The Athlete Card may only show what the athlete earned (`.610`).
 *
 * `resolveCardCosmetics` is the entire security model of a local cosmetic system.
 * The config is athlete-editable — `localStorage` today, a `jsonb` column the day a
 * card syncs — so it can perfectly well name a tier-4 frame at tier 1. Nothing else
 * in the pipeline checks; the painter draws whatever it is handed.
 *
 * The interesting assertions are therefore the **negative** ones, and they are the
 * ones a happy-path test never makes: a locked pick must fall back to the earned
 * default rather than render, and a badge the athlete does not own must not appear
 * on a card they hand to their group chat. Claiming a medallion you did not earn is
 * the same defect class as `.602`'s invented body scores — a number nobody measured
 * looking measured — except this one goes out as a PNG with your name on it.
 *
 * Lives here rather than beside the source because `packages/mw-core` is excluded
 * from `tsconfig.json`, `npm run lint` and the `npm test` glob (see the note in
 * `coverageBudget.test.ts`) — a test written next to it would run nowhere.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_CARD_CONFIG,
  badgeSlots,
  resolveCardCosmetics,
  tierForLevel,
  unlockedBackdrops,
  unlockedFrames,
} from '../../../packages/mw-core/src/identity/athleteCard';

describe('tierForLevel', () => {
  it('maps the ten shipped ranks onto four tiers, and never off the ends', () => {
    assert.equal(tierForLevel(1), 1, 'Pathfinder');
    assert.equal(tierForLevel(2), 1, 'Regular');
    assert.equal(tierForLevel(3), 2, 'Operator');
    assert.equal(tierForLevel(5), 2, 'Path Keeper');
    assert.equal(tierForLevel(6), 3, 'Mission Ready');
    assert.equal(tierForLevel(8), 3, 'Iron Path');
    assert.equal(tierForLevel(9), 4, 'Long Haul');
    assert.equal(tierForLevel(10), 4, 'Lifelong');
    // Past 10 the catalog keeps issuing levels; the tier must not wrap or throw.
    assert.equal(tierForLevel(99), 4);
  });

  it('survives the values a fresh or broken reward state produces', () => {
    for (const bad of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      const tier = tierForLevel(bad);
      assert.ok([1, 2, 3, 4].includes(tier), `level ${bad} produced tier ${tier}`);
    }
    assert.equal(tierForLevel(Number.NaN), 1, 'an unreadable level earns nothing, not everything');
  });
});

describe('unlock sets grow with tier and never shrink', () => {
  it('each tier is a superset of the one below', () => {
    for (const tier of [2, 3, 4] as const) {
      const prevF = unlockedFrames((tier - 1) as 1 | 2 | 3);
      const prevB = unlockedBackdrops((tier - 1) as 1 | 2 | 3);
      for (const f of prevF) assert.ok(unlockedFrames(tier).includes(f), `tier ${tier} lost ${f}`);
      for (const b of prevB) assert.ok(unlockedBackdrops(tier).includes(b), `tier ${tier} lost ${b}`);
    }
  });

  it('tier 1 has exactly the defaults, so a first session is never an empty shelf', () => {
    assert.deepEqual(unlockedFrames(1), [DEFAULT_CARD_CONFIG.frame]);
    assert.deepEqual(unlockedBackdrops(1), [DEFAULT_CARD_CONFIG.backdrop]);
    assert.ok(badgeSlots(1) >= 1);
  });

  it('the top tier unlocks strictly more than the bottom — otherwise this is theatre', () => {
    assert.ok(unlockedFrames(4).length > unlockedFrames(1).length);
    assert.ok(unlockedBackdrops(4).length > unlockedBackdrops(1).length);
    assert.ok(badgeSlots(4) > badgeSlots(1));
  });

  it('a returned set cannot be mutated into an unlock', () => {
    const frames = unlockedFrames(1);
    frames.push('poster');
    assert.deepEqual(unlockedFrames(1), [DEFAULT_CARD_CONFIG.frame], 'unlocks leaked by reference');
  });
});

describe('resolveCardCosmetics — the clamp', () => {
  it('falls back to the earned default when the config names a locked pick', () => {
    const resolved = resolveCardCosmetics(
      { frame: 'poster', backdrop: 'poster-block', badges: [] },
      1
    );
    assert.equal(resolved.frame, 'hairline', 'a tier-1 athlete rendered a tier-4 frame');
    assert.equal(resolved.backdrop, 'paper', 'a tier-1 athlete rendered a tier-4 backdrop');
  });

  it('honours a pick the athlete has actually earned', () => {
    const resolved = resolveCardCosmetics({ frame: 'poster', backdrop: 'poster-block', badges: [] }, 10);
    assert.equal(resolved.frame, 'poster', 'the clamp must not be "always default"');
    assert.equal(resolved.backdrop, 'poster-block');
  });

  it('drops badges the athlete does not own', () => {
    const resolved = resolveCardCosmetics(
      { frame: 'hairline', backdrop: 'paper', badges: ['first-blood', 'iron-log-100'] },
      10,
      ['first-blood']
    );
    assert.deepEqual(
      resolved.badges,
      ['first-blood'],
      'an unowned medallion reached a card the athlete hands to other people'
    );
  });

  it('caps the shelf at the tier’s slots, and a repeated pick does not spend two', () => {
    const owned = ['a', 'b', 'c', 'd', 'e'];
    assert.equal(resolveCardCosmetics({ badges: owned }, 1, owned).badges.length, badgeSlots(1));
    assert.equal(resolveCardCosmetics({ badges: owned }, 10, owned).badges.length, badgeSlots(4));

    const dupes = resolveCardCosmetics({ badges: ['a', 'a', 'b'] }, 10, ['a', 'b']);
    assert.deepEqual(dupes.badges, ['a', 'b'], 'a duplicate pick consumed a second slot');
  });

  it('a missing, empty or malformed config resolves rather than throwing', () => {
    for (const input of [null, undefined, {}, { frame: 'nonsense' } as never]) {
      const resolved = resolveCardCosmetics(input, 5);
      assert.equal(resolved.frame, DEFAULT_CARD_CONFIG.frame);
      assert.equal(resolved.backdrop, DEFAULT_CARD_CONFIG.backdrop);
      assert.deepEqual(resolved.badges, []);
    }
  });
});
