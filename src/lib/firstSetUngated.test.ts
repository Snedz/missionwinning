import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'path';
import {
  isActiveLoggerPath,
  normalizeAppPath,
  showHeaderSignInChip,
} from '@/lib/firstSetUngated';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const SPEECH_IMPORT = /from\s+['"]@\/lib\/speech/;
const SIGNIN_PROMPT_IMPORT = /from\s+['"]@\/components\/auth\/SignInPrompt['"]/;
const SIGNIN_PROMPT_JSX = /<SignInPrompt\b/;

function workoutImportsFrom(src: string): string[] {
  const out = new Set<string>();
  const re = /from\s+['"]@\/components\/workout\/([^'"]+)['"]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    out.add(m[1].replace(/\.tsx?$/, ''));
  }
  return [...out].sort();
}

function resolveWorkoutFile(name: string): string | null {
  const candidates = [
    `src/components/workout/${name}.tsx`,
    `src/components/workout/${name}.ts`,
    `src/components/workout/${name}/index.tsx`,
  ];
  return candidates.find((p) => existsSync(path.join(root, p))) ?? null;
}

describe('firstSetUngated predicate', () => {
  it('normalizes trailing slash, query, hash, and nullish', () => {
    assert.equal(normalizeAppPath('/active/'), '/active');
    assert.equal(normalizeAppPath('/active?fieldTest=1'), '/active');
    assert.equal(normalizeAppPath('/active#dock'), '/active');
    assert.equal(normalizeAppPath('/active/?x=1#y'), '/active');
    assert.equal(normalizeAppPath(''), '/');
    assert.equal(normalizeAppPath(null), '/');
    assert.equal(normalizeAppPath(undefined), '/');
  });

  it('treats /active and nested Train paths as the logger', () => {
    assert.equal(isActiveLoggerPath('/active'), true);
    assert.equal(isActiveLoggerPath('/active/'), true);
    assert.equal(isActiveLoggerPath('/active?x=1'), true);
    assert.equal(isActiveLoggerPath('/active#rest'), true);
    assert.equal(isActiveLoggerPath('/active/foo'), true);
    assert.equal(isActiveLoggerPath('/log'), false);
    assert.equal(isActiveLoggerPath('/log/'), false);
    assert.equal(isActiveLoggerPath('/profile'), false);
    assert.equal(isActiveLoggerPath(null), false);
  });

  it('hides the Sign in chip until first workout and on Train', () => {
    assert.equal(showHeaderSignInChip({ hasFirstWorkout: false, pathname: '/log' }), false);
    assert.equal(showHeaderSignInChip({ hasFirstWorkout: false, pathname: '/active' }), false);
    assert.equal(showHeaderSignInChip({ hasFirstWorkout: false, pathname: null }), false);
    assert.equal(showHeaderSignInChip({ hasFirstWorkout: true, pathname: '/active' }), false);
    assert.equal(showHeaderSignInChip({ hasFirstWorkout: true, pathname: '/active?x=1' }), false);
    assert.equal(showHeaderSignInChip({ hasFirstWorkout: true, pathname: '/active#x' }), false);
    assert.equal(showHeaderSignInChip({ hasFirstWorkout: true, pathname: '/active/foo' }), false);
    assert.equal(showHeaderSignInChip({ hasFirstWorkout: true, pathname: '/log' }), true);
    assert.equal(showHeaderSignInChip({ hasFirstWorkout: true, pathname: '/log/' }), true);
    assert.equal(showHeaderSignInChip({ hasFirstWorkout: true, pathname: '/profile' }), true);
  });
});

describe('firstSetUngated wiring', () => {
  it('I-Day Continue finishes — no sign-in step', () => {
    const src = read('src/page-components/WelcomePage.tsx');
    assert.match(src, /type Step = 'welcome' \| 'profile'/);
    assert.match(src, /const STEP_ORDER: Step\[\] = \['welcome', 'profile'\]/);
    assert.doesNotMatch(src, /'signin'/);
    assert.doesNotMatch(src, /setStep\('signin'\)/);
    assert.doesNotMatch(src, /<SignInPanel/);
    assert.doesNotMatch(src, /welcomeSkipSignIn|welcomeSignInTitle/);
    const next = src.slice(src.indexOf('const handleProfileNext'), src.indexOf('const stepIndex'));
    assert.match(next, /finish\(\)/);
    assert.doesNotMatch(next, /setStep/);
    assert.match(src, /welcomeBegin.*defaultValue: 'Begin'/);
    const welcomeRoute = read('app/welcome/page.tsx');
    assert.doesNotMatch(welcomeRoute, /AppHeader|HeaderAuthChip/);
  });

  it('Train never mounts SignInPrompt', () => {
    const src = read('src/page-components/ActiveWorkoutPage.tsx');
    assert.doesNotMatch(src, SIGNIN_PROMPT_JSX);
    assert.doesNotMatch(src, SIGNIN_PROMPT_IMPORT);
  });

  it('discovers one-hop Train children and none mount SignInPrompt', () => {
    const page = read('src/page-components/ActiveWorkoutPage.tsx');
    const names = workoutImportsFrom(page);
    assert.ok(
      names.length >= 5,
      `expected Active workout children, got ${names.join(', ') || '(none)'}`
    );
    assert.ok(names.includes('ActiveEmptyState'), 'empty Start shell missing from imports');
    assert.ok(names.includes('ActiveExerciseList'), 'set-log list missing from imports');
    for (const name of names) {
      const rel = resolveWorkoutFile(name);
      assert.ok(rel, `unresolved workout import ${name}`);
      const src = read(rel!);
      assert.doesNotMatch(src, SIGNIN_PROMPT_JSX, `${rel} mounts SignInPrompt`);
      assert.doesNotMatch(src, SIGNIN_PROMPT_IMPORT, `${rel} imports SignInPrompt`);
    }
  });

  it('Fuel still mounts SignInPrompt — .697 fail-open stays off Train', () => {
    const fuel = read('src/page-components/NutritionPage.tsx');
    assert.match(fuel, SIGNIN_PROMPT_JSX);
    assert.match(fuel, SIGNIN_PROMPT_IMPORT);
  });

  it('HeaderAuthChip uses the predicate and skips getUser when hidden', () => {
    const src = read('src/components/layout/HeaderAuthChip.tsx');
    assert.match(src, /showHeaderSignInChip/);
    assert.match(src, /workoutHistory\.length/);
    assert.match(src, /usePathname\(\) \?\? ''/);
    assert.match(src, /if \(!showChip\) return;/);
    const boot = src.slice(src.indexOf('const boot'), src.indexOf('if (typeof requestIdleCallback'));
    const guardAt = boot.indexOf('if (!showChip) return;');
    const getUserAt = boot.indexOf('getUser(');
    assert.ok(guardAt !== -1, 'boot must bail when the chip is hidden');
    assert.ok(getUserAt > guardAt, 'getUser must sit after the hidden-chip return');
    const afterReturn = src.slice(src.indexOf('if (!showChip) return null;'));
    assert.match(afterReturn, /<Link/);
  });

  it('Today Lean + Dashboard pass hasFirstWorkout from workout history', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /hasFirstWorkout=\{workoutHistory\.length > 0\}/);
    const dash = read('src/page-components/HomeTodayDashboard.tsx');
    assert.match(dash, /hasFirstWorkout=\{workoutHistory\.length > 0\}/);
    const header = read('src/components/today/TodayPageHeader.tsx');
    assert.match(header, /hasFirstWorkout/);
    assert.match(header, /hasFirstWorkout && !userEmail/);
    assert.doesNotMatch(header, /Keep this diary/i);
    assert.doesNotMatch(lean, /Keep this diary/i);
    assert.doesNotMatch(dash, /Keep this diary/i);
  });

  it('handleLogSet does not await auth', () => {
    const page = read('src/page-components/ActiveWorkoutPage.tsx');
    const fn = page.match(
      /const handleLogSet[\s\S]*?startRestTimer\(rest\.restSeconds(?:,\s*exerciseId)?\);[\s\S]*?\n {2}\};/
    );
    assert.ok(fn, 'handleLogSet rest block missing');
    const body = fn[0];
    assert.doesNotMatch(body, /\bawait\b/);
    assert.doesNotMatch(body, /\basync\b/);
    assert.doesNotMatch(body, /getUser|getSession|flushOutbox|flush\s*\(/);
  });

  it('first-90 TAP_BUDGET stays 5 and Skip-sign-in is gone', () => {
    const spec = read('tests/e2e/first-90.spec.ts');
    assert.match(spec, /const TAP_BUDGET = 5;/);
    assert.doesNotMatch(spec, /TAP_BUDGET\s*=\s*[6-9]/);
    assert.doesNotMatch(spec, /Skip — start training|Skip-sign-in|skipSignIn/i);
    const cold = spec.slice(
      spec.indexOf('a cold visitor logs a set'),
      spec.indexOf('the homepage uses the brand')
    );
    assert.match(cold, /\/\^begin\$\/i/);
    assert.match(cold, /continue\|continuar/i);
    assert.doesNotMatch(cold, /skip/i);
  });

  it('speech does not own Active first paint or the set-log table', () => {
    const firstPaint = [
      'src/page-components/ActiveWorkoutPage.tsx',
      'src/components/workout/ActiveExerciseList.tsx',
      'src/components/workout/LogConsole.tsx',
      'src/components/workout/ActiveSessionChrome.tsx',
      'src/components/workout/ActiveEmptyState.tsx',
    ];
    for (const rel of firstPaint) {
      assert.doesNotMatch(read(rel), SPEECH_IMPORT, `${rel} imports speech on first paint`);
    }
    const page = read('src/page-components/ActiveWorkoutPage.tsx');
    for (const name of workoutImportsFrom(page)) {
      const rel = resolveWorkoutFile(name);
      if (!rel) continue;
      assert.doesNotMatch(read(rel), SPEECH_IMPORT, `${rel} imports speech on the Active hop`);
    }
  });
});
