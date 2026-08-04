/**
 * Magazine/PDF figures must show full diagrams — never crop with object-fit:cover.
 *
 * Densified section art + form SVGs were sliced into short strips when
 * `.magazine-figure-img` used cover + max-height 220px, so the PDF looked
 * broken. Guard the print CSS so it cannot regress silently.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const css = readFileSync(path.join(root, 'src/index.css'), 'utf8');

test('magazine figure images use contain, not cover', () => {
  const start = css.indexOf('.magazine-figure-img');
  assert.ok(start >= 0, '.magazine-figure-img missing');
  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  // Strip comments — the defect class is documented in the rule body.
  const rule = css.slice(start, close + 1).replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(rule, /object-fit:\s*contain/, rule);
  assert.doesNotMatch(rule, /object-fit:\s*cover/, rule);
  assert.match(rule, /max-height:/, rule);
});

test('print path pins color adjust for magazine figures', () => {
  assert.match(css, /@media print[\s\S]*?\.magazine-figure-img[\s\S]*?print-color-adjust:\s*exact/);
});
