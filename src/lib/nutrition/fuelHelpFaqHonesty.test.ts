/**
 * Fuel help FAQ honesty (`.1111`).
 *
 * Help is English-only `docs/help/`. The logger already gates Log meal
 * (`estimateLogAllowed`). This guard fails if the athlete-facing FAQ
 * forgets the four honesty facts, drops the Fuel section, or starts
 * selling a checkout.
 *
 * Discover the help tree rather than listing two paths in a vacuum:
 * a rename that leaves this file pointing at ghosts is the same class
 * as `.220` (a name that claims more than its enumeration).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'path';

const root = join(import.meta.dirname, '..', '..', '..');
const helpDir = join(root, 'docs/help');

function helpFiles(): string[] {
  return readdirSync(helpDir)
    .filter((name) => name.endsWith('.md'))
    .sort();
}

function readHelp(name: string): string {
  return readFileSync(join(helpDir, name), 'utf8');
}

/** Slice `## Fuel` through the next `## ` heading (or EOF). */
function fuelFaqSection(faq: string): string {
  const start = faq.indexOf('\n## Fuel\n');
  assert.notEqual(start, -1, 'docs/help/faq.md has no `## Fuel` section');
  const from = start + 1;
  const next = faq.indexOf('\n## ', from + 3);
  return next === -1 ? faq.slice(from) : faq.slice(from, next);
}

test('docs/help still contains the Fuel FAQ + guide this PLAN pins', () => {
  const names = helpFiles();
  assert.ok(names.includes('faq.md'), 'faq.md vanished from docs/help');
  assert.ok(
    names.includes('fuel-and-nutrition.md'),
    'fuel-and-nutrition.md vanished from docs/help'
  );
  assert.ok(names.includes('pillars.md'), 'pillars.md vanished from docs/help');
  assert.ok(
    names.includes('getting-started.md'),
    'getting-started.md vanished from docs/help'
  );
});

test('Fuel FAQ names edit-before-log, vision-vs-heuristic, restock, not-clinical', () => {
  const fuel = fuelFaqSection(readHelp('faq.md'));
  assert.match(fuel, /edit-before-log/i);
  assert.match(fuel, /Log meal/);
  assert.match(fuel, /disabled until/i);
  assert.match(fuel, /MEAL_VISION_/);
  assert.match(fuel, /heuristic/i);
  assert.match(fuel, /restock/i);
  assert.match(fuel, /does not order/i);
  assert.match(fuel, /not clinical/i);
  assert.match(fuel, /not medical/i);
  assert.match(fuel, /local workout log/i);
});

test('Fuel FAQ does not invent checkout, paymentUrl, or traction', () => {
  const fuel = fuelFaqSection(readHelp('faq.md'));
  assert.doesNotMatch(fuel, /paymentUrl/i);
  assert.doesNotMatch(fuel, /checkout is live/i);
  assert.doesNotMatch(fuel, /buy now/i);
  assert.doesNotMatch(fuel, /\bMRR\b/);
  assert.doesNotMatch(fuel, /testimonial/i);
  assert.doesNotMatch(fuel, /\d+\s+(customers|users|buyers)\b/i);
});

test('fuel-and-nutrition Honesty keeps faq / Train / Coach links + floors', () => {
  const guide = readHelp('fuel-and-nutrition.md');
  assert.match(guide, /## Honesty/);
  assert.match(guide, /edit-before-log/i);
  assert.match(guide, /does not order/i);
  assert.match(guide, /MEAL_VISION_/);
  assert.match(guide, /\[faq\.md\]\(faq\.md\)/);
  assert.match(guide, /\[getting-started\.md\]\(getting-started\.md\)/);
  assert.match(guide, /\[mission-coach\.md\]\(mission-coach\.md\)/);
  assert.match(guide, /\b48\b/);
  assert.match(guide, /\b140\b/);
  assert.doesNotMatch(guide, /paymentUrl/i);
});

test('pillars + getting-started + INDEX still point at Fuel honesty', () => {
  const pillars = readHelp('pillars.md');
  assert.match(pillars, /edit-before-log/i);
  assert.match(pillars, /\[faq\.md\]\(faq\.md\) Fuel/);

  const start = readHelp('getting-started.md');
  assert.match(start, /review-then-log/);
  assert.match(start, /\[fuel-and-nutrition\.md\]\(fuel-and-nutrition\.md\)/);

  const index = readHelp('INDEX.md');
  assert.match(index, /edit-before-log/);
  assert.match(index, /restock does not order/);
});
