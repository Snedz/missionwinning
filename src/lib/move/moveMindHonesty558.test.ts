import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', '..');

test('Move collection empty offers show-all; empty wins links to move-flows', () => {
  const src = readFileSync(join(root, 'src/page-components/MovePage.tsx'), 'utf8');
  assert.match(src, /move-flows/);
  assert.match(src, /moveCollectionShowAll|Show all flows/);
  assert.match(src, /href=.#move-flows/);
  assert.match(src, /min-h-\[44px\] tap-target/);
  assert.match(src, /free flows above still work/);
  assert.doesNotMatch(src, /free flows below still work/);
  assert.doesNotMatch(src, /Recent Move Wins/);
});

test('Mind collection empty offers show-all; empty links to mind-guided', () => {
  const src = readFileSync(join(root, 'src/page-components/MindPage.tsx'), 'utf8');
  assert.match(src, /mindCollectionShowAll|Show all sessions/);
  assert.match(src, /href=.#mind-guided/);
  assert.doesNotMatch(src, /Recent Mind Wins/);
  assert.match(src, /tap-target/);
});
