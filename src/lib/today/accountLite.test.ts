/**
 * F-017 account-lite — first set with no account; offer after first workout.
 *
 * Discover call sites rather than enumerate a closed list of files that can
 * go stale. Mutants: forced account, mid-set prompt, device-link / OS prompt
 * / weekly-plan wall before the first log, invite-only / paywall copy.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import {
  ACCOUNT_LITE_COPY,
  ACCOUNT_LITE_DISMISS_KEY,
  accountLiteCopyIsHonest,
  accountLiteHeroChrome,
  mayOfferDeviceLink,
  mayRequestOsPermission,
  mayShowActiveSignInPrompt,
} from './accountLite';
import { todayCoachInviteMayMount } from './todayCoachInviteMount';
import { STORAGE_KEYS } from '@/lib/storage/keys';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

describe('accountLiteHeroChrome', () => {
  it('hides account CTA until the first completed workout', () => {
    assert.equal(
      accountLiteHeroChrome({ signedIn: false, completedWorkouts: 0, dismissed: false }),
      'local-badge'
    );
    assert.equal(
      accountLiteHeroChrome({ signedIn: false, completedWorkouts: 1, dismissed: false }),
      'offer'
    );
  });

  it('never offers when signed in, and Not now keeps the quiet badge', () => {
    assert.equal(
      accountLiteHeroChrome({ signedIn: true, completedWorkouts: 0, dismissed: false }),
      'quiet'
    );
    assert.equal(
      accountLiteHeroChrome({ signedIn: true, completedWorkouts: 3, dismissed: false }),
      'quiet'
    );
    assert.equal(
      accountLiteHeroChrome({ signedIn: false, completedWorkouts: 2, dismissed: true }),
      'local-badge'
    );
  });
});

describe('mayShowActiveSignInPrompt', () => {
  it('never mounts during a live session (persistence bar)', () => {
    assert.equal(
      mayShowActiveSignInPrompt({
        signedIn: false,
        completedWorkouts: 0,
        dismissed: false,
        hasActiveWorkout: true,
      }),
      false
    );
    assert.equal(
      mayShowActiveSignInPrompt({
        signedIn: false,
        completedWorkouts: 4,
        dismissed: false,
        hasActiveWorkout: true,
      }),
      false
    );
  });

  it('may offer on an empty Active shell only after the first workout', () => {
    assert.equal(
      mayShowActiveSignInPrompt({
        signedIn: false,
        completedWorkouts: 0,
        dismissed: false,
        hasActiveWorkout: false,
      }),
      false
    );
    assert.equal(
      mayShowActiveSignInPrompt({
        signedIn: false,
        completedWorkouts: 1,
        dismissed: false,
        hasActiveWorkout: false,
      }),
      true
    );
  });
});

describe('Day-1 absorbed gates', () => {
  it('F-020: device-link waits for the first log', () => {
    assert.equal(mayOfferDeviceLink(0), false);
    assert.equal(mayOfferDeviceLink(1), true);
  });

  it('F-033: OS permission prompts wait for the first log', () => {
    assert.equal(mayRequestOsPermission(0), false);
    assert.equal(mayRequestOsPermission(1), true);
  });

  it('F-028: Coach invite is not a wall before the first log', () => {
    assert.equal(
      todayCoachInviteMayMount({ phase: 'basic', totalSessions: 0 }),
      false
    );
    assert.equal(
      todayCoachInviteMayMount({ phase: 'i-day', totalSessions: 0 }),
      false
    );
  });
});

describe('accountLite copy honesty', () => {
  it('keeps EN free of invite-only / paywall / cloud-required framing', () => {
    const result = accountLiteCopyIsHonest();
    assert.equal(result.ok, true, JSON.stringify(result));
    assert.match(ACCOUNT_LITE_COPY.localBadge, /this device/i);
    assert.match(ACCOUNT_LITE_COPY.deferAccountBody, /offline/i);
  });

  it('fails closed when a mutant reintroduces forbidden framing', () => {
    const poisoned = {
      ...ACCOUNT_LITE_COPY,
      deferAccountBody: 'Invite-only — sign in required to keep this diary.',
    };
    const result = accountLiteCopyIsHonest(poisoned);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.key, 'deferAccountBody');
    }
  });
});

describe('wiring (discover, do not skip)', () => {
  it('Welcome I-Day has no sign-in step — profile Continue finishes', () => {
    const src = read('src/page-components/WelcomePage.tsx');
    assert.doesNotMatch(src, /SignInPanel/, 'I-Day must not mount SignInPanel (F-017)');
    assert.doesNotMatch(
      src,
      /setStep\(\s*['"]signin['"]\s*\)/,
      'profile Continue must not open a sign-in wall'
    );
    assert.match(
      src,
      /const STEP_ORDER: Step\[\] = \['welcome', 'profile'\]/,
      'I-Day is two steps: briefing then gear — account is later'
    );
    const next = src.slice(src.indexOf('const handleProfileNext'), src.indexOf('const stepIndex'));
    assert.match(next, /finish\(\)/, 'profile Continue must finish I-Day');
    assert.doesNotMatch(
      src,
      /generate\s*\(/,
      'F-028: Welcome must not force a weekly plan'
    );
  });

  it('Active never mounts SignInPrompt during a live session', () => {
    const src = read('src/page-components/ActiveWorkoutPage.tsx');
    assert.match(src, /mayShowActiveSignInPrompt/);
    assert.match(src, /hasActiveWorkout:\s*!!activeWorkout/);
    assert.match(src, /mayOfferDeviceLink/);
  });

  it('Today header uses account-lite chrome, not a first-session sign-in link', () => {
    const header = read('src/components/today/TodayPageHeader.tsx');
    assert.match(header, /accountLiteHeroChrome/);
    assert.match(header, /ACCOUNT_LITE_COPY\.localBadge/);
    assert.match(header, /AccountLiteStrip/);
    assert.match(header, /useDismissed\(STORAGE_KEYS\.accountLiteDismissed\)/);
    assert.doesNotMatch(
      header,
      /href="\/profile"[\s\S]*signInOptional/,
      'first-session Today must not link Sign in optional as the hero account wall'
    );
  });

  it('DayReviewOptIn defers OS permission until after first log', () => {
    const src = read('src/components/today/DayReviewOptIn.tsx');
    assert.match(src, /mayRequestOsPermission/);
    assert.match(src, /readWorkoutHistoryFromStorage/);
  });

  it('dismiss key is registered once', () => {
    assert.equal(STORAGE_KEYS.accountLiteDismissed, ACCOUNT_LITE_DISMISS_KEY);
  });

  it('keeps EN core aligned with ACCOUNT_LITE_COPY', () => {
    const core = read('src/i18n/coreLocales.ts');
    const boot = read('src/i18n/bootstrapResources.ts');
    for (const [key, value] of [
      ['f017LocalBadge', ACCOUNT_LITE_COPY.localBadge],
      ['f017DeferAccountTitle', ACCOUNT_LITE_COPY.deferAccountTitle],
      ['f017DeferAccountBody', ACCOUNT_LITE_COPY.deferAccountBody],
      ['f017CreateAccount', ACCOUNT_LITE_COPY.createAccount],
      ['f017NotNow', ACCOUNT_LITE_COPY.notNow],
    ] as const) {
      const assign = new RegExp(
        `${key}:\\s*'${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`
      );
      assert.match(core, assign, `coreLocales missing ${key}`);
      assert.match(boot, assign, `bootstrap missing ${key}`);
    }
  });
});
