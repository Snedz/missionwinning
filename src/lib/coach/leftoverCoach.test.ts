/**
 * Coach is the week writer, not a tour — empty + Generate, or this week's session.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

test('Coach empty is Generate; a week is the session grid', () => {
  const src = stripComments(read('src/page-components/CoachPage.tsx'));
  assert.match(src, /from ['"]@\/hooks\/useCoachPlan['"]/);
  assert.match(src, /data-testid="coach-generate-dock"/);
  assert.match(src, /generate\(\)/);
  assert.match(src, /className="house-empty"/);
  assert.match(src, /CoachPlanSessionGrid/);
  assert.match(src, /mode="sheet"/);
  assert.doesNotMatch(src, /mode="week"/);
});

test('leftover hops stay off /coach', () => {
  const src = stripComments(read('src/page-components/CoachPage.tsx'));
  const jsx = src.slice(src.indexOf('return ('));
  for (const leftover of [
    'WeekStrip',
    'CoachLiveVoice',
    'CoachNextDayCite',
    'CoachAdaptBanner',
    'CoachChatPanel',
    'CoachVoiceCard',
    'CoachLoadBand',
    'CoachLogCite',
    'CoachManageSheet',
    'UnlockButton',
  ]) {
    assert.doesNotMatch(jsx, new RegExp(`<${leftover}\\b`), `${leftover} is leftover on Coach`);
  }
  assert.doesNotMatch(jsx, /data-testid="coach-show-all"/);
  assert.doesNotMatch(jsx, /data-testid="coach-week-dose"/);
  assert.doesNotMatch(jsx, /<details\b/);
});

test('Train still does not mint a week; Log set stays filled', () => {
  const active = stripComments(read('src/page-components/ActiveWorkoutPage.tsx'));
  assert.doesNotMatch(active, /from ['"]@\/hooks\/useCoachPlan['"]/);
  assert.doesNotMatch(active, /\bgenerateWeek\s*\(/);
  const door = read('src/hooks/useCoachPlan.ts');
  assert.match(door, /\bgenerateWeek\s*\(/);
});
