/**
 * You is quiet title + Account door, not an athlete-page tour.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

test('You first paint is quiet title + Account door', () => {
  const src = stripComments(read('src/page-components/ProfilePage.tsx'));
  const jsx = src.slice(src.lastIndexOf('return ('));
  assert.match(src, /className="house-profile"/);
  assert.match(jsx, /href="\/account"/);
  assert.match(jsx, /house-btn house-btn-ghost/);
  assert.match(jsx, /athletePageSettingsLink|Account & settings/);
});

test('leftover hops stay off /profile', () => {
  const src = stripComments(read('src/page-components/ProfilePage.tsx'));
  const jsx = src.slice(src.lastIndexOf('return ('));
  for (const leftover of [
    'AthleteIdentityCard',
    'MissionIdView',
    'ProfileAthleteCard',
    'AthleteTableCard',
    'CareerLineCard',
    'ProfileRewardsCard',
    'AthletePageKitCard',
    'AthletePrivateNoteCard',
    'AthletePageShareCard',
  ]) {
    assert.doesNotMatch(jsx, new RegExp(`<${leftover}\\b`), `${leftover} is leftover on You`);
  }
  assert.doesNotMatch(jsx, /athlete-page-kit-root/);
  assert.doesNotMatch(jsx, /data-athlete-block/);
});

test('Train still does not mint a week; Fuel still the log; Move still the quiet log; Coach still writes the week', () => {
  const active = stripComments(read('src/page-components/ActiveWorkoutPage.tsx'));
  assert.doesNotMatch(active, /from ['"]@\/hooks\/useCoachPlan['"]/);
  assert.doesNotMatch(active, /\bgenerateWeek\s*\(/);
  const door = read('src/hooks/useCoachPlan.ts');
  assert.match(door, /\bgenerateWeek\s*\(/);
  const coach = stripComments(read('src/page-components/CoachPage.tsx'));
  assert.match(coach, /data-testid="coach-generate-dock"/);
  const fuel = stripComments(read('src/page-components/NutritionPage.tsx'));
  assert.match(fuel, /data-testid="fuel-log-dock"/);
  const move = stripComments(read('src/page-components/MovePage.tsx'));
  assert.match(move, /<QuietMoveLogCard\b/);
});
