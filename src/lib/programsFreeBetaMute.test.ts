/**
 * Programs free-beta mute + catalog English floors.
 * Foot was hard-coded Bundle merch; catalog bullets painted raw keys before hydrate
 * and still pitched “Premium unlocks” under free beta.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  PROGRAMS_FREE_BETA_BULLET_KEYS,
  programsEnFloor,
} from '@/i18n/programsLocales';

const root = join(import.meta.dirname, '..', '..');

test('ProgramsPage free-beta uses open-beta catalog + foot keys', () => {
  const src = readFileSync(join(root, 'src/page-components/ProgramsPage.tsx'), 'utf8');
  assert.match(src, /programsCatalogIntroOpenBeta/);
  assert.match(src, /programsFootOpenBeta/);
  assert.match(src, /programsFootBundle/);
  assert.match(src, /programsEnFloor/);
  assert.match(src, /PROGRAMS_FREE_BETA_BULLET_KEYS/);
  assert.match(src, /isFreeBeta|freeBeta/);
  // Paid Bundle foot must ride the i18n key — never bare JSX children.
  assert.doesNotMatch(
    src,
    />\s*Bundle all programs for significant discount/
  );
  // Catalog bullets must not call t(key) bare (raw key on first paint).
  assert.doesNotMatch(src, /\{t\(key\)\}/);
});

test('programsLocales open-beta strings omit Super Bundle and Bundle merch', () => {
  const src = readFileSync(join(root, 'src/i18n/programsLocales.ts'), 'utf8');
  assert.match(src, /programsCatalogIntroOpenBeta:/);
  assert.match(src, /programsFootOpenBeta:/);
  for (const key of [
    'programsCatalogIntroOpenBeta',
    'programsFootOpenBeta',
    'progPtBullet5OpenBeta',
    'progBizBullet5OpenBeta',
  ]) {
    const re = new RegExp(`${key}:\\s*(?:\\n\\s*)?'((?:\\\\'|[^'])*)'`, 'm');
    const m = src.match(re);
    assert.ok(m, `missing EN ${key}`);
    assert.doesNotMatch(m[1]!, /Super Bundle/i, `${key} pitches Super Bundle`);
    assert.doesNotMatch(m[1]!, /\bBundle\b/, `${key} still says Bundle`);
    assert.doesNotMatch(m[1]!, /\b[Pp]remium\b/, `${key} still says premium`);
  }
});

test('programsEnFloor covers catalog bullet keys and free-beta rewrites exist', () => {
  assert.match(programsEnFloor('progPtTitle'), /Personal Training/i);
  assert.match(programsEnFloor('progPtBullet1'), /curriculum/i);
  assert.equal(programsEnFloor('progMissingKey'), 'progMissingKey');
  assert.ok(PROGRAMS_FREE_BETA_BULLET_KEYS.progPtBullet5);
  assert.ok(PROGRAMS_FREE_BETA_BULLET_KEYS.progBizBullet5);
});
