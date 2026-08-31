import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('MindPage does not leftover session collections or depth merch', () => {
  const src = readFileSync(join(import.meta.dirname, '..', '..', 'page-components', 'MindPage.tsx'), 'utf8');
  assert.match(src, /<DailyCheckIn\b/);
  assert.doesNotMatch(src, /filterMindByCollection/);
  assert.doesNotMatch(src, /MIND_COLLECTIONS/);
  assert.doesNotMatch(src, /getContentInventory/);
});
