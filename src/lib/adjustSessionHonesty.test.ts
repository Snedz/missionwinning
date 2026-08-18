/**
 * Adjust session title matches the pack.
 *
 * Pack `coachAdjustTitle` is Adjust today’s session (curly apostrophe).
 * The sheet defaulted Adjust today's session (straight). First paint
 * listed it after Unlock waitlist.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { coachStringsFor } from '@/i18n/coachLocales';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const SHEET = 'src/components/coach/AdjustSessionSheet.tsx';

test('coachAdjustTitle pack is Adjust today’s session', () => {
  const en = coachStringsFor('en').coachAdjustTitle;
  assert.equal(en, 'Adjust today’s session');
  assert.match(en, /\u2019/, 'pack apostrophe is curly');
});

test('sheet title default matches the pack', () => {
  const src = read(SHEET);
  const en = coachStringsFor('en').coachAdjustTitle;
  const m = /t\('coachAdjustTitle',\s*\{\s*defaultValue:\s*(['"])(.*?)\1\s*\}\)/.exec(src);
  assert.ok(m, 'coachAdjustTitle must carry a literal defaultValue');
  assert.equal(m[2], en);
});
