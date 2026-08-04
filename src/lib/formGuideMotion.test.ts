/**
 * Hero form guides ship with mid-phase CSS motion (GrokFilm-style example reels).
 * Animation lives inside the SVG so it works under <img src>.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const dir = path.join(root, 'public', 'form-guides');

/** Keep in sync with scripts/inject-form-motion.mjs HERO_MOTION_IDS. */
const HERO_MOTION_IDS = [
  'push-ups',
  'air-squat',
  'squats',
  'deadlift',
  'pull-ups',
  'plank',
  'thruster',
  'overhead-press',
  'barbell-row',
  'lunges',
  'kettlebell-swing',
  'burpees',
  'hip-thrust',
  'bench-press',
  'romanian-deadlift',
  'inverted-row',
] as const;

test('hero form guides include mid-phase motion that respects reduced motion', () => {
  assert.ok(existsSync(dir), 'public/form-guides missing');
  for (const id of HERO_MOTION_IDS) {
    const file = path.join(dir, `${id}.svg`);
    assert.ok(existsSync(file), `missing hero SVG: ${id}`);
    const svg = readFileSync(file, 'utf8');
    assert.match(svg, /form-phase-mid/, `${id}: mid phase not tagged for motion`);
    assert.match(svg, /form-mid-bob/, `${id}: missing bob keyframes`);
    assert.match(
      svg,
      /prefers-reduced-motion:\s*no-preference/,
      `${id}: motion must be gated on prefers-reduced-motion`
    );
  }
});

test('non-hero guides are not required to animate (long-tail stays still)', () => {
  const heroes = new Set(HERO_MOTION_IDS.map((id) => `${id}.svg`));
  const others = readdirSync(dir).filter((f) => f.endsWith('.svg') && !heroes.has(f));
  assert.ok(others.length > 10, 'expected a long-tail set without forced motion');
});
