/**
 * `/` after Done is the .696 marketing homepage (stat row + LogToPlanHero).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', '..');
const landing = readFileSync(path.join(root, 'src/page-components/LandingPage.tsx'), 'utf8');

test('LandingPage is the .696 marketing homepage, not cinematic www', () => {
  assert.match(landing, /LogToPlanHero/);
  assert.match(landing, /MarketingNav/);
  assert.match(landing, /At a glance/);
  assert.doesNotMatch(landing, /CinematicWww/);
});
