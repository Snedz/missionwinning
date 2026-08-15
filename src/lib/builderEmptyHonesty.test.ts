/**
 * K1 — Builder category empty is not a dead end.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const src = readFileSync(
  path.join(import.meta.dirname, '..', '..', 'src/components/builder/ProgramTemplatesPanel.tsx'),
  'utf8',
);

test('Builder empty category exits to /active', () => {
  assert.match(src, /programs\.length === 0/);
  assert.match(src, /EmptyState/);
  assert.match(src, /href="\/active"/);
  assert.match(src, /builderNoProgramsAction/);
});
