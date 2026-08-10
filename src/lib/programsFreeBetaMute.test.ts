/**
 * Programs free-beta mute — catalog foot was hard-coded Bundle merch,
 * and catalog intro used a freeBeta defaultValue that packs can override.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('ProgramsPage free-beta uses open-beta catalog + foot keys', () => {
  const src = readFileSync(join(root, 'src/page-components/ProgramsPage.tsx'), 'utf8');
  assert.match(src, /programsCatalogIntroOpenBeta/);
  assert.match(src, /programsFootOpenBeta/);
  assert.match(src, /programsFootBundle/);
  assert.match(src, /isFreeBeta|freeBeta/);
  // Paid Bundle foot must ride the i18n key — never bare JSX children.
  assert.doesNotMatch(
    src,
    />\s*Bundle all programs for significant discount/
  );
});

test('programsLocales open-beta strings omit Super Bundle and Bundle merch', () => {
  const src = readFileSync(join(root, 'src/i18n/programsLocales.ts'), 'utf8');
  assert.match(src, /programsCatalogIntroOpenBeta:/);
  assert.match(src, /programsFootOpenBeta:/);
  for (const key of ['programsCatalogIntroOpenBeta', 'programsFootOpenBeta']) {
    const re = new RegExp(`${key}:\\s*(?:\\n\\s*)?'((?:\\\\'|[^'])*)'`, 'm');
    const m = src.match(re);
    assert.ok(m, `missing EN ${key}`);
    assert.doesNotMatch(m[1]!, /Super Bundle/i, `${key} pitches Super Bundle`);
    assert.doesNotMatch(m[1]!, /\bBundle\b/, `${key} still says Bundle`);
  }
});
