import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('MindPage wires collections + content inventory', () => {
  const src = readFileSync(join(import.meta.dirname, '..', '..', 'page-components', 'MindPage.tsx'), 'utf8');
  assert.match(src, /filterMindByCollection/);
  assert.match(src, /MIND_COLLECTIONS/);
  assert.match(src, /getContentInventory/);
});
