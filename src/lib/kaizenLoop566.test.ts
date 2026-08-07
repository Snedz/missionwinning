import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('Today/coach/auth CTAs drop trailing arrows', () => {
  const chips = readFileSync(
    join(root, 'src/components/today/CrossPillarCoachChips.tsx'),
    'utf8'
  );
  assert.doesNotMatch(chips, /\{message\} →/);
  assert.match(chips, /min-h-\[44px\]/);

  const sign = readFileSync(join(root, 'src/components/auth/SignInPrompt.tsx'), 'utf8');
  assert.doesNotMatch(sign, /Profile →/);
  assert.match(sign, /min-h-\[44px\]/);

  const week = readFileSync(
    join(root, 'src/components/coach/TodayCoachWeekStrip.tsx'),
    'utf8'
  );
  assert.doesNotMatch(week, /View full week →/);

  const hero = readFileSync(join(root, 'src/components/journey/JourneyHero.tsx'), 'utf8');
  assert.doesNotMatch(hero, /Rankings →/);
});

test('Welcome primary Continue is full-width 52px', () => {
  const src = readFileSync(join(root, 'src/page-components/WelcomePage.tsx'), 'utf8');
  assert.match(src, /primary-action min-h-\[52px\]/);
});

test('Public Learn/Exercise CTAs plain without arrows', () => {
  const ex = readFileSync(join(root, 'src/page-components/ExercisePublicPage.tsx'), 'utf8');
  assert.doesNotMatch(ex, /Log this free →/);
  const path = readFileSync(join(root, 'src/page-components/LearnPathPublicPage.tsx'), 'utf8');
  assert.doesNotMatch(path, /Open in Learn →/);
});
