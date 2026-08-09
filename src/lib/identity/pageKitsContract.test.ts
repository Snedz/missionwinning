/**
 * C6 — page kits are manifest entries, not stylesheets.
 *
 * IDENTITY_SOCIAL_PLAN: *"No user-authored CSS, HTML, colour or font, ever."*
 * The guard **discovers** the manifest from mw-core rather than enumerating kit
 * ids, so a new kit that ships with a hex or a style field fails the build
 * before it reaches a component.
 *
 * Fails closed with only the default kit: the contract still runs, still
 * asserts shape, and still refuses free-styling fields on every entry.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PAGE_KIT_ID,
  PAGE_KITS,
  PAGE_KIT_COMPOSITIONS,
  PAGE_KIT_TOKEN_IDS,
  pageKitById,
  pageKitProblems,
  resolvePageKitId,
  unlockedPageKits,
} from '../../../packages/mw-core/src/identity/pageKits';

describe('C6 page kit manifest', () => {
  it('ships at least the default kit so resolution never invents layout', () => {
    assert.ok(PAGE_KITS.length >= 1, 'manifest is empty — resolve has nothing to fall back to');
    assert.ok(pageKitById(DEFAULT_PAGE_KIT_ID), 'DEFAULT_PAGE_KIT_ID missing from PAGE_KITS');
  });

  it('every kit in the manifest is C6-clean (discover, do not enumerate)', () => {
    const allProblems: string[] = [];
    for (const kit of PAGE_KITS) {
      for (const p of pageKitProblems(kit)) {
        allProblems.push(`${kit.id}: ${p}`);
      }
    }
    assert.deepEqual(allProblems, [], allProblems.join('\n'));
  });

  it('kit ids are unique', () => {
    const ids = PAGE_KITS.map((k) => k.id);
    assert.equal(new Set(ids).size, ids.length, 'duplicate kit id in manifest');
  });

  it('token and composition allowlists are non-empty closed sets', () => {
    assert.ok(PAGE_KIT_TOKEN_IDS.length >= 4);
    assert.ok(PAGE_KIT_COMPOSITIONS.includes('stack'));
  });

  it('resolve falls back to default for unknown or locked kits', () => {
    assert.equal(resolvePageKitId('not-a-kit', 4), DEFAULT_PAGE_KIT_ID);
    assert.equal(resolvePageKitId(null, 1), DEFAULT_PAGE_KIT_ID);
    assert.equal(resolvePageKitId(DEFAULT_PAGE_KIT_ID, 1), DEFAULT_PAGE_KIT_ID);
  });

  it('unlocked kits never include a kit above the athlete tier', () => {
    for (const tier of [1, 2, 3, 4] as const) {
      for (const kit of unlockedPageKits(tier)) {
        assert.ok(kit.minTier <= tier, `${kit.id} unlocked at tier ${tier} but minTier ${kit.minTier}`);
      }
    }
  });

  it('a mutant free-style field is rejected by pageKitProblems', () => {
    const forged = {
      id: 'evil',
      composition: 'stack' as const,
      surface: 'paper' as const,
      accent: 'primary' as const,
      minTier: 1 as const,
      css: 'body { background: red }',
    };
    const problems = pageKitProblems(forged as never);
    assert.ok(
      problems.some((p) => /unknown field|stylesheet|CSS/i.test(p)),
      `forged stylesheet field was not caught: ${problems.join('; ')}`
    );
  });

  it('a mutant hex surface is rejected', () => {
    const forged = {
      id: 'hexed',
      composition: 'stack' as const,
      surface: '#ec3013' as never,
      accent: 'primary' as const,
      minTier: 1 as const,
    };
    const problems = pageKitProblems(forged as never);
    assert.ok(problems.length > 0, 'raw hex surface passed C6');
  });
});
