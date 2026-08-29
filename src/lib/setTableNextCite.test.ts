/**
 * Set-table next-cite line is house leftover — house-lede, not text-muted.
 * Skip stays outline. vs-last leftover stays. load-% stays parked.
 * Log set stays filled. Finish / Skip / Swap / Form guide stay outline.
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

test('Set-table next-cite line is house leftover, not text-muted', () => {
  const next = read('src/components/workout/SetLogNextCite.tsx');
  const needle = 'data-testid="set-table-next-cite-line"';
  const start = next.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  const cite = next.slice(Math.max(0, start - 180), start + 40);
  assert.match(cite, /house-lede/);
  assert.doesNotMatch(cite, /text-muted-foreground/);
});

test('next-cite Skip stays outline, never house-btn-primary', () => {
  const skip = sliceFromTestId(
    read('src/components/workout/SetLogNextCite.tsx'),
    'set-table-next-cite-skip'
  );
  assert.doesNotMatch(skip, /house-btn-primary/);
  assert.match(skip, /house-btn/);
});

test('load-% stays parked (not this leftover)', () => {
  const table = read('src/components/workout/SetLogTable.tsx');
  const pctNeedle = 'data-testid="set-table-load-pct-cite"';
  const pctStart = table.indexOf(pctNeedle);
  assert.ok(pctStart >= 0, `missing ${pctNeedle}`);
  const loadPct = table.slice(Math.max(0, pctStart - 180), pctStart + 40);
  assert.match(loadPct, /text-muted-foreground/);
});

test('Log set stays the sole filled press', () => {
  const table = read('src/components/workout/SetLogTable.tsx');
  const logSet = sliceFromTestId(table, 'set-table-log-set');
  assert.match(logSet, /house-btn house-btn-primary house-set-log/);
});

test('house leftover rule paints set-table next-cite with --house-muted', () => {
  const css = read('src/components/house/house.css');
  assert.match(css, /--house-muted/);
  assert.match(css, /\.house-lede \{[^}]*--house-muted/);
  assert.match(
    css,
    /\.mw-house \.house-compose-live \.house-next-cite\.house-lede \{[^}]*--house-muted/
  );
});

test('DESIGN names Set-table next-cite is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Set-table next-cite is house leftover/);
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
