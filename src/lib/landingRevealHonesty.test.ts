/**
 * `.reveal` must paint without waiting for IntersectionObserver. The cookie
 * homepage no longer uses Reveal or the marketing stills; it shows one real
 * shot of the logger.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

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

test('cookie homepage is one logger shot, not a reveal stack', () => {
  const landing = read('src/page-components/LandingPage.tsx');
  assert.match(landing, /\/brand\/log-a-set\.webp/);
  assert.ok(existsSync(path.join(root, 'public/brand/log-a-set.webp')));
  assert.doesNotMatch(landing, /<Reveal>|GrayscalePhoto|When you miss|Where you train|The free core/);
});
