/**
 * A feature nobody can find has not shipped.
 *
 * Workout CSV import is real and tested — [importCsv.ts](./importCsv.ts)
 * detects both common gym-logger layouts, rebuilds sessions, converts units
 * and de-duplicates on re-import. It was also, in practice, unreachable: the
 * only entry point was `/account` → expand a collapsed "More settings"
 * `<details>` → scroll past six cards. Nothing in the product mentioned it at
 * the moment it matters.
 *
 * Switchers arrive holding a CSV, so the file in hand is the whole
 * opportunity, and it was three taps and a scroll behind a summary element.
 *
 * These tests hold the path open. They assert reachability, not copy: a link
 * from the surfaces where a switcher actually is, and an `/account#import` deep
 * link that opens the section it points into.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

/** Where a switcher notices their history is missing. */
const ENTRY_SURFACES = {
  'src/page-components/WelcomePage.tsx':
    'I-Day, the sign-in step — the last screen before the first log, where "bring my data" is still a live question.',
  'src/components/workout/ActiveEmptyState.tsx':
    'An empty logger: the moment the absence of history is visible.',
} as const;

test('the CSV import path is offered where a switcher is, not only in settings', () => {
  for (const [file, why] of Object.entries(ENTRY_SURFACES)) {
    const src = read(file);
    assert.ok(
      src.includes('/account#import'),
      `${file} must link the importer (${why})`
    );
    assert.match(
      src,
      /csvImportCta/,
      `${file} must use the importer's own label, so the two cannot drift apart`
    );
  }
});

test('the deep link opens the section it points into', () => {
  const account = read('src/page-components/AccountPage.tsx');
  assert.match(account, /id="import"/, '#import needs a target element');
  assert.match(
    account,
    /open=\{importDeepLink\}/,
    'the CSV card lives inside <details>; a fragment into a closed one lands nowhere'
  );
  assert.match(account, /window\.location\.hash !== '#import'/, 'the hash must be read');
  assert.match(
    account,
    /scrollIntoView/,
    'opening the section without scrolling to it still leaves the card off screen'
  );
  // Read in an effect: the fragment never reaches the server, so deciding `open`
  // during render is a hydration mismatch.
  assert.doesNotMatch(
    account,
    /useState\(\s*(?:typeof window|window\.location)/,
    'reading the hash during render would mismatch hydration'
  );
});

test('the importer still exists and still detects both gym-logger layouts', () => {
  // Guarding a link to a feature that has been deleted is worse than no guard.
  const card = read('src/components/profile/ProfileImportCard.tsx');
  assert.match(card, /previewWorkoutCsvText/, 'file pick must dry-run before write');
  assert.match(card, /importWorkoutCsvText/, 'the card must still perform an import');
  assert.match(card, /csvImportConfirm/, 'confirm is required — drop must not write');
  assert.match(card, /csvImportCancel/, 'cancel must drop the preview');
  assert.doesNotMatch(card, /getUser/, 'F-017: import never asks for an account');
  assert.doesNotMatch(
    card,
    /importedOnce|oneImport|importCap|importLimit/,
    'a second file must still be allowed'
  );
  const strings = read('src/i18n/notificationLocales.ts');
  assert.match(strings, /Import workout CSV/, 'the CTA must stay a workout-CSV import');
  const parser = read('src/lib/workout/importCsv.ts');
  for (const fmt of ["'set-table-a'", "'set-table-b'"]) {
    assert.ok(parser.includes(fmt), `the parser must still detect ${fmt}`);
  }
});
