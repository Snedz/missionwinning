/**
 * R1 — Builder first paint matches the EN pack.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const page = readFileSync(path.join(root, 'src/page-components/BuilderPage.tsx'), 'utf8');

test('Builder program count first-paints the pack shape', () => {
  assert.match(page, /builderProgramCount/);
  assert.match(page, /count:\s*FREE_TEMPLATE_PROGRAM_COUNT/);
  assert.match(page, /defaultValue: '\{\{count\}\} programs'/);
  assert.doesNotMatch(page, /defaultValue: 'Free programs'/);
});

test('Builder empty saved first-paints the pack sentence', () => {
  assert.match(
    page,
    /builderNoSaved[\s\S]{0,80}defaultValue: 'No saved workouts yet\. Build one above or load a template\.'/,
  );
});
