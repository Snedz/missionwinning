/**
 * I-Day is a Skip, not a wall. Tracker paths stay reachable without the academy.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { isJourneyBypassPath, JOURNEY_BYPASS_PATHS } from '@/lib/publicRoutes';

const root = path.join(import.meta.dirname, '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

test('Today, Train, Coach, and History bypass I-Day', () => {
  assert.equal(isJourneyBypassPath('/log'), true);
  assert.equal(isJourneyBypassPath('/log/'), true);
  assert.equal(isJourneyBypassPath('/active'), true);
  assert.equal(isJourneyBypassPath('/active/foo'), true);
  assert.equal(isJourneyBypassPath('/coach'), true);
  assert.equal(isJourneyBypassPath('/history'), true);
  assert.ok(JOURNEY_BYPASS_PATHS.includes('/log'));
  assert.ok(JOURNEY_BYPASS_PATHS.includes('/active'));
  assert.ok(JOURNEY_BYPASS_PATHS.includes('/coach'));
  assert.ok(JOURNEY_BYPASS_PATHS.includes('/history'));
});

test('JourneyGuard still honors the bypass list before bouncing', () => {
  const src = stripComments(read('src/components/journey/JourneyGuard.tsx'));
  const effect = src.slice(src.indexOf('useEffect(() =>'), src.indexOf('return <>'));
  assert.match(effect, /isJourneyBypassPath\(pathname\)/);
  assert.match(effect, /isIDayComplete\(\)/);
  assert.ok(
    effect.indexOf('isJourneyBypassPath') < effect.indexOf('isIDayComplete'),
    'bypass must run before the I-Day bounce'
  );
  assert.match(effect, /router\.replace\('\/welcome'\)/);
});

test('Welcome Skip stamps beginner/bodyweight/strength and is not the filled press', () => {
  const src = stripComments(read('src/page-components/WelcomePage.tsx'));
  const welcome = src.slice(src.indexOf("step === 'welcome'"), src.indexOf("step === 'profile'"));
  assert.match(welcome, /welcomeSkipSignIn/);
  assert.match(welcome, /handleSkip/);
  assert.match(welcome, /welcomeBegin/);
  const primaries = [...welcome.matchAll(/primary-action/g)];
  assert.equal(primaries.length, 1, 'Begin stays the only filled press on Welcome');
  assert.doesNotMatch(welcome, /welcomeSignInTitle|<SignInPanel/);

  const skip = src.slice(src.indexOf('const handleSkip'), src.indexOf('const handleProfileNext'));
  assert.match(skip, /completeIDay\(|finish\(/);
  assert.match(src, /useState\('beginner'\)/);
  assert.match(src, /useState\('bodyweight'\)/);
  assert.match(src, /goalPresetValue\('strength'\)/);
  assert.match(src, /navigateAfterPrivateGateUnlock/);
  assert.doesNotMatch(skip, /startWorkout\s*\(/);
  assert.doesNotMatch(skip, /<SignInPanel/);
});
