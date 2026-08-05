/**
 * Public footer docs must not ship pitch-deck / AI-slop / testimonial-farm voice.
 *
 * Locked product direction: vision.md + YC wedge (Train + Mission Coach).
 * `.493` rewrote Vision / Feedback / Paths after a footer docs review.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

/** Phrases that must not appear in EN info vision/feedback marketing strings. */
const VISION_BANNED =
  /everything app|synergistic|Freeletics|#1 Health|super app structure|universes|path of destruction/i;

test('EN vision strings match wedge — no everything-app pitch', () => {
  const src = read('src/i18n/infoLocales.ts');
  // Slice en const only (before `const es`)
  const enStart = src.indexOf('const en: InfoStrings');
  const esStart = src.indexOf('const es: InfoStrings');
  assert.ok(enStart >= 0 && esStart > enStart);
  const en = src.slice(enStart, esStart);
  assert.doesNotMatch(en, VISION_BANNED, 'vision EN still has pitch-deck / AI filler');
  assert.match(en, /Train anywhere\. Coach from what you actually logged/);
  assert.match(en, /Six pillars/);
  assert.match(en, /never gates/);
});

test('EN feedback is friction-first, not win-farm', () => {
  const src = read('src/i18n/infoLocales.ts');
  const enStart = src.indexOf('const en: InfoStrings');
  const esStart = src.indexOf('const es: InfoStrings');
  const en = src.slice(enStart, esStart);
  assert.doesNotMatch(en, /Share your wins|Beta founders feedback|shape the roadmap/i);
  assert.match(en, /infoFeedbackTitle: 'Feedback'/);
  assert.match(en, /What should we fix/);
});

test('learn path lessons do not ship template briefing bodies', () => {
  const src = read('src/data/learnPaths.ts');
  // The three phrases that were copy-pasted into every lesson body (~28×).
  assert.doesNotMatch(src, /Treat it as a briefing/);
  assert.doesNotMatch(src, /When ready, use the action link/);
  assert.doesNotMatch(src, /Practice the key points on your next session/);
  // No body arrays until someone writes original paragraphs (not a template).
  assert.equal(
    (src.match(/\bbody:\s*\[/g) ?? []).length,
    0,
    'strip template bodies; write originals only if needed'
  );
});

test('Vision page never falls back to raw key names for core bullets', () => {
  const src = read('src/page-components/VisionPage.tsx');
  assert.doesNotMatch(src, /defaultValue:\s*key\b/);
  assert.match(src, /VISION_CORE_DEFAULTS/);
});
