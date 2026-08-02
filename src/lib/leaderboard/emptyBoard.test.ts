/**
 * The board draws no furniture over an empty result set.
 *
 * `.225` — `LeaderboardTable` rendered unconditionally: a bordered box, a
 * four-column header strip (`# / Operator / Score / Δ`), then an empty `<ul>`.
 * On the class scope that is the *normal* state, not an edge case — `rank.ts`
 * builds class entries from `classRows` alone and pacers are deliberately
 * excluded, so a class with nothing synced yet got a heading and a column header
 * over a void, beneath a line reading **"0 operators"**.
 *
 * That is the reference screenshot this wave is named after (`ALL GROUPS (0)`
 * above a blank page), shipped, on a real route.
 *
 * **This is a source guard rather than a render test on purpose.**
 * `/leaderboard` is in `PARKED_BY_DEFAULT` (`src/lib/surface.ts`), so it 404s and
 * `tests/e2e/zero-state.spec.ts` — which would otherwise catch exactly this —
 * cannot reach it. A parked surface is still shipped code; `surfaceReality.test.ts`
 * exists because two things had already drifted out from under exactly that
 * assumption. When the surface unparks, the e2e sweep takes over and this can go.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const TABLE = 'src/components/leaderboard/LeaderboardTable.tsx';

test('an empty leaderboard renders nothing rather than a header over a void', () => {
  const src = readFileSync(path.join(root, TABLE), 'utf8');
  assert.match(
    src,
    /entries\.length === 0/,
    `${TABLE} must branch on an empty entry list before drawing its header strip — ` +
      `otherwise a class with nothing synced gets "# / Operator / Score / Δ" over an empty <ul>`
  );
  // The branch has to *return*, not merely style differently: the caller already
  // renders an EmptyState above, so anything drawn here reads as data still loading.
  assert.match(
    src,
    /if \(entries\.length === 0\) return null;/,
    `${TABLE}'s empty branch must return null — the caller supplies the empty state`
  );
});

/**
 * And the colour rule, which the same file broke in a way no scanner could see.
 *
 * `check-design-system` forbids raw hex but says nothing about Tailwind's stock
 * palette, so `text-red-400/90` on a downward rank delta survived a full rebrand
 * — the same blind spot `.221` found with `blue-500`/`green-500` on the 1RM
 * chart. Direction is carried by the ▲/▼ glyph, so colour is not load-bearing
 * here (WCAG 1.4.1) and red stays the one action colour.
 */
test('the leaderboard uses no off-palette Tailwind colours', () => {
  /*
   * Comments are blanked first — `check-design-system.mjs` learned this the hard
   * way and says so: *"a guard that punishes documented reasoning gets switched
   * off"*. The first version of this test failed on the word `text-red-400`
   * inside the comment explaining that `text-red-400` had been removed.
   *
   * `neutral` is deliberately absent from the list: `tailwind.config.js` remaps
   * it to the Modernist ramp, so `bg-neutral-900` can only mean the ink panel.
   */
  const src = readFileSync(path.join(root, TABLE), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  const offPalette = [
    ...src.matchAll(
      /\b(?:text|bg|border|ring)-(red|blue|green|amber|yellow|orange|purple|pink|indigo|teal|cyan|lime|emerald|sky|violet|fuchsia|rose|slate|gray|zinc|stone)-\d{2,3}\b/g
    ),
  ].map((m) => m[0]);
  assert.deepEqual(
    offPalette,
    [],
    `${TABLE} uses Tailwind's stock palette: ${offPalette.join(', ')}. ` +
      `The Modernist system is paper, ink and one red — map status through --status-* tokens.`
  );
});
