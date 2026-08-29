/**
 * Swap garage lead cite is house leftover — house-lede, not text-muted.
 * Option rows stay. Confirm stays outline. Portals stay mw-house.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function sliceFromTestId(src: string, testId: string, chars = 360): string {
  const needle = `data-testid="${testId}"`;
  const start = src.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  return src.slice(start, start + chars);
}

test('Swap garage lead cite is house leftover, not text-muted', () => {
  const list = read('src/components/workout/GarageSwapList.tsx');
  const needle = 'activeSwapGarageLead';
  const start = list.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  const cite = list.slice(Math.max(0, start - 160), start + 80);
  assert.match(cite, /house-lede/);
  assert.doesNotMatch(cite, /text-muted-foreground/);
  assert.match(list, /data-testid="garage-swap-list"/);
  assert.match(list, /className="mw-house space-y-3"/);
});

test('garage option row cues stay text-muted (not this leftover)', () => {
  const list = read('src/components/workout/GarageSwapList.tsx');
  const cuesStart = list.indexOf('ex.cues');
  assert.ok(cuesStart >= 0, 'missing option-row cues');
  const cues = list.slice(cuesStart, cuesStart + 200);
  assert.match(cues, /text-xs text-muted-foreground/);
});

test('session-swap-confirm slice never house-btn-primary', () => {
  const confirm = sliceFromTestId(
    read('src/components/workout/SessionSwapSheet.tsx'),
    'session-swap-confirm'
  );
  assert.doesNotMatch(confirm, /house-btn-primary/);
});

test('house leftover rule paints swap garage lead cite with --house-muted', () => {
  const css = read('src/components/house/house.css');
  assert.match(css, /--house-muted/);
  assert.match(css, /\.house-lede \{[^}]*--house-muted/);
  assert.match(
    css,
    /\.mw-house\.house-swap-sheet \.house-lede \{[^}]*--house-muted/
  );
});

test('DESIGN names Swap garage lead cite is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Swap garage lead cite is house leftover/);
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
