/**
 * /log is Summary after the first log — not a dashboard tour.
 *
 * Lean already is date + pins + highlights + docked Start.
 * HomePage still swapped readiness/commissioned onto HomeTodayDashboard,
 * so the first completed workout replaced Summary with the old house.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const home = () =>
  readFileSync(path.join(root, 'src/page-components/HomePage.tsx'), 'utf8');

test('/log is Lean Summary in every journey phase', () => {
  const src = home();
  assert.match(src, /<HomeTodayLean\s*\/>/);
  assert.doesNotMatch(
    src,
    /HomeTodayDashboard/,
    'first workout must not swap Today onto the dashboard tour'
  );
  assert.doesNotMatch(
    src,
    /needsFullDashboard/,
    'a phase branch that loads the house is the tour'
  );
  assert.doesNotMatch(
    src,
    /phase === 'readiness'|phase === 'commissioned'/,
    'phase may still be read; it must not pick a second Today'
  );
});
