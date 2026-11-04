/**
 * /beta leftovers: Alpha chip, code field open on arrival from /beta,
 * and the Personal trainer card saying "No set in front of you yet." once.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { BETA_STEP_DEFS } from '@/i18n/betaLocales';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

test('/beta shows the Alpha chip through the shared Badge, key and flag', () => {
  const src = read('src/page-components/BetaStartPage.tsx');
  assert.match(src, /from '@\/components\/ui\/badge'/);
  assert.match(src, /isFreeBeta\(\)/);
  assert.match(src, /t\('navOpenBeta'/);
});

test('/beta step 1 opens the gate with the code field expanded', () => {
  assert.equal(BETA_STEP_DEFS[0].href, '/private?from=beta');
  const page = read('app/private/page.tsx');
  assert.match(page, /codeOpen=\{fromBeta\}/);
  const client = read('app/private/PrivateTeaserClient.tsx');
  assert.match(client, /<details className="gate-details" open=\{codeOpen\}>/);
  // UI state only: the submit still posts the typed code and nothing else.
  assert.match(client, /body: JSON\.stringify\(\{ password: code \}\)/);
  assert.doesNotMatch(client, /useState\(initialInvite/, 'the invite id is not the access code');
});

test('Personal trainer card does not repeat the no-set line', () => {
  const src = read('src/components/coach/SessionTrainerCard.tsx');
  assert.equal(src.match(/t\('sessionTrainerNoSet'/g)?.length, 1, 'one source for the no-set line');
  assert.match(src, /shown === noSetLine\s*\?\s*null/);
  assert.match(src, /nextDetail === null \? null/);
});
