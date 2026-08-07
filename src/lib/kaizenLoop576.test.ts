import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('Locked previews See Super Bundle is 44px', () => {
  for (const rel of [
    'src/components/nutrition/FuelLockedPreview.tsx',
    'src/components/move/MoveLockedPreview.tsx',
    'src/components/mind/MindLockedPreview.tsx',
  ]) {
    const src = readFileSync(join(root, rel), 'utf8');
    assert.match(src, /min-h-\[44px\] tap-target/, rel);
  }
});

test('Victory secondary Share is 44px tap target', () => {
  const src = readFileSync(
    join(root, 'src/components/workout/WorkoutVictorySheet.tsx'),
    'utf8'
  );
  assert.match(src, /handleShare[\s\S]{0,200}min-h-\[44px\]|min-h-\[44px\][\s\S]{0,80}handleShare/);
});
