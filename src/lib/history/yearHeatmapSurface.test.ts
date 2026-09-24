/**
 * The year grid sits on History above the session list.
 * Import stays the confirm dialog. The month calendar stays in Show all.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import i18n from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { HistoryYearHeatmap } from '@/components/history/HistoryYearHeatmap';

void i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: { en: { translation: {} } },
  interpolation: { escapeValue: false },
});

function paint(history: { completedAt: string; deletedAt?: string | null }[]) {
  return renderToStaticMarkup(
    createElement(I18nextProvider, { i18n }, createElement(HistoryYearHeatmap, { history }))
  );
}

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

test('the grid component paints an empty year and a live day', () => {
  const empty = paint([]);
  assert.match(empty, /data-testid="history-year-heatmap"/);
  assert.match(empty, /data-empty="true"/);
  assert.match(empty, /No sessions in this year/);
  assert.doesNotMatch(empty, /href="\/history\//);

  const filled = paint([
    { completedAt: new Date().toISOString() },
    { completedAt: new Date().toISOString(), deletedAt: new Date().toISOString() },
  ]);
  assert.match(filled, /data-empty="false"/);
  assert.match(filled, /data-sessions="1"/);
  assert.match(filled, /data-days="1"/);
  assert.match(filled, /1 day/);
  assert.match(filled, /data-sessions="1" data-level="1"/);
  assert.match(filled, /href="\/history\/\d{4}-\d{2}-\d{2}"/);
});

test('the grid component reads buildYearHeatmap and does not slice ISO dates', () => {
  const ui = read('src/components/history/HistoryYearHeatmap.tsx');
  assert.match(ui, /buildYearHeatmap/);
  assert.doesNotMatch(ui, /toISOString/);
  assert.match(ui, /data-testid="history-year-heatmap"/);
  assert.match(ui, /historyYearHeatEmpty/);
});
