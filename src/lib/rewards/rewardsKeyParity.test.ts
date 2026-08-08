/**
 * Every key the rewards catalog *emits* is a key some catalog *defines*.
 *
 * `.606` found 26 that were not. `catalog.ts` has always emitted
 * `titleKey: 'rewardBadgeFirstBlood'` and `titleKey: 'rewardRank1'`; no i18n
 * module defined any of them. They looked fine because a **stale committed
 * export** still carried the English into `public/locales/en/today.json`, so the
 * pack had the string and nothing complained — while at runtime every badge and
 * every rank fell through to the call-site `defaultValue` and read English in
 * all fifteen languages.
 *
 * This is `.252`'s `coachWhySteadyWeek` exactly: *a key the app renders, present
 * in the shipped pack, defined in no source module.* That one was caught when
 * re-exporting became possible; this one was caught when re-exporting actually
 * happened. Both were invisible to `i18n:parity` (which compares packs to packs,
 * so a key missing from *all* of them is consistent) and to `i18n:coverage`
 * (which greps `.tsx` for literal `t('…')` calls, and these keys are emitted
 * from a data table, never written literally at a call site).
 *
 * So the axis here is the one neither of those can see: **a key that exists only
 * as data**. The required set is derived from `BADGE_DEFS` and `RANKS` rather
 * than listed, so a fourteenth badge cannot ship stringless — that is the whole
 * point, and an enumerated list here would have to be edited by the same commit
 * that forgets the strings.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BADGE_DEFS, RANKS } from './catalog';
import { rewardsStringsFor } from '@/i18n/rewardsLocales';

/** Every key the catalog can hand to `t()`. Derived, never listed. */
function emittedKeys(): string[] {
  const keys = new Set<string>();
  for (const b of BADGE_DEFS) {
    keys.add(b.titleKey);
    keys.add(b.descKey);
  }
  for (const r of RANKS) keys.add(r.titleKey);
  // The past-`RANKS` fallback title, which `rankForLevel` returns beyond level 10.
  keys.add('rewardRankMax');
  return [...keys].sort();
}

test('every key the rewards catalog emits is defined in the rewards pack', () => {
  const en = rewardsStringsFor('en') as Record<string, string>;
  const emitted = emittedKeys();

  // Anti-vacuity: a catalog that stopped exporting entries would make the loop
  // below iterate nothing and pass loudly-silently.
  assert.ok(BADGE_DEFS.length >= 13, `only ${BADGE_DEFS.length} badges — BADGE_DEFS is not being read`);
  assert.ok(RANKS.length >= 10, `only ${RANKS.length} ranks — RANKS is not being read`);
  assert.ok(emitted.length >= 37, `only ${emitted.length} emitted keys derived`);

  const missing = emitted.filter((k) => typeof en[k] !== 'string' || !en[k].length);
  assert.deepEqual(
    missing,
    [],
    'these keys are rendered by the app and defined in no catalog, so they read English in every ' +
      'language. Add them to src/i18n/rewardsLocales.ts with the value from catalog.ts.'
  );
});

test('the pack agrees with the catalog default, so the fallback is not a lie', () => {
  // `src/i18n/INDEX.md`: a call-site `defaultValue` must match the `en` pack
  // exactly. Here the "call site" is the data table, and a drift between the two
  // means the string an athlete sees depends on whether the pack loaded — which
  // is the least debuggable class of copy bug.
  const en = rewardsStringsFor('en') as Record<string, string>;
  const drift: string[] = [];

  for (const b of BADGE_DEFS) {
    if (en[b.titleKey] !== b.titleDefault) drift.push(`${b.titleKey}: pack≠catalog`);
    if (en[b.descKey] !== b.descDefault) drift.push(`${b.descKey}: pack≠catalog`);
  }
  for (const r of RANKS) {
    if (en[r.titleKey] !== r.titleDefault) drift.push(`${r.titleKey}: pack≠catalog`);
  }

  assert.deepEqual(drift, [], 'the English pack and the catalog default disagree');
});
