import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('AdaptiveOverlay size=sm is not given button tap-target class', () => {
  for (const rel of [
    'src/components/coach/AdjustSessionSheet.tsx',
    'src/components/layout/MoreSheet.tsx',
  ]) {
    const src = readFileSync(join(root, rel), 'utf8');
    assert.doesNotMatch(
      src,
      /AdaptiveOverlay[\s\S]{0,120}size="sm"[\s\S]{0,40}className="min-h-\[44px\] tap-target"/,
      rel
    );
  }
});

test('FormGuideSheet footer is valid footer= prop', () => {
  const src = readFileSync(join(root, 'src/components/form/FormGuideSheet.tsx'), 'utf8');
  assert.match(src, /footer=\{/);
  assert.doesNotMatch(src, /<footer=\{/);
  assert.match(src, /primary-action w-full min-h-\[52px\]/);
});

test('Adjust session constraint chips are 44px tap targets', () => {
  const src = readFileSync(
    join(root, 'src/components/coach/AdjustSessionSheet.tsx'),
    'utf8'
  );
  assert.match(src, /min-h-\[44px\] border-2 tap-target/);
});
