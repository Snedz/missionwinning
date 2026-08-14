import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { visualViewportKeyboardOverlap } from './visualViewportKeyboard.ts';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

test('no keyboard: visual viewport fills the layout viewport', () => {
  assert.equal(
    visualViewportKeyboardOverlap({
      innerHeight: 844,
      visualHeight: 844,
      visualOffsetTop: 0,
    }),
    0
  );
});

test('keyboard covers the bottom of a phone layout viewport', () => {
  assert.equal(
    visualViewportKeyboardOverlap({
      innerHeight: 844,
      visualHeight: 508,
      visualOffsetTop: 0,
    }),
    336
  );
});

test('Safari offsetTop is part of the covered band, not ignored', () => {
  // Mutant: height-only (innerHeight - visualHeight) misses a scrolled vv.
  assert.equal(
    visualViewportKeyboardOverlap({
      innerHeight: 844,
      visualHeight: 500,
      visualOffsetTop: 47,
    }),
    297
  );
});

test('missing or junk metrics never invent a pad', () => {
  assert.equal(
    visualViewportKeyboardOverlap({
      innerHeight: 0,
      visualHeight: 500,
      visualOffsetTop: 0,
    }),
    0
  );
  assert.equal(
    visualViewportKeyboardOverlap({
      innerHeight: 844,
      visualHeight: 0,
      visualOffsetTop: 0,
    }),
    0
  );
  assert.equal(
    visualViewportKeyboardOverlap({
      innerHeight: 844,
      visualHeight: 500,
      visualOffsetTop: -12,
    }),
    0
  );
});

test('AppLayout lifts the logger dock by that overlap', () => {
  const layout = read('src/components/layout/AppLayout.tsx');
  const hook = read('src/hooks/useVisualViewportKeyboardOverlap.ts');
  assert.match(layout, /useVisualViewportKeyboardOverlap/);
  assert.match(layout, /paddingBottom:\s*keyboardOverlap/);
  assert.match(hook, /visualViewportKeyboardOverlap/);
  assert.match(hook, /addEventListener\('resize'/);
  assert.match(hook, /addEventListener\('scroll'/);
});

test('LogConsole still logs from the keyboard Go/Done key', () => {
  const src = read('src/components/workout/LogConsole.tsx');
  assert.match(src, /onSubmit=\{onLog\}/);
  assert.match(src, /enterKeyHint="done"/);
  assert.match(src, /log-console-log-set/);
});
