/**
 * Pin chrome owns its own words.
 *
 * Edit Today belongs to the header. Recommended Starting Point belongs
 * to the orphaned dashboard progress card. Pins reused both, so first
 * paint lectured.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const pins = () =>
  readFileSync(path.join(root, 'src/components/today/TodaySummaryPins.tsx'), 'utf8');
const nav = () => readFileSync(path.join(root, 'src/i18n/navLocales.ts'), 'utf8');
const today = () =>
  readFileSync(path.join(root, 'src/i18n/todayLocales.ts'), 'utf8');

test('pin Edit is Edit, not Edit Today', () => {
  const src = pins();
  assert.doesNotMatch(src, /todayEditToday/, 'header key on the pin row');
  assert.match(src, /todayPinsEdit/);
  assert.match(src, /defaultValue: 'Edit'/);
  const pack = nav();
  assert.match(pack, /todayPinsEdit: 'Edit'/);
});

test('start pin kicker is Today\'s session, not Recommended Starting Point', () => {
  const src = pins();
  assert.doesNotMatch(src, /todayRecommendedStart/, 'dashboard lecture on a start pin');
  assert.match(src, /todayPinStartKicker/);
  assert.match(src, /defaultValue: "Today's session"/);
  const pack = nav();
  assert.match(pack, /todayPinStartKicker: "Today's session"/);
});

test('the header still owns Edit Today', () => {
  assert.match(today(), /todayEditToday: 'Edit Today'/);
});
