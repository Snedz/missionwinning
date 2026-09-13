/**
 * History day first paint is a house leftover — date + that day's rows.
 * Calendar / charts / posters stay parked.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

test('History day first paint is house objects, not field-manual cards', () => {
  const src = stripComments(read('src/page-components/HistoryDayPage.tsx'));
  assert.match(src, /className="house-history"/);
  assert.match(src, /className="house-kicker"/);
  assert.match(src, /className="house-title"/);
  assert.match(src, /house-list/);
  assert.match(src, /house-item/);
  assert.match(src, /historyRepeatSession/);
  assert.match(src, /house-btn house-btn-ghost/);
  assert.doesNotMatch(src, /house-btn-primary/);
  assert.doesNotMatch(src, /border-2/);
  assert.doesNotMatch(src, /from '@\/components\/ui\/button'/);
  assert.doesNotMatch(src, /HistoryCalendar|HistoryCharts|ProgramTemplatesPanel/);
});
