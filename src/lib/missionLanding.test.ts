import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const src = readFileSync(path.join(root, 'src/page-components/MissionLanding.tsx'), 'utf8');

test('landing wires the real entry points', () => {
  assert.match(src, /href="\/log"/);
  assert.match(src, /href="\/private"/);
  assert.match(src, /\/refunds/);
  assert.match(src, /https:\/\/buy\.stripe\.com\/aFabJ00AC0Rj6fh2eW9k400/);
});

test('landing states the real Earn It Back rules', () => {
  for (const s of ['24 workouts', '90 days', '96', '\\$50', '\\$40', '\\$90', '14-day']) assert.match(src, new RegExp(s));
});

test('landing carries no Z.ai sample content or invented proof', () => {
  assert.doesNotMatch(src, /IRONFORGE|IRONHOUSE|picsum|Marcus|Elena|Sarah K|Active members|Transformations|certified specialists/i);
  assert.doesNotMatch(src, /LiftLog|open[- ]source/i);
  assert.doesNotMatch(src, /cdn\.tailwindcss|fonts\.googleapis|font-awesome/);
});
