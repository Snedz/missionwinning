/**
 * Learn course empty + Builder pro load free-beta mute.
 * Depth unlocked in open beta still painted “premium courses/programs”.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('CourseReader free-beta uses open-beta empty course key', () => {
  const src = readFileSync(join(root, 'src/components/learn/CourseReader.tsx'), 'utf8');
  assert.match(src, /learnCourseEmptyOpenBeta/);
  assert.match(src, /isFreeBeta|freeBeta/);
});

test('ProgramTemplatesPanel free-beta uses open-beta pro load keys', () => {
  const src = readFileSync(
    join(root, 'src/components/builder/ProgramTemplatesPanel.tsx'),
    'utf8'
  );
  assert.match(src, /builderProLoadFailOpenBeta/);
  assert.match(src, /builderProOfflineOpenBeta/);
  assert.match(src, /isFreeBeta/);
});

test('learn + builder EN open-beta strings omit premium merch', () => {
  const learn = readFileSync(join(root, 'src/i18n/learnLocales.ts'), 'utf8');
  const builder = readFileSync(join(root, 'src/i18n/builderLocales.ts'), 'utf8');
  for (const [src, keys] of [
    [learn, ['learnCourseEmptyOpenBeta']],
    [builder, ['builderProLoadFailOpenBeta', 'builderProOfflineOpenBeta']],
  ] as const) {
    for (const key of keys) {
      const re = new RegExp(`${key}:\\s*(?:\\n\\s*)?'((?:\\\\'|[^'])*)'`, 'm');
      const m = src.match(re);
      assert.ok(m, `missing EN ${key}`);
      assert.doesNotMatch(m[1]!, /Super Bundle/i, `${key} pitches Super Bundle`);
      assert.doesNotMatch(m[1]!, /\b[Pp]remium\b/, `${key} still says premium`);
    }
  }
});
