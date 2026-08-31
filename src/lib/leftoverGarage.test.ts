/**
 * Garage is a quiet foot, not a messenger tour.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

test('Garage first paint is quiet title', () => {
  const src = stripComments(read('src/page-components/ServerPage.tsx'));
  assert.match(src, /className="house-garage/);
  assert.match(src, /serverTitle|Garage/);
  assert.doesNotMatch(src, /<ChatWindow\b/);
});

test('leftover hops stay off /server', () => {
  const src = stripComments(read('src/page-components/ServerPage.tsx'));
  const jsx = src.slice(src.lastIndexOf('return ('));
  for (const leftover of ['ChatWindow', 'BuddyList', 'PresenceControl']) {
    assert.doesNotMatch(jsx, new RegExp(`<${leftover}\\b`), `${leftover} is leftover on Garage`);
  }
  assert.doesNotMatch(src, /connectGarageRealtime/);
  assert.doesNotMatch(src, /postLocalMessage/);
});

test('Train still does not mint a week; Feedback still the form; Coach still does not read Garage', () => {
  const active = stripComments(read('src/page-components/ActiveWorkoutPage.tsx'));
  assert.doesNotMatch(active, /from ['"]@\/hooks\/useCoachPlan['"]/);
  assert.doesNotMatch(active, /\bgenerateWeek\s*\(/);
  const feedback = stripComments(read('src/page-components/FeedbackPage.tsx'));
  assert.match(feedback, /composeFeedbackNote\(/);
  const coach = stripComments(read('src/page-components/CoachPage.tsx'));
  assert.doesNotMatch(coach, /from ['"]@\/lib\/social/);
  assert.doesNotMatch(coach, /<ChatWindow\b/);
});
