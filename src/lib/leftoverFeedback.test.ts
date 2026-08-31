/**
 * Feedback is the form, not a sign-in tour.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

test('Feedback first paint is the form', () => {
  const src = stripComments(read('src/page-components/FeedbackPage.tsx'));
  assert.match(src, /className="house-feedback"/);
  assert.match(src, /composeFeedbackNote\(/);
  assert.match(src, /enqueueFeedback\(/);
  assert.doesNotMatch(src, /<SignInPrompt\b/);
});

test('leftover hops stay off /feedback', () => {
  const src = stripComments(read('src/page-components/FeedbackPage.tsx'));
  const jsx = src.slice(src.lastIndexOf('return ('));
  assert.doesNotMatch(jsx, /<SignInPrompt\b/, 'SignInPrompt is leftover on Feedback');
  assert.doesNotMatch(jsx, /showLegalFooter/);
  assert.doesNotMatch(jsx, /<details\b/);
  assert.doesNotMatch(src, /<ProfileFeedbackCard\b/);
});

test('Train still does not mint a week; Learn still the intro; Fuel still the log', () => {
  const active = stripComments(read('src/page-components/ActiveWorkoutPage.tsx'));
  assert.doesNotMatch(active, /from ['"]@\/hooks\/useCoachPlan['"]/);
  assert.doesNotMatch(active, /\bgenerateWeek\s*\(/);
  const learn = stripComments(read('src/page-components/LearnPage.tsx'));
  assert.match(learn, /<QuietLearnIntroCard\b/);
  const fuel = stripComments(read('src/page-components/NutritionPage.tsx'));
  assert.match(fuel, /data-testid="fuel-log-dock"/);
});
