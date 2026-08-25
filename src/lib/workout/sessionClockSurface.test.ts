/**
 * Session clock pause lives on the live Train bar.
 * Today stays one Start. Rest + EMOM stay independent.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

const BANNED =
  /UnlockButton|isPremium|\/bundle|permalink|discord\.com|WeChat|four-scene|Force Sync|Session Expired|SignInPrompt/i;
const FEED = /likes|Top 8|Feed permalink|shame slope/i;
const SESSION_CLOCK =
  /sessionClock|session-clock-toggle|pauseSessionClock|toggleSessionClock|readSessionClock/;

describe('session clock pause surface lock (.1001)', () => {
  it('chrome is next to elapsed on the live session bar only', () => {
    const chrome = read('src/components/workout/ActiveSessionChrome.tsx');
    assert.match(chrome, /data-testid="session-clock-toggle"/);
    assert.match(chrome, /formatDuration\(elapsedSeconds\)/);
    assert.match(chrome, /onToggleSessionClock|sessionClockPaused/);
    const header = chrome.slice(chrome.indexOf('sticky top-0'), chrome.indexOf('{menuOpen &&'));
    assert.match(header, /session-clock-toggle/);
    assert.doesNotMatch(header, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(header, /text-\[30px\]/, 'poster numerals are on first paint');
    assert.doesNotMatch(chrome, BANNED);
    assert.doesNotMatch(chrome, FEED);

    const page = read('src/page-components/ActiveWorkoutPage.tsx');
    assert.match(page, /onToggleSessionClock|toggleSessionClock/);
    assert.doesNotMatch(page, /visibilitychange|pagehide|document\.hidden/);
  });

  it('Today stays one Start; lean and /private do not import the pause helper', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, SESSION_CLOCK);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, SESSION_CLOCK);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, SESSION_CLOCK);
    for (const rel of [
      'src/page-components/HomePage.tsx',
      'src/page-components/HomeTodayDashboard.tsx',
      'app/private/GateTeaser.tsx',
      'app/private/PrivateTeaserClient.tsx',
    ]) {
      if (!existsSync(path.join(root, rel))) continue;
      assert.doesNotMatch(read(rel), SESSION_CLOCK, `${rel} must not import session clock`);
    }
  });

  it('rest .995 and EMOM .988 stay independent — pause does not own them', () => {
    const helper = read('src/lib/workout/sessionClock.ts');
    assert.doesNotMatch(helper, /workClock|restTimer|RestTimerBar|set-row-work-clock/);
    const chrome = read('src/components/workout/ActiveSessionChrome.tsx');
    assert.doesNotMatch(chrome, /startWorkClock|stopWorkClock|stopRestTimer|startRestTimer/);
    const table = read('src/components/workout/SetLogTable.tsx');
    assert.match(table, /set-row-work-clock/);
    const dock = read('src/components/workout/RestTimerBar.tsx');
    assert.match(dock, /rest-clock|rest-skip/);
    assert.doesNotMatch(table, SESSION_CLOCK);
    assert.doesNotMatch(dock, SESSION_CLOCK);
  });

  it('Resume .963 stays leave/return of the live set — not this clock', () => {
    const resume = read('src/lib/workout/sessionResume.ts');
    assert.match(resume, /protectLiveStart|decideThisDeviceResume/);
    assert.doesNotMatch(resume, SESSION_CLOCK);
    const chrome = read('src/components/workout/ActiveSessionChrome.tsx');
    assert.doesNotMatch(chrome, /protectLiveStart|decideThisDeviceResume/);
  });

  it('first set stays ungated — pause never mounts a login wall', () => {
    for (const rel of [
      'src/lib/workout/sessionClock.ts',
      'src/components/workout/ActiveSessionChrome.tsx',
      'src/page-components/ActiveWorkoutPage.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
      assert.doesNotMatch(src, /UnlockButton|isPremium/, rel);
    }
  });
});
