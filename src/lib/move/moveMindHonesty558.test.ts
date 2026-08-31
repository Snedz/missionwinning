import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', '..');

test('Move does not leftover flow-catalog empty or recent wins', () => {
  const src = readFileSync(join(root, 'src/page-components/MovePage.tsx'), 'utf8');
  assert.match(src, /<QuietMoveLogCard\b/);
  assert.doesNotMatch(src, /id="move-flows"/);
  assert.doesNotMatch(src, /moveCollectionShowAll|Show all flows/);
  assert.doesNotMatch(src, /href=.#move-flows/);
  assert.doesNotMatch(src, /Recent Move Wins/);
});

test('Mind collection empty offers show-all; empty links to mind-guided', () => {
  const src = readFileSync(join(root, 'src/page-components/MindPage.tsx'), 'utf8');
  assert.match(src, /mindCollectionShowAll|Show all sessions/);
  assert.match(src, /href=.#mind-guided/);
  assert.match(src, /Recent Mind Wins/);
  assert.match(src, /tap-target/);
});
