/**
 * The year grid sits on History above the session list.
 * Import stays the confirm dialog. The month calendar stays in Show all.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

test('History paints the year grid above the list, outside import', () => {
  const page = read('src/page-components/HistoryPage.tsx');
  const jsx = page.slice(page.indexOf('<PillarPageShell'));
  const open = jsx.split('<details')[0];
  assert.match(open, /<HistoryYearHeatmap\b/);
  assert.match(open, /history=\{workoutHistory\}/);
  const heat = open.indexOf('<HistoryYearHeatmap');
  const list = open.indexOf('session-history-list');
  const empty = open.indexOf('session-history-empty');
  assert.ok(heat >= 0 && list > heat, 'heatmap is above the session list');
  assert.ok(empty > heat, 'heatmap is above the empty invitation');
  assert.doesNotMatch(open, /<HistoryImport\b/);
  const dialog = page.slice(page.indexOf('session-history-import-dialog'));
  assert.doesNotMatch(dialog, /HistoryYearHeatmap/);
  assert.doesNotMatch(read('src/components/history/HistoryImport.tsx'), /HistoryYearHeatmap|yearHeatmap/);
});

test('the day page hosts the same year grid from workoutHistory', () => {
  const page = read('src/page-components/HistoryDayPage.tsx');
  assert.match(page, /<HistoryYearHeatmap\b/);
  assert.match(page, /history=\{workoutHistory\}/);
  const heat = page.indexOf('<HistoryYearHeatmap');
  const list = page.indexOf('history-day-list');
  assert.ok(heat >= 0 && list > heat, 'heatmap is above that day');
});

test('the grid component reads buildYearHeatmap and does not slice ISO dates', () => {
  const ui = read('src/components/history/HistoryYearHeatmap.tsx');
  assert.match(ui, /buildYearHeatmap/);
  assert.doesNotMatch(ui, /toISOString/);
  assert.match(ui, /data-testid="history-year-heatmap"/);
  assert.match(ui, /historyYearHeatEmpty/);
});
