/**
 * Landing exercise counts must derive from `CONTENT_FLOORS.exercisePages`, never
 * hand-typed — the same drift class as `payments.test.ts` (.605) and compare
 * stories (217 vs 228).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { CONTENT_FLOORS } from '@/lib/contentFloors';
import { landingStringsFor } from '@/i18n/landingLocales';

const root = path.join(import.meta.dirname, '..', '..');

const LANDING_EXERCISE_COUNT_KEYS = [
  'landingFreeTermLibrary',
  'landingHeroLibrary',
  'landingProofChip',
  'landingStatExercises',
  'landingFreeLibrary',
  'landingFreeStatLibrary',
] as const;

const SCANNED_FILES = [
  'src/i18n/landingLocales.ts',
  'src/page-components/LandingPage.tsx',
  'app/exercises/page.tsx',
] as const;

test('landing locale sources forbid stale hand-typed exercise counts', () => {
  for (const rel of SCANNED_FILES) {
    const src = readFileSync(path.join(root, rel), 'utf8');
    assert.doesNotMatch(
      src,
      /\b217\b/,
      `${rel} still mentions 217 — derive from CONTENT_FLOORS.exercisePages`
    );
  }

  const landingLocales = readFileSync(path.join(root, 'src/i18n/landingLocales.ts'), 'utf8');
  assert.match(
    landingLocales,
    /CONTENT_FLOORS\.exercisePages/,
    'landingLocales.ts must import the floor, not retype a count'
  );

  for (const key of LANDING_EXERCISE_COUNT_KEYS) {
    const block = landingLocales.slice(
      landingLocales.indexOf('const LANDING_EN'),
      landingLocales.indexOf('const LANDING_ES')
    );
    assert.match(
      block,
      new RegExp(`${key}:\\s*\`[^\`]*\\$\\{EP\\}`),
      `${key} must interpolate EP (CONTENT_FLOORS.exercisePages), not a literal`
    );
  }
});

test('English landing strings state the exercise-page floor', () => {
  const en = landingStringsFor('en');
  const floor = String(CONTENT_FLOORS.exercisePages);
  for (const key of LANDING_EXERCISE_COUNT_KEYS) {
    assert.match(
      en[key],
      new RegExp(`\\b${floor}\\b`),
      `${key} should under-promise with floor ${floor} — got "${en[key]}"`
    );
    assert.doesNotMatch(
      en[key],
      /\b217\b/,
      `${key} still advertises stale 217`
    );
  }
});
