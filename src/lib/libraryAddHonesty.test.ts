/**
 * Library add is Add to today's session.
 *
 * Pack `libraryAddToActive` is Add to today's session. The sheet
 * defaulted Add to session. First leftover after Journal empty.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { libraryStringsFor } from '@/i18n/libraryLocales';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const SHEET = 'src/components/library/LibraryDetailSheet.tsx';

test("libraryAddToActive pack is Add to today's session", () => {
  assert.equal(libraryStringsFor('en').libraryAddToActive, "Add to today's session");
});

test("sheet add default matches the pack", () => {
  const src = read(SHEET);
  const en = libraryStringsFor('en').libraryAddToActive;
  const m = /t\('libraryAddToActive',\s*\{\s*defaultValue:\s*(['"])(.*?)\1/.exec(src);
  assert.ok(m, 'libraryAddToActive must carry a literal defaultValue');
  assert.equal(m[2], en);
});
