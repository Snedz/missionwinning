import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('MovePage wires collections + content inventory', () => {
  const src = readFileSync(
    join(import.meta.dirname, '..', '..', 'page-components', 'MovePage.tsx'),
    'utf8'
  );
  assert.match(src, /filterFlowsByCollection/);
  assert.match(src, /MOVE_COLLECTIONS/);
  assert.match(src, /getContentInventory/);
  assert.match(src, /moveSubtitleDepth/);
});
