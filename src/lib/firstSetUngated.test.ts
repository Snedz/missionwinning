import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import {
  isActiveLoggerPath,
  normalizeAppPath,
  showHeaderSignInChip,
} from '@/lib/firstSetUngated';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

describe('firstSetUngated predicate', () => {
  it('normalizes trailing slash and query', () => {
    assert.equal(normalizeAppPath('/active/'), '/active');
    assert.equal(normalizeAppPath('/active?fieldTest=1'), '/active');
    assert.equal(normalizeAppPath(''), '/');
  });

  it('treats /active and nested Train paths as the logger', () => {
    assert.equal(isActiveLoggerPath('/active'), true);
    assert.equal(isActiveLoggerPath('/active/'), true);
    assert.equal(isActiveLoggerPath('/log'), false);
    assert.equal(isActiveLoggerPath('/profile'), false);
  });

  it('hides the Sign in chip until first workout and on Train', () => {
    assert.equal(showHeaderSignInChip({ hasFirstWorkout: false, pathname: '/log' }), false);
    assert.equal(showHeaderSignInChip({ hasFirstWorkout: false, pathname: '/active' }), false);
    assert.equal(showHeaderSignInChip({ hasFirstWorkout: true, pathname: '/active' }), false);
    assert.equal(showHeaderSignInChip({ hasFirstWorkout: true, pathname: '/log' }), true);
    assert.equal(showHeaderSignInChip({ hasFirstWorkout: true, pathname: '/profile' }), true);
  });
});

describe('firstSetUngated wiring', () => {
  it('I-Day Continue finishes — no sign-in step', () => {
    const src = read('src/page-components/WelcomePage.tsx');
    assert.match(src, /type Step = 'welcome' \| 'profile'/);
    assert.match(src, /const STEP_ORDER: Step\[\] = \['welcome', 'profile'\]/);
    assert.doesNotMatch(src, /setStep\('signin'\)/);
    assert.doesNotMatch(src, /<SignInPanel/);
    const next = src.slice(src.indexOf('const handleProfileNext'), src.indexOf('const stepIndex'));
    assert.match(next, /finish\(\)/);
    assert.doesNotMatch(next, /setStep/);
  });

  it('Train never mounts SignInPrompt', () => {
    const src = read('src/page-components/ActiveWorkoutPage.tsx');
    assert.doesNotMatch(src, /<SignInPrompt/);
    assert.doesNotMatch(src, /from '@\/components\/auth\/SignInPrompt'/);
  });

  it('HeaderAuthChip uses the predicate and skips getUser when hidden', () => {
    const src = read('src/components/layout/HeaderAuthChip.tsx');
    assert.match(src, /showHeaderSignInChip/);
    assert.match(src, /workoutHistory\.length/);
    assert.match(src, /if \(!showChip\) return;/);
    const boot = src.slice(src.indexOf('const boot'), src.indexOf('if (typeof requestIdleCallback'));
    assert.match(boot, /if \(!showChip\) return;/);
    assert.match(src, /getUser\(/);
  });

  it('Today Lean + Dashboard pass hasFirstWorkout from workout history', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /hasFirstWorkout=\{workoutHistory\.length > 0\}/);
    const dash = read('src/page-components/HomeTodayDashboard.tsx');
    assert.match(dash, /hasFirstWorkout=\{workoutHistory\.length > 0\}/);
    const header = read('src/components/today/TodayPageHeader.tsx');
    assert.match(header, /hasFirstWorkout/);
    assert.match(header, /hasFirstWorkout && !userEmail/);
  });
});
