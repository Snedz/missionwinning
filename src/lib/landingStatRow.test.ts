/**
 * Landing “At a glance” is a flush stat grid — zero padding, opaque cells.
 *
 * `.section-seam` draws the bottom rule as a *background image*. Opaque
 * `bg-background` children cover it, so the bottom line goes missing (.492).
 * This section must use a real border (or equivalent that is not under cells).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const landing = readFileSync(path.join(root, 'src/page-components/LandingPage.tsx'), 'utf8');

/** Slice the At a glance section only — other section-seams on the page are fine. */
function atAGlanceBlock(): string {
  const start = landing.indexOf('aria-label="At a glance"');
  assert.ok(start >= 0, 'At a glance section must exist');
  // Walk back to the opening <section
  const sectionOpen = landing.lastIndexOf('<section', start);
  assert.ok(sectionOpen >= 0);
  const end = landing.indexOf('</section>', start);
  assert.ok(end > start);
  return landing.slice(sectionOpen, end + '</section>'.length);
}

test('At a glance uses a real bottom border, not section-seam alone', () => {
  const block = atAGlanceBlock();
  assert.match(
    block,
    /border-b-2/,
    'flush grid must use border-b-2 so the rule is not covered by cells'
  );
  assert.match(block, /border-border/, 'bottom rule must use the design-system border token');
  assert.doesNotMatch(
    block,
    /className="[^"]*section-seam/,
    'section-seam background under opaque cells hides the bottom line'
  );
});

test('At a glance internal gutters are 2px rules, not 1px', () => {
  const block = atAGlanceBlock();
  assert.match(block, /gap-0\.5/, 'gap-0.5 is 2px — design system rule weight');
  assert.doesNotMatch(block, /gap-px/, 'gap-px is 1px and under-draws Modernist rules');
});
