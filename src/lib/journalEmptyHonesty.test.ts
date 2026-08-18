/**
 * Journal empty matches the pack.
 *
 * Pack `journalEmptyDesc` is the long debrief sentence. The timeline
 * defaulted a shorter line. First paint listed it after America.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { historyStringsFor } from '@/i18n/historyLocales';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const TIMELINE = 'src/components/history/JournalTimeline.tsx';

test('journalEmptyDesc pack is the debrief sentence', () => {
  assert.equal(
    historyStringsFor('en').journalEmptyDesc,
    'Finish a session and its debrief is kept here. Jot a field note mid-workout and it opens the entry in your own words.'
  );
});

test('journal empty default matches the pack', () => {
  const src = read(TIMELINE);
  const en = historyStringsFor('en').journalEmptyDesc;
  const m = /t\('journalEmptyDesc',\s*\{\s*defaultValue:\s*(['"])(.*?)\1/.exec(src);
  assert.ok(m, 'journalEmptyDesc must carry a literal defaultValue');
  assert.equal(m[2], en);
});
