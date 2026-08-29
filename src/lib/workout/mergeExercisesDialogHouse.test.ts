/**
 * Merge-exercises Radix DialogContent carries mw-house.
 * Confirm stays house-btn, never house-btn-primary.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

test('both merge DialogContent nodes carry mw-house', () => {
  const src = read('src/components/history/HistoryMergeExercises.tsx');
  const contents = [...src.matchAll(/<DialogContent className="([^"]+)"/g)];
  assert.equal(contents.length, 2, 'confirm + empty dialogs');
  for (const m of contents) {
    assert.match(m[1], /\bmw-house\b/, m[1]);
  }
});

test('merge confirm is house-btn, never house-btn-primary', () => {
  const src = read('src/components/history/HistoryMergeExercises.tsx');
  const needle = 'data-testid="session-history-merge-confirm"';
  const start = src.indexOf(needle);
  assert.ok(start >= 0);
  const slice = src.slice(Math.max(0, start - 280), start + 200);
  assert.match(slice, /house-btn/);
  assert.doesNotMatch(slice, /house-btn-primary/);
});

test('DESIGN names Merge-exercises dialog as house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Merge-exercises dialog is house leftover/);
});
