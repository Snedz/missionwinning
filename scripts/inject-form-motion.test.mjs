/**
 * Motion inject must be idempotent and tag the mid stick phase only.
 * Run: node --test scripts/inject-form-motion.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { injectFormMotion } from './inject-form-motion.mjs';

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220" fill="none" role="img" aria-label="Test">
  <title>Test</title>
  <rect width="360" height="220" fill="#f3f2f2"></rect>
  <g stroke="#201e1d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <circle cx="60" cy="55" r="9"></circle>
  </g>
  <circle cx="60" cy="100" r="3.5" fill="#ec3013"></circle>
  <g stroke="#201e1d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <circle cx="180" cy="80" r="9"></circle>
  </g>
  <path d="M180 155 L180 120" stroke="#ec3013" stroke-width="2"></path>
  <g stroke="#201e1d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <circle cx="300" cy="55" r="9"></circle>
  </g>
</svg>
`;

test('injects style and tags only the second stick group', () => {
  const out = injectFormMotion(SAMPLE);
  assert.match(out, /form-mid-bob/);
  assert.match(out, /prefers-reduced-motion: no-preference/);
  const mid = [...out.matchAll(/class="form-phase-mid"/g)];
  assert.equal(mid.length, 1, 'exactly one mid-phase group');
  // first and third stick groups stay unclassed
  assert.equal(
    (out.match(/<g stroke="#201e1d"/g) || []).length,
    2,
    'two plain stick groups remain'
  );
  assert.match(out, /class="form-cue-pulse"[^>]*fill="#ec3013"/);
});

test('inject is idempotent', () => {
  const once = injectFormMotion(SAMPLE);
  const twice = injectFormMotion(once);
  assert.equal(once, twice);
  assert.equal((twice.match(/<style>/g) || []).length, 1);
  assert.equal((twice.match(/class="form-phase-mid"/g) || []).length, 1);
  assert.equal((twice.match(/class="form-cue-pulse"/g) || []).length, 2);
});
