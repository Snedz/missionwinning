/**
 * Form guide + Swap portaled overlay root carries mw-house.
 * AdaptiveOverlay portals to document.body — house tokens drop unless
 * the overlay root (not only the inner panel) is `.mw-house`.
 * Confirm stays house-btn, never house-btn-primary.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function aroundTestId(src: string, testId: string): string {
  const needle = `data-testid="${testId}"`;
  const start = src.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  return src.slice(Math.max(0, start - 280), start + 280);
}

test('AdaptiveOverlay portaled root carries mw-house when the caller marked house', () => {
  const src = read('src/components/ui/AdaptiveOverlay.tsx');
  const root = src.slice(src.indexOf('const overlay ='), src.indexOf('role="presentation"'));
  assert.match(root, /isHouse && ['"]mw-house['"]/);
  assert.match(src, /createPortal\(overlay, document\.body\)/);
});

test('Form guide + Swap sheets mark the overlay mw-house', () => {
  const form = read('src/components/form/FormGuideSheet.tsx');
  assert.match(form, /mw-house house-form-guide/);
  const confirm = aroundTestId(form, 'form-guide-got-it');
  assert.match(confirm, /house-btn/);
  assert.doesNotMatch(confirm, /house-btn-primary/);

  const swap = read('src/components/workout/SessionSwapSheet.tsx');
  assert.match(swap, /mw-house house-swap-sheet/);
  const swapConfirm = aroundTestId(swap, 'session-swap-confirm');
  assert.match(swapConfirm, /house-btn/);
  assert.doesNotMatch(swapConfirm, /house-btn-primary/);
});

test('DESIGN names Form guide + Swap portal as house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Form guide \+ Swap portal is house leftover/);
});
