import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { LOCAL_FIRST_COPY, localFirstCopyIsHonest } from '@/lib/localFirstCopy';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

describe('localFirstCopy', () => {
  it('rejects cloud-required framing in every constant', () => {
    const result = localFirstCopyIsHonest();
    assert.equal(result.ok, true, JSON.stringify(result));
  });

  it('keeps Active / Today device-first anchors', () => {
    assert.match(LOCAL_FIRST_COPY.activeSignInTitle, /this device/i);
    assert.match(LOCAL_FIRST_COPY.activeSignInDesc, /offline/i);
    assert.match(LOCAL_FIRST_COPY.activeSignInDesc, /only if/i);
    assert.match(LOCAL_FIRST_COPY.todayBackupWhenOnline, /this device/i);
    assert.doesNotMatch(LOCAL_FIRST_COPY.todayBackupWhenOnline, /cloud sync on/i);
    assert.match(LOCAL_FIRST_COPY.todayPillarWinEmpty, /this device/i);
    assert.doesNotMatch(LOCAL_FIRST_COPY.todayPillarWinEmpty, /cloud/i);
    assert.match(LOCAL_FIRST_COPY.activeNoWorkoutDesc, /this device/i);
  });

  it('fails closed when a mutant reintroduces cloud-as-required copy', () => {
    const poisoned = {
      ...LOCAL_FIRST_COPY,
      activeSignInDesc: "Workouts auto-save to the cloud when you're signed in.",
    };
    const result = localFirstCopyIsHonest(poisoned);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.key, 'activeSignInDesc');
    }
  });

  it('wires Active SignInPrompt + Today header/empty to the constants', () => {
    const activePage = read('src/page-components/ActiveWorkoutPage.tsx');
    assert.match(activePage, /LOCAL_FIRST_COPY\.activeSignInTitle/);
    assert.match(activePage, /LOCAL_FIRST_COPY\.activeSignInDesc/);
    assert.doesNotMatch(activePage, /auto-save to the cloud/i);

    const signIn = read('src/components/auth/SignInPrompt.tsx');
    assert.match(signIn, /title\?:/);

    const header = read('src/components/today/TodayPageHeader.tsx');
    assert.match(header, /LOCAL_FIRST_COPY\.todaySignInOptional/);
    assert.match(header, /LOCAL_FIRST_COPY\.todayBackupWhenOnline/);
    assert.doesNotMatch(header, /Cloud sync on/);

    const pillar = read('src/components/today/TodayProgressSection.tsx');
    assert.match(pillar, /LOCAL_FIRST_COPY\.todayPillarWinEmpty/);

    const empty = read('src/components/workout/ActiveEmptyState.tsx');
    assert.match(empty, /LOCAL_FIRST_COPY\.activeNoWorkout/);
    assert.match(empty, /LOCAL_FIRST_COPY\.activeNoWorkoutDesc/);
  });

  /**
   * `.746` — CN/HK rated the offline *claim* 3.97 and disbelieved the
   * *implementation* ("forced cloud sync / data opacity"). The fix is not a
   * louder adjective: it is naming the mechanism on the two screens a sceptic
   * sees first, because "offline" is a word an app with forced sync also prints.
   */
  it('states the mechanism, not the adjective, on both public entries', () => {
    for (const key of ['gateLocalFirst', 'welcomeLocalFirst'] as const) {
      const copy = LOCAL_FIRST_COPY[key];
      assert.match(copy, /no account/i, `${key} must say an account is not needed`);
      assert.match(copy, /this device|your device/i, `${key} must say where sets go`);
      assert.match(copy, /uploaded/i, `${key} must speak to upload, the actual suspicion`);
      assert.match(copy, /unless you sign in/i, `${key} must name the one condition`);
      // A mechanism sentence that hedges into "may" or "should" is an adjective again.
      assert.doesNotMatch(copy, /\b(?:may|should|generally|typically)\b/i, key);
    }
  });

  it('wires both public entries to the constants', () => {
    // The gate floors every string from GATE_EN, so the constant lands there.
    const gate = read('src/i18n/gateEn.ts');
    assert.match(gate, /gateLocalFirst: LOCAL_FIRST_COPY\.gateLocalFirst/);
    const teaser = read('app/private/PrivateTeaserClient.tsx');
    assert.match(teaser, /g\('gateLocalFirst'\)/, 'the gate poster must render it');

    const welcome = read('src/page-components/WelcomePage.tsx');
    assert.match(welcome, /LOCAL_FIRST_COPY\.welcomeLocalFirst/);
    const welcomePack = read('src/i18n/welcomeLocales.ts');
    assert.match(
      welcomePack,
      quoteAssign('welcomeSubtitleBrief', LOCAL_FIRST_COPY.welcomeLocalFirst),
      'I-Day step one paints the pack value — it must be the same sentence'
    );
  });

  it('keeps EN packs aligned with LOCAL_FIRST_COPY for hydrated keys', () => {
    const core = read('src/i18n/coreLocales.ts');
    assert.match(core, quoteAssign('cloudSyncOn', LOCAL_FIRST_COPY.todayBackupWhenOnline));
    assert.match(core, quoteAssign('signInOptional', LOCAL_FIRST_COPY.todaySignInOptional));

    const active = read('src/i18n/activeWorkoutLocales.ts');
    assert.match(active, quoteAssign('activeNoWorkout', LOCAL_FIRST_COPY.activeNoWorkout));
    assert.match(active, quoteAssign('activeNoWorkoutDesc', LOCAL_FIRST_COPY.activeNoWorkoutDesc));
    assert.match(active, quoteAssign('activeSignInTitle', LOCAL_FIRST_COPY.activeSignInTitle));
    assert.match(active, quoteAssign('activeSignInDesc', LOCAL_FIRST_COPY.activeSignInDesc));

    const today = read('src/i18n/todayLocales.ts');
    assert.match(today, quoteAssign('todayPillarWinEmpty', LOCAL_FIRST_COPY.todayPillarWinEmpty));
  });
});

function escapeForRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Match `key: 'value'` or multiline `key:\n    'value'`. */
function quoteAssign(key: string, value: string): RegExp {
  return new RegExp(`${key}:\\s*'${escapeForRegex(value)}'`);
}
