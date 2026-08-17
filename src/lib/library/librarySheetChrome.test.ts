/**
 * Library first paint is a pick list. Posters, blurbs, and extra doors live in Show all.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const page = () =>
  readFileSync(
    path.join(import.meta.dirname, '..', '..', 'page-components', 'LibraryPage.tsx'),
    'utf8'
  );

test('the library house is behind Show all, not on first paint', () => {
  const src = page();
  const jsx = src.slice(src.indexOf('<PillarPageShell'));
  const open = jsx.split('<details')[0];
  assert.doesNotMatch(open, /formPackLibraryPosterUrl/, 'posters are on first paint');
  assert.doesNotMatch(open, /exerciseCraftBlurb/, 'craft blurbs are on first paint');
  assert.doesNotMatch(open, /libraryTodayHub/, 'Today link is on first paint');
  assert.doesNotMatch(open, /libraryProgramTemplates/, 'templates door is on first paint');
  assert.doesNotMatch(open, /libraryPickHint/, 'pick hint is on first paint');
  assert.match(jsx, /<details/);
  assert.match(jsx, /data-testid="library-show-all"/);
  assert.match(jsx, /libraryProgramTemplates/);
  assert.match(jsx, /formPackLibraryPosterUrl/);
});

test('first paint is search, filters, and a pick row', () => {
  const src = page();
  const jsx = src.slice(src.indexOf('<PillarPageShell'));
  const open = jsx.split('<details')[0];
  assert.match(open, /librarySearchPlaceholder/);
  assert.match(open, /libraryFilters/);
  assert.match(open, /data-testid="library-exercise-row"/);
  assert.match(open, /libraryViewDetails/);
});
