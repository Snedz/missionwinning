/**
 * Press kit + Vision public pages must not pitch Super Bundle during free beta.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('PressPage has open-beta medium boilerplate without Super Bundle', () => {
  const src = readFileSync(join(root, 'src/page-components/PressPage.tsx'), 'utf8');
  assert.match(src, /MEDIUM_BOILERPLATE_OPEN_BETA/);
  assert.match(src, /isFreeBeta/);
  assert.match(src, /mediumBoilerplate/);
  const m = src.match(/MEDIUM_BOILERPLATE_OPEN_BETA\s*=\s*\n?\s*'([^']*)'/);
  assert.ok(m);
  assert.doesNotMatch(m[1]!, /Super Bundle/i);
});

test('VisionPage free-beta uses open-beta vision keys', () => {
  const src = readFileSync(join(root, 'src/page-components/VisionPage.tsx'), 'utf8');
  assert.match(src, /infoVisionP2OpenBeta/);
  assert.match(src, /infoVisionSuperAppP1OpenBeta/);
  assert.match(src, /isFreeBeta|freeBeta/);
});

test('infoLocales EN open-beta vision strings omit Super Bundle and premium depth pitch', () => {
  const src = readFileSync(join(root, 'src/i18n/infoLocales.ts'), 'utf8');
  for (const key of ['infoVisionP2OpenBeta', 'infoVisionSuperAppP1OpenBeta']) {
    const m = src.match(new RegExp(`${key}:\\s*\\n?\\s*'([^']*)'`));
    assert.ok(m, `missing ${key}`);
    assert.doesNotMatch(m[1]!, /Super Bundle/i);
  }
});
