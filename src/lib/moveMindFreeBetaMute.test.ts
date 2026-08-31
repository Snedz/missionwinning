/**
 * Move + Mind free-beta mute — same class as Fuel .660: depth unlocked, but
 * fetch/offline chrome and Mind section headings still said “premium”.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('MovePage does not leftover premium flow fetch chrome', () => {
  const src = readFileSync(join(root, 'src/page-components/MovePage.tsx'), 'utf8');
  assert.doesNotMatch(src, /movePremiumFetchFailedOpenBeta/);
  assert.doesNotMatch(src, /movePremiumOfflineOpenBeta/);
  assert.doesNotMatch(src, /isFreeBeta|freeBeta/);
  assert.match(src, /<QuietMoveLogCard\b/);
});

test('MindPage free-beta uses open-beta fetch/offline + section keys', () => {
  const src = readFileSync(join(root, 'src/page-components/MindPage.tsx'), 'utf8');
  assert.match(src, /mindPremiumFetchFailedOpenBeta/);
  assert.match(src, /mindPremiumOfflineOpenBeta/);
  assert.match(src, /mindPremiumSessionsCountOpenBeta/);
  assert.match(src, /isFreeBeta|freeBeta/);
});

test('move + mind EN open-beta strings omit premium merch', () => {
  const move = readFileSync(join(root, 'src/i18n/moveLocales.ts'), 'utf8');
  const mind = readFileSync(join(root, 'src/i18n/mindLocales.ts'), 'utf8');
  for (const [src, keys] of [
    [
      move,
      ['movePremiumFetchFailedOpenBeta', 'movePremiumOfflineOpenBeta', 'moveSubtitleBriefOpenBeta'],
    ],
    [
      mind,
      [
        'mindPremiumFetchFailedOpenBeta',
        'mindPremiumOfflineOpenBeta',
        'mindPremiumSessionsCountOpenBeta',
      ],
    ],
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
