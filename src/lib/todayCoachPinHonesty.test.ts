/**
 * Today Coach pin is Coach.
 *
 * TodaySummaryPins used navCoach. Packs and bootstrap say AI weekly
 * plan. First paint said Coach then the lecture. The tab is Coach.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { navStringsFor } from '@/i18n/navLocales';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const PINS = 'src/components/today/TodaySummaryPins.tsx';

test('navCoachTab pack is Coach', () => {
  assert.equal(navStringsFor('en').navCoachTab, 'Coach');
});

test('Today Coach pin uses navCoachTab — not AI weekly plan', () => {
  const src = read(PINS);
  assert.doesNotMatch(
    src,
    /t\('navCoach'/,
    'navCoach is AI weekly plan. The pin is Coach.'
  );
  const matches = [...src.matchAll(/t\('navCoachTab',\s*\{\s*defaultValue:\s*'Coach'\s*\}/g)];
  assert.ok(
    matches.length >= 2,
    'Edit list and pin card both need navCoachTab default Coach'
  );
});
