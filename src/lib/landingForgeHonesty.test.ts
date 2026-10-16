/**
 * Forge landing keeps the product's facts. The Z.ai sheet had a studio,
 * named coaches, and member counts. None of that is on this page.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const landing = readFileSync(path.join(root, 'src/page-components/LandingPage.tsx'), 'utf8');

test('forge CTAs are the free logger and the yearly checkout', () => {
  assert.match(landing, /href="\/log"/);
  assert.match(landing, /Start logging free/);
  assert.match(landing, /Join \$99\/yr/);
  assert.match(landing, /https:\/\/buy\.stripe\.com\/aFabJ00AC0Rj6fh2eW9k400/);
  assert.match(landing, /href="\/refunds"/);
  assert.match(landing, /\$50/);
  assert.match(landing, /\$40/);
  assert.match(landing, /\$90/);
  assert.match(landing, /24/);
  assert.match(landing, /96/);
});

test('forge landing does not invent a gym, a coach roster, or a competitor', () => {
  assert.doesNotMatch(landing, /IRONFORGE|Marcus Reid|Elena Voss|Tank|Alex Mercer|Eastbound/i);
  assert.doesNotMatch(landing, /LiftLog|open source/i);
  assert.doesNotMatch(landing, /\b850\b|\b1,240\b|certified specialists/i);
});
