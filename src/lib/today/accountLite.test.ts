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
  it('never mounts on Train — live session or empty Start shell', () => {
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
    assert.equal(
      mayShowActiveSignInPrompt({
        signedIn: false,
        completedWorkouts: 0,
        dismissed: false,
        hasActiveWorkout: false,
      }),
      false
    );
    // Empty Active after first workout: Start is still the only boss.
    // Keep this diary? lives on Today, not next to Start.
    assert.equal(
      mayShowActiveSignInPrompt({
        signedIn: false,
        completedWorkouts: 1,
        dismissed: false,
        hasActiveWorkout: false,
      }),
      false
    );
  });

  it('Not now does not re-prompt on Active (mid-session or empty shell)', () => {
    assert.equal(
      mayShowActiveSignInPrompt({
        signedIn: false,
        completedWorkouts: 3,
        dismissed: true,
        hasActiveWorkout: false,
      }),
      false
    );
    assert.equal(
      mayShowActiveSignInPrompt({
        signedIn: false,
        completedWorkouts: 3,
        dismissed: true,
        hasActiveWorkout: true,
      }),
      false
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

  it('Active never mounts SignInPrompt (Start / Log set stay the boss)', () => {
    const src = read('src/page-components/ActiveWorkoutPage.tsx');
    assert.doesNotMatch(
      src,
      /SignInPrompt/,
      'F-017: Train must not park account chrome next to Start or Log set'
    );
    assert.doesNotMatch(src, /mayShowActiveSignInPrompt/);
    assert.match(src, /mayOfferDeviceLink/);
    const empty = read('src/components/workout/ActiveEmptyState.tsx');
    assert.doesNotMatch(empty, /SignInPrompt|AccountLiteStrip|Keep this diary/);
  });

  it('F-030 reuses localFirstRestGuard — no guest-mode fork of logSet/rest', () => {
    const rest = read('src/lib/localFirstRestGuard.test.ts');
    assert.match(rest, /handleLogSet/);
    assert.match(rest, /startRestTimer/);
    assert.match(rest, /getUser/);
    assert.doesNotMatch(
      read('src/lib/today/accountLite.ts'),
      /getUser|flushOutbox|guestMode/,
      'account-lite is chrome policy, not a second persistence stack'
    );
    const logSet = read('src/page-components/ActiveWorkoutPage.tsx').match(
      /const handleLogSet[\s\S]*?startRestTimer\(rest\.restSeconds\);[\s\S]*?\n {2}\};/
    );
    assert.ok(logSet, 'handleLogSet rest block missing');
    assert.doesNotMatch(logSet[0], /\bawait\b/);
    assert.doesNotMatch(logSet[0], /getUser|flushOutbox/);
  });

  it('Today header uses account-lite chrome, not a first-session sign-in link', () => {
    const header = read('src/components/today/TodayPageHeader.tsx');
    assert.match(header, /accountLiteHeroChrome/);
    assert.match(header, /ACCOUNT_LITE_COPY\.localBadge/);
    assert.match(header, /AccountLiteStrip/);
    assert.match(header, /useDismissed\(STORAGE_KEYS\.accountLiteDismissed\)/);
    assert.match(
      header,
      /completedSessions < 1/,
      'first session must not call getUser'
    );
    assert.match(
      header,
      /getUser\(\)[\s\S]*?\.catch\(/,
      'post-workout session lookup must fail open'
    );
    assert.doesNotMatch(
      header,
      /href="\/profile"[\s\S]*signInOptional/,
      'first-session Today must not link Sign in optional as the hero account wall'
    );
  });

  it('DayReviewOptIn and WindDownOptIn defer OS permission until after first log', () => {
    const day = read('src/components/today/DayReviewOptIn.tsx');
    assert.match(day, /mayRequestOsPermission/);
    assert.match(day, /readWorkoutHistoryFromStorage/);
    const wind = read('src/components/workout/WindDownOptIn.tsx');
    assert.match(wind, /mayRequestOsPermission/);
    assert.match(wind, /readWorkoutHistoryFromStorage/);
  });

  it('header Sign in chip waits for first workout and Not now', () => {
    const chip = read('src/components/layout/HeaderAuthChip.tsx');
    assert.match(chip, /accountLiteHeroChrome/);
    assert.match(chip, /completedWorkouts < 1/);
    assert.match(chip, /readWorkoutHistoryFromStorage/);
    assert.doesNotMatch(
      chip,
      /if \(!ready \|\| email\) return null;\n\n  return \(/,
      'unsigned first session must not paint Sign in in the app header'
    );
  });

  it('dismiss key is registered once', () => {
    assert.equal(STORAGE_KEYS.accountLiteDismissed, ACCOUNT_LITE_DISMISS_KEY);
  });

  it('gate + public status use Free beta / Enter with code / Get notified', () => {
    const gateEn = read('src/i18n/gateLocales.ts');
    const enBlock = gateEn.slice(
      gateEn.indexOf('const GATE_EN'),
      gateEn.indexOf('const GATE_ES')
    );
    assert.match(enBlock, /gateEyebrow:\s*'Free beta'/);
    assert.match(enBlock, /gateAccessSubmit:\s*'Enter with code'/);
    assert.match(enBlock, /gateWaitlistSubmit:\s*'Get notified'/);
    assert.match(enBlock, /gateWaitlistTitle:\s*'Get notified'/);
    assert.doesNotMatch(enBlock, /invite-?only/i);
    assert.doesNotMatch(enBlock, /get an invite/i);
    assert.doesNotMatch(enBlock, /private beta/i);
    assert.doesNotMatch(enBlock, /open beta/i);

    const teaser = read('app/private/PrivateTeaserClient.tsx');
    assert.match(teaser, /defaultValue:\s*'Free beta'/);
    assert.match(teaser, /defaultValue:\s*'Enter with code'/);
    assert.match(teaser, /defaultValue:\s*'Get notified'/);
    assert.doesNotMatch(teaser, /Private beta in progress/);
    assert.doesNotMatch(teaser, /Enter the beta/);

    const status = read('src/i18n/firstStepsLocales.ts');
    const statusEn = status.slice(
      status.indexOf('publicStatusOpenBeta'),
      status.indexOf('};', status.indexOf('publicStatusOpenBeta'))
    );
    assert.match(statusEn, /Free beta/);
    assert.doesNotMatch(statusEn, /invite-?only/i);

    const bar = read('src/components/public/PublicStatusBar.tsx');
    assert.match(bar, /Free beta/);
    assert.doesNotMatch(bar, /Invite-only/);
    const nav = read('src/components/marketing/MarketingNav.tsx');
    assert.match(nav, /Free beta/);
    assert.doesNotMatch(nav, /Invite-only/);
    const appHeader = read('src/components/layout/AppHeader.tsx');
    assert.match(appHeader, /defaultValue: 'Free beta'/);
    assert.doesNotMatch(appHeader, /Open beta/);
    const navPack = read('src/i18n/navLocales.ts');
    const navEn = navPack.slice(
      navPack.indexOf('const en: NavStrings'),
      navPack.indexOf('const', navPack.indexOf('const en: NavStrings') + 1)
    );
    assert.match(navEn, /navOpenBeta: 'Free beta'/);
    assert.doesNotMatch(navEn, /Open beta/);
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
