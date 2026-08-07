/**
 * Every challenge the athlete can see has words to say it with.
 *
 * `challengeI18n` is a lookup table, and lookup tables rot in exactly one way:
 * a ninth challenge lands in `challenges.ts` and nobody adds its two keys, so
 * `TITLE_KEYS[id]` is `undefined`, `t(undefined, …)` is handed to i18next, and
 * the card renders a blank title instead of a raw key — quiet, not loud.
 *
 * `Record<ChallengeId, string>` catches that at `npm run typecheck` *today*.
 * It stops catching it the moment someone widens the annotation to
 * `Partial<Record<…>>` or `Record<string, string>` to unblock a merge, and a
 * type is not a runtime guarantee. So this suite proves the mapping at runtime.
 *
 * **Discovered, not enumerated** (`.220`): the ids come from the two places
 * that own them — the `ChallengeId` union, scraped out of `challenges.ts`
 * because a type leaves nothing behind at runtime, and the `CHALLENGES` array
 * the UI actually maps over. The suite asserts those two agree, then requires
 * keys for the union of both. No id list is hand-copied into this file, so a
 * challenge added tomorrow is covered without anyone remembering this test.
 *
 * The keys are asserted by *derivation* (`challenge` + PascalCase id +
 * `Title`/`Desc`) rather than against a copied list. A copied list only ever
 * tests the copy, and it cannot tell `challengeMind4Title` from
 * `challengeMind4Titel` — a typo that types cannot see and that degrades to a
 * silent English fallback in fifteen languages.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { CHALLENGES, type ChallengeId } from '@/lib/challenges';
import { localizedChallengeDesc, localizedChallengeTitle } from './challengeI18n.ts';

/** Sentinel a real `t` would return for a key the pack actually carries. */
const TRANSLATED = '<<from-pack>>';

type Call = { key: unknown; opts?: { defaultValue?: string } };

/** A `t` that records what it was asked for and always "finds" the key. */
function recorder(result: string = TRANSLATED) {
  const calls: Call[] = [];
  const t = (key: string, opts?: { defaultValue?: string }) => {
    calls.push({ key, opts });
    return result;
  };
  return { calls, t };
}

/**
 * The union is a type, so it is gone at runtime — source text is the only place
 * it exists. The parse is asserted, never skipped: if `challenges.ts` changes
 * shape this fails loudly instead of silently guarding nothing.
 */
function unionIdsFromSource(): string[] {
  const src = readFileSync(path.join(import.meta.dirname, 'challenges.ts'), 'utf8');
  const match = /export type ChallengeId\s*=([\s\S]*?);/.exec(src);
  assert.ok(
    match,
    'ChallengeId union not found in challenges.ts — fix this parser, do not delete the guard'
  );
  const ids = [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  assert.ok(ids.length >= 2, `expected a multi-member ChallengeId union, parsed ${ids.length}`);
  return ids;
}

const UNION_IDS = unionIdsFromSource();
const CATALOG_IDS = CHALLENGES.map((c) => c.id);
/** Superset: a divergence is its own failure below, and never a coverage hole here. */
const IDS = [...new Set<string>([...UNION_IDS, ...CATALOG_IDS])] as ChallengeId[];

/** The naming convention that lets a locale key be found from its challenge id. */
function expectedKey(id: string, suffix: 'Title' | 'Desc'): string {
  const pascal = id
    .split('-')
    .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1))
    .join('');
  return `challenge${pascal}${suffix}`;
}

describe('challenge id sources', () => {
  it('the ChallengeId union and the CHALLENGES catalog describe the same challenges', () => {
    assert.deepEqual(
      [...CATALOG_IDS].sort(),
      [...UNION_IDS].sort(),
      'a challenge exists in one source of truth and not the other'
    );
  });
});

describe('localizedChallengeTitle / localizedChallengeDesc', () => {
  it('resolves a real, distinct, conventional key for every challenge id', () => {
    assert.ok(IDS.length >= 2, 'no challenge ids discovered — the guard would be vacuous');
    const seen = new Set<string>();

    for (const id of IDS) {
      const title = recorder();
      const desc = recorder();
      localizedChallengeTitle(id, 'title-fallback', title.t);
      localizedChallengeDesc(id, 'desc-fallback', desc.t);

      assert.equal(title.calls.length, 1, `${id}: title must consult t exactly once`);
      assert.equal(desc.calls.length, 1, `${id}: desc must consult t exactly once`);

      const titleKey = title.calls[0].key;
      const descKey = desc.calls[0].key;
      // An unmapped id hands `undefined` to i18next and renders as nothing.
      assert.equal(typeof titleKey, 'string', `${id}: no title key`);
      assert.equal(typeof descKey, 'string', `${id}: no desc key`);
      assert.ok((titleKey as string).length > 0, `${id}: empty title key`);
      assert.ok((descKey as string).length > 0, `${id}: empty desc key`);

      assert.equal(titleKey, expectedKey(id, 'Title'), `${id}: title key off-convention`);
      assert.equal(descKey, expectedKey(id, 'Desc'), `${id}: desc key off-convention`);
      assert.notEqual(titleKey, descKey, `${id}: title and desc share one key`);

      seen.add(titleKey as string).add(descKey as string);
    }

    // Catches the copy-paste that gives two challenges the same string.
    assert.equal(seen.size, IDS.length * 2, 'a locale key is reused across challenges');
  });

  it('passes the caller fallback through as defaultValue and returns what t resolved', () => {
    // The real caller (TodayWeekSection) passes the catalog copy as fallback.
    for (const c of CHALLENGES) {
      const title = recorder();
      const desc = recorder();

      assert.equal(
        localizedChallengeTitle(c.id, c.title, title.t),
        TRANSLATED,
        `${c.id}: returned something other than the translation`
      );
      assert.equal(
        localizedChallengeDesc(c.id, c.description, desc.t),
        TRANSLATED,
        `${c.id}: returned something other than the translation`
      );

      assert.equal(title.calls[0].opts?.defaultValue, c.title, `${c.id}: title fallback dropped`);
      assert.equal(
        desc.calls[0].opts?.defaultValue,
        c.description,
        `${c.id}: desc fallback dropped`
      );
    }
  });

  it('surfaces the fallback copy for a key no pack carries', () => {
    // Five of the eight keys exist in no locale pack today, so this is the
    // live path, not a hypothetical: i18next returns `defaultValue` on a miss.
    const probe = recorder();
    localizedChallengeTitle(IDS[0], 'probe', probe.t);
    const packedKey = probe.calls[0].key as string;
    assert.equal(typeof packedKey, 'string');

    const pack: Record<string, string> = { [packedKey]: 'Racha de 7 días' };
    const t = (key: string, opts?: { defaultValue?: string }) =>
      pack[key] ?? opts?.defaultValue ?? key;

    assert.equal(
      localizedChallengeTitle(IDS[0], 'English title', t),
      'Racha de 7 días',
      'a translated key must beat the fallback'
    );
    assert.equal(
      localizedChallengeTitle(IDS[1], 'English title', t),
      'English title',
      'an untranslated key must fall back to the catalog copy, never to the raw key'
    );
    assert.equal(
      localizedChallengeDesc(IDS[0], 'English description', t),
      'English description',
      'the desc key is not the title key, so it must miss this pack'
    );
  });
});
