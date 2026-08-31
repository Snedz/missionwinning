/**
 * Train is the logger, not a week writer.
 * useCoachPlan auto-calls generateWeek on mount — /active must not import it.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

test('Train does not mount useCoachPlan', () => {
  const page = read('src/page-components/ActiveWorkoutPage.tsx');
  assert.doesNotMatch(
    page,
    /from ['"]@\/hooks\/useCoachPlan['"]/,
    '/active importing useCoachPlan auto-generates a week'
  );
  assert.doesNotMatch(page, /useCoachPlan\s*\(/);
});

test('CoachPage remains the week door', () => {
  const coach = read('src/page-components/CoachPage.tsx');
  assert.match(coach, /from ['"]@\/hooks\/useCoachPlan['"]/);
});

test('volume trim does not call generateWeek', () => {
  const trim = read('src/lib/coach/trimTodayVolume.ts');
  assert.doesNotMatch(trim, /\bgenerateWeek\s*\(/);
  assert.match(trim, /loadPlan/);
  assert.match(trim, /adjustTodaySession/);
});
