/**
 * Session clock size is house leftover — 11px from house.css, not text-[11px].
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function sliceFromTestId(src: string, testId: string, chars = 360): string {
  const needle = `data-testid="${testId}"`;
  const start = src.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  return src.slice(start, start + chars);
}

test('session clock size is house leftover, not text-[11px]', () => {
  const chrome = read('src/components/workout/ActiveSessionChrome.tsx');
  const needle = 'data-testid="session-clock-toggle"';
  const start = chrome.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  const cell = chrome.slice(start - 280, start + 120);
  assert.match(cell, /house-session-clock/);
  assert.doesNotMatch(cell, /text-\[11px\]/);
  assert.doesNotMatch(cell, /house-btn-primary/);
});

test('house leftover rule paints session clock size at 11px', () => {
  const css = read('src/components/house/house.css');
  assert.match(
    css,
    /\.mw-house \.house-compose-live \.house-session-clock \{[^}]*font-size:\s*11px/
  );
});

test('DESIGN names Session clock size is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Session clock size is house leftover/);
});

test('Finish / Skip / Swap / Form guide / Repeat last never house-btn-primary', () => {
  const finish = sliceFromTestId(
    read('src/components/workout/ActiveSessionChrome.tsx'),
    'active-finish'
  );
  assert.doesNotMatch(finish, /house-btn-primary/);

  const header = read('src/components/workout/ActiveExerciseHeader.tsx');
  for (const id of [
    'active-skip-exercise',
    'active-swap-exercise',
    'active-form-guide',
    'active-repeat-last',
  ] as const) {
    const slice = sliceFromTestId(header, id);
    assert.doesNotMatch(slice, /house-btn-primary/, id);
  }
});
