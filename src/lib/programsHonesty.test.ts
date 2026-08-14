/** C5 — Programs is education, not a second store. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const page = readFileSync(path.join(root, 'src/page-components/ProgramsPage.tsx'), 'utf8');

test('free-beta Programs does not paint checkout merch', () => {
  assert.match(page, /!freeBeta && <> • \{catalogLine\(prog\.priceKey\)\}/);
  assert.match(page, /!freeBeta && \(/);
  assert.match(page, /UnlockButton/);
  assert.match(page, /href="\/coach"/);
  assert.match(page, /not a second store/);
});

test('coming soon stays on the paid foot only', () => {
  const paidFoot = page.slice(page.indexOf('programsFootBundle'));
  assert.match(paidFoot, /coming soon/);
  const open = page.slice(page.indexOf('programsFootOpenBeta'), page.indexOf('programsFootBundle'));
  assert.doesNotMatch(open, /coming soon/);
});
