#!/usr/bin/env node
/**
 * The guidebook chapter heroes must be in the palette the product uses.
 *
 * `.258` — `.131` re-inked the app to paper/ink/one-red and `.137` re-inked the
 * guidebook **cover**. The six chapter heroes were in neither pass, and nothing
 * could have said so: `check-design-system.mjs` reads source, and a palette
 * baked into a `.webp` is invisible to it. They sat at 84–97% near-black with
 * teal accents and ~0% brand red, on paper-ground pages, for eleven builds.
 *
 * ## Why this is scoped to six files rather than all of `public/`
 *
 * The first draft of this check measured every image in `public/` and it did
 * not survive its own numbers. `pwa-512x512.png` is 85% ink with no brand red;
 * `movement-mechanics-hero.webp` is 97% ink with no brand red. **No threshold
 * separates them**, because the icon is *supposed* to be a dark tile and the
 * hero is *supposed* to sit inside a paper page. The difference is where the
 * asset is used, which a pixel histogram cannot see.
 *
 * A repo-wide rule would therefore have been an exemption list doing all the
 * work — `.220`'s defect, a name claiming more than its enumeration, and the
 * exact thing this repo keeps paying for. So the rule is narrow and its
 * justification is concrete: these six render inside `/guide/<chapter>`, whose
 * ground is `--background` (#f3f2f2). Anything nearly black there is wrong, and
 * that *is* checkable.
 *
 * The set is discovered from `src/data/guidebook/chapters.ts`, not listed here,
 * so a seventh chapter is covered the day it is written.
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Thresholds, stated as a decision rather than smuggled in as constants.
 *
 * Unlike a contrast ratio these are not handed down by a standard — "off-brand"
 * has no external authority. They are set where the shipped-and-wrong assets
 * fail clearly (84–97% ink, 0–5% brand) and a paper-ground illustration passes
 * comfortably. Move them if the art direction changes; the point is that the
 * number lives in one place and a change to it shows up in a diff.
 */
const MAX_INK_PCT = 45; // near-black may accent, never dominate a paper page
const MIN_BRAND_PCT = 1; // the one red has to actually appear

/** Chapter hero paths, read from the guidebook data so new chapters are covered. */
export function heroPaths() {
  const src = readFileSync(path.join(root, 'src/data/guidebook/chapters.ts'), 'utf8');
  const found = [...src.matchAll(/src:\s*'(\/learn\/[^']+)'/g)].map((m) => m[1]);
  return [...new Set(found)];
}

/**
 * Pixel tally by role.
 *
 * Chroma, not HSL saturation. A pixel of (0,0,20) is "fully saturated blue" in
 * HSL at 4% lightness — which is how a first pass filed dark navy under "cool"
 * and disagreed with itself between runs. `(max-min)/255` asks the question
 * that actually matters: is there visible colour here at all.
 */
export async function measure(file) {
  const { data, info } = await sharp(file)
    .resize(72, 72, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const n = info.width * info.height;
  let ink = 0;
  let brand = 0;

  for (let i = 0; i < n; i += 1) {
    const o = i * info.channels;
    const [r, g, b, a] = [data[o], data[o + 1], data[o + 2], data[o + 3]];
    if (a < 128) continue;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const chroma = (max - min) / 255;
    const l = (max + min) / 2 / 255;

    if (chroma < 0.1) {
      if (l < 0.3) ink += 1;
      continue;
    }
    let h =
      max === r
        ? ((g - b) / (max - min)) % 6
        : max === g
          ? (b - r) / (max - min) + 2
          : (r - g) / (max - min) + 4;
    h = (h * 60 + 360) % 360;
    // The brand red sits at ~8° (#ec3013); allow the warm band around it.
    if (h < 30 || h >= 345) brand += 1;
  }

  return { ink: Math.round((ink / n) * 100), brand: Math.round((brand / n) * 100) };
}

/**
 * Heroes known to be off-palette today, and therefore allowed to fail — for now.
 *
 * A ratchet, in the shape `.202` used for the 709 untranslated strings: measure
 * the debt, refuse anything new, and let the number only go **down**. Shipping
 * this check red would have meant shipping a gate nobody can make green, which
 * is how a check gets switched off; shipping it green with the debt unlisted
 * would have meant `.200`'s check that cannot fail.
 *
 * These six are the `.131` rebrand's blind spot — re-inking them is a separate
 * act, and the entry has to be deleted when it happens because a stale entry
 * quietly re-permits the thing it documents.
 */
const KNOWN_OFF_PALETTE = [
  '/learn/human-performance-hero.webp',
  '/learn/movement-mechanics-hero.webp',
  '/learn/programming-tuning-hero.webp',
  '/learn/getting-started-mw-hero.webp',
  '/learn/nutrition-recovery-hero.webp',
  '/learn/assessments-progress-hero.webp',
];

export async function check() {
  const problems = [];
  const rows = [];

  for (const rel of heroPaths()) {
    const file = path.join(root, 'public', rel.replace(/^\//, ''));
    if (!existsSync(file)) {
      problems.push(`${rel} — referenced by a chapter but missing from public/`);
      continue;
    }
    const { ink, brand } = await measure(file);
    const offPalette = ink > MAX_INK_PCT || brand < MIN_BRAND_PCT;
    const known = KNOWN_OFF_PALETTE.includes(rel);
    rows.push({ rel, ink, brand, offPalette, known });

    if (offPalette && !known) {
      const why = [];
      if (ink > MAX_INK_PCT) {
        why.push(
          `${ink}% near-black (max ${MAX_INK_PCT}%) — this renders on a paper ground, and a ` +
            `nearly black illustration is the pre-\`.131\` palette`
        );
      }
      if (brand < MIN_BRAND_PCT) {
        why.push(
          `${brand}% brand red (min ${MIN_BRAND_PCT}%) — the one red is the only accent this ` +
            `design system has, so a hero without it is not in the system`
        );
      }
      problems.push(`${rel} — ${why.join('; ')}`);
    }

    // The ratchet only ratchets if it cannot be loosened by neglect.
    if (!offPalette && known) {
      problems.push(
        `${rel} is in KNOWN_OFF_PALETTE but now passes (${ink}% ink, ${brand}% brand). ` +
          `Delete the entry — a stale one quietly re-permits what it documents.`
      );
    }
  }

  return { problems, rows };
}

// Wrapped rather than top-level `await`: `guidebookHeroPalette.test.ts` imports
// `check()` from here, and tsx transforms an imported module to CJS, where a
// top-level await is a hard error. The CLI path and the test path have to be
// able to share one implementation — two copies of this rule would be `.178`.
async function main() {
  const { problems, rows } = await check();
  for (const r of rows) {
    console.log(`  ${r.rel.padEnd(44)} ink ${String(r.ink).padStart(3)}%   brand ${String(r.brand).padStart(3)}%`);
  }
  if (problems.length) {
    console.error(`\n✗ guidebook heroes off-palette:\n  - ${problems.join('\n  - ')}`);
    process.exit(1);
  }
  /*
   * Say what is actually true. "6 heroes in palette" would have been a lie —
   * six of them are off-palette and merely declared, which is `.208`'s defect:
   * a number the product states more confidently than it can support. The debt
   * is printed on every run so it stays visible rather than becoming furniture.
   */
  const debt = rows.filter((r) => r.known).length;
  const clean = rows.length - debt;
  console.log(
    `\n✓ no new off-palette heroes — ${clean} in palette, ${debt} declared debt awaiting re-ink`
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  // `.catch`, not `await` — see the note on `main()`. A top-level await here is
  // the same CJS-transform failure one line further down the file.
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
