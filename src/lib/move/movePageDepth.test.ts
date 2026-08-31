import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('MovePage does not leftover flow collections or depth merch', () => {
  const src = readFileSync(
    join(import.meta.dirname, '..', '..', 'page-components', 'MovePage.tsx'),
    'utf8'
  );
  assert.match(src, /<QuietMoveLogCard\b/);
  assert.doesNotMatch(src, /filterFlowsByCollection/);
  assert.doesNotMatch(src, /MOVE_COLLECTIONS/);
  assert.doesNotMatch(src, /getContentInventory/);
  assert.doesNotMatch(src, /moveSubtitleDepth/);
});
