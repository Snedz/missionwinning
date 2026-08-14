/**
 * G1 — after Done, `/` is the `.696` landing. Reveal must not leave blank
 * paper between "At a glance" and FAQ. Full-page capture and crawlers never
 * fire IntersectionObserver, so `.reveal { opacity: 0 }` is a blank band.
 *
 * Photo slots are real stills in `public/photo/`, wired through `base`.
 * A caption-only GrayscalePhoto is the empty-slot mutant.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const LANDING_SHOTS = ['phone-bench', 'home-rack', 'bare-wrist'] as const;

test('.reveal paints without waiting for IntersectionObserver', () => {
  const css = read('src/index.css');
  const utilities = css.slice(css.indexOf('@layer utilities'));
  assert.notEqual(utilities.indexOf('@layer utilities'), -1, 'utilities layer present');
  const firstReveal = utilities.match(/\.reveal\s*\{[^}]*\}/);
  assert.ok(firstReveal, 'utilities layer has a .reveal rule');
  assert.doesNotMatch(
    firstReveal[0],
    /opacity:\s*0/,
    'default .reveal must not start at opacity 0 — that is blank paper until IO fires'
  );
  assert.match(firstReveal[0], /opacity:\s*1/, 'default .reveal paints');
});

test('landing below-fold bands stay in the source and Reveal does not hide them', () => {
  const landing = read('src/page-components/LandingPage.tsx');
  assert.match(landing, /When you miss/);
  assert.match(landing, /Where you train/);
  assert.match(landing, /The free core/);
  assert.match(landing, /<Reveal>/);
  assert.match(landing, /from '@\/components\/marketing\/Reveal'/);
});

test('landing photo slots are real files wired through GrayscalePhoto base', () => {
  const landing = read('src/page-components/LandingPage.tsx');
  assert.match(
    landing,
    /<GrayscalePhoto[\s\S]{0,240}base=\{col\.photo\}/,
    'GrayscalePhoto must receive base — caption-only is the empty-slot mutant'
  );
  for (const name of LANDING_SHOTS) {
    assert.match(landing, new RegExp(`photo:\\s*'/photo/${name}'`));
    assert.ok(
      existsSync(path.join(root, `public/photo/${name}.avif`)),
      `public/photo/${name}.avif missing`
    );
    assert.ok(
      existsSync(path.join(root, `public/photo/${name}.webp`)),
      `public/photo/${name}.webp missing`
    );
  }
});
