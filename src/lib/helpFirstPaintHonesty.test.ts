/**
 * Q2 — Help first paint matches the EN pack.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const page = readFileSync(path.join(root, 'src/page-components/HelpPage.tsx'), 'utf8');
const pack = readFileSync(path.join(root, 'src/i18n/infoLocales.ts'), 'utf8');

test('Help title first-paints Help, not Frequently asked', () => {
  assert.match(pack, /infoHelpTitle: 'Help'/);
  assert.match(page, /infoHelpTitle[\s\S]{0,40}defaultValue: 'Help'/);
  assert.doesNotMatch(page, /Frequently asked/);
});
