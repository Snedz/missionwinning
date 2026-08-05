/**
 * Public exercise detail CTA must stay readable on desktop: copy + compact button.
 * `.primary-action` is `w-full` by default — the strip must force `sm:w-auto`.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const src = readFileSync(
  path.join(import.meta.dirname, '..', 'page-components', 'ExercisePublicPage.tsx'),
  'utf8'
);

test('SEO train strip uses row layout + non-full-width primary on sm+', () => {
  assert.match(src, /data-testid="seo-exercise-train"/);
  assert.match(src, /sm:flex-row/);
  assert.match(src, /sm:w-auto/);
  assert.match(src, /text-foreground/);
  // Mutant: bare primary-action without width override on the strip link
  const trainLink = src.slice(src.indexOf('seo-exercise-train') - 200, src.indexOf('seo-exercise-train') + 120);
  assert.match(trainLink, /sm:w-auto/);
});
