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
  // Free-beta Field manual: brief free-first subtitle (not depth/count cosplay).
  assert.match(src, /moveSubtitleBrief/);
  assert.doesNotMatch(src, /moveSubtitleDepth/);
  assert.match(src, /parseMoveFlowParam/);
});
