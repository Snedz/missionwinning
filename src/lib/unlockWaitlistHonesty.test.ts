/**
 * Unlock waitlist is Get notified.
 *
 * UnlockButton nested `unlockJoinFounders` as the defaultValue of
 * `unlockGetNotified`, with default "Get notified". Packs say
 * unlockJoinFounders = Join founders list. First paint listed that
 * site first (168 > cap 167). Hydrate already showed Get notified.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { bundleStringsFor } from '@/i18n/bundleLocales';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const UNLOCK = 'src/components/UnlockButton.tsx';

test('unlockGetNotified pack is Get notified', () => {
  assert.equal(bundleStringsFor('en').unlockGetNotified, 'Get notified');
});

test('waitlist CTA default matches the pack — no nested Join founders list', () => {
  const src = read(UNLOCK);
  assert.match(
    src,
    /t\('unlockGetNotified',\s*\{\s*defaultValue:\s*'Get notified'\s*\}\)/,
    'Waitlist CTA must use unlockGetNotified with defaultValue Get notified'
  );
  assert.doesNotMatch(
    src,
    /unlockJoinFounders/,
    'Do not nest unlockJoinFounders (pack: Join founders list) under Get notified'
  );
});
