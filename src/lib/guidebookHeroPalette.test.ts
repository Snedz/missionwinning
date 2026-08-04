/**
 * The guidebook chapter heroes, checked rather than described.
 *
 * `.258` — `.131` re-inked the app to paper/ink/one-red and `.137` re-inked the
 * guidebook **cover**. The six chapter heroes were in neither pass, and nothing
 * could have said so: `check-design-system.mjs` reads source, and a palette
 * baked into a `.webp` is invisible to it. They have sat at 84–97% near-black
 * with ~0% brand red, on paper-ground chapter pages, for eleven builds.
 *
 * It was found by eye during a `.234` baseline review and written into a LOG
 * entry, which is precisely the form this repo has learned not to trust — the
 * `opacity` rule in `WeekStrip.tsx` was also correct, also written down, and
 * also protected only the file it was in (`.236`).
 *
 * ## Why this is six files and not all of `public/`
 *
 * The first draft measured every image in `public/` and did not survive its own
 * numbers: `pwa-512x512.png` is 85% ink with no brand red, and
 * `movement-mechanics-hero.webp` is 97% ink with no brand red. **No threshold
 * separates them.** The icon is supposed to be a dark tile; the hero is supposed
 * to sit inside a paper page. The difference is where the asset is *used*,
 * which a pixel histogram cannot see, so a repo-wide rule would have been an
 * exemption list doing all the work — `.220`'s defect exactly.
 *
 * Narrow and concrete instead: these render inside `/guide/<chapter>`, whose
 * ground is `--background` (#f3f2f2). Nearly black there is wrong, and that is
 * checkable. The set is discovered from `chapters.ts`, so a seventh chapter is
 * covered the day it is written rather than the day someone remembers.
 *
 * ## And why it ships as a ratchet
 *
 * Green with the debt unlisted would be `.200`'s check that cannot fail. Red on
 * arrival would be a gate nobody can make green, which is how a gate gets
 * switched off. So: the six are declared, anything new fails, and an entry that
 * starts passing must be deleted.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { check, heroPaths } from '../../scripts/check-guidebook-heroes.mjs';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

test('the hero set is discovered from the guidebook data, not listed', async () => {
  /*
   * A discoverer that returns nothing makes every assertion below vacuous —
   * a poor thing to ship in a file about checks that cannot fail.
   */
  const paths = heroPaths();
  assert.ok(paths.length >= 6, `discovered only ${paths.length} chapter heroes — the parser broke`);
  for (const p of paths) assert.match(p, /^\/learn\/.+\.(webp|png|avif|jpe?g)$/, p);

  // Every chapter **heroImage** must be covered — not section `figure.src`
  // paths (also under `/learn/` after the densify pass).
  const declared = [
    ...read('src/data/guidebook/chapters.ts').matchAll(
      /heroImage:\s*\{[\s\S]*?src:\s*'(\/learn\/[^']+)'/g
    ),
  ];
  assert.equal(new Set(declared.map((m) => m[1])).size, paths.length);
});

test('no chapter hero is off-palette except the declared debt', async () => {
  const { problems } = await check();
  assert.deepEqual(
    problems,
    [],
    'guidebook heroes failed the palette rule:\n  - ' + problems.join('\n  - ')
  );
});

test('every chapter hero is in palette after the .268 re-ink', async () => {
  /*
   * `.258` declared six off-palette heroes as debt. `.268` re-inked them
   * (paper ground, ink linework, brand red accents). If measurement silently
   * returned zeros, or a hero regressed to near-black, this is the guard —
   * not a ratchet that can only loosen.
   */
  const { rows } = await check();
  assert.ok(rows.length >= 6, `expected ≥6 heroes, got ${rows.length}`);
  const debt = rows.filter((r) => r.known);
  assert.equal(debt.length, 0, `stale KNOWN_OFF_PALETTE entries: ${debt.map((r) => r.rel).join(', ')}`);

  for (const r of rows) {
    assert.equal(r.offPalette, false, `${r.rel} is off-palette (${r.ink}% ink, ${r.brand}% brand)`);
    // Paper-ground heroes must not be dominated by near-black (the pre-.131 defect).
    assert.ok(r.ink <= 45, `${r.rel} measured ${r.ink}% ink — near-black on paper again`);
    assert.ok(r.brand >= 1, `${r.rel} measured ${r.brand}% brand red — missing the one accent`);
  }
});

test('the check reports debt honestly when any remains', async () => {
  /*
   * `.208` — "6 guidebook heroes in palette" was the first thing this script
   * printed while six were only declared. The summary still names the debt
   * slot so a future off-palette arrival cannot quietly re-lie.
   */
  const src = read('scripts/check-guidebook-heroes.mjs');
  assert.match(src, /declared debt awaiting re-ink/, 'the summary no longer names the debt');
  assert.doesNotMatch(
    src,
    /✓ \$\{rows\.length\} guidebook heroes in palette/,
    'the summary claims every hero is in palette without measuring'
  );
});

test('the thresholds are stated once, as a decision', async () => {
  /*
   * Unlike a contrast ratio these have no external authority — "off-brand" is
   * a judgement. What keeps that honest is that the numbers live in one place
   * with the reasoning attached, so moving them shows up in a diff rather than
   * drifting through a dozen call sites.
   */
  const src = read('scripts/check-guidebook-heroes.mjs');
  assert.equal([...src.matchAll(/const MAX_INK_PCT =/g)].length, 1);
  assert.equal([...src.matchAll(/const MIN_BRAND_PCT =/g)].length, 1);
  assert.match(src, /Move them if the art direction changes/);
});
