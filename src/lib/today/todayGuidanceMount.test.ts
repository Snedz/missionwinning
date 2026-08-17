/**
 * Today is Summary. First Steps is a tour card. Start is the instruction.
 *
 * `.204` / `.240` put the card on both shells so the checklist could not hide
 * on the lean path. That fixed a mount-site bug and left a tour on the first
 * screen. Summary v1 (`.890`) turns the predicate off. The checklist still
 * lives in More (`firstStepsReachable`). Re-entry stays the quiet line.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { JourneyPhase } from '@/lib/missionJourney';
import { firstStepsMayMount, reentryCardMayMount } from '@/lib/today/todayGuidanceMount';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const PHASES: JourneyPhase[] = ['i-day', 'basic', 'readiness', 'commissioned'];

test('the first-steps card never mounts on Today', () => {
  for (const phase of PHASES) {
    assert.equal(
      firstStepsMayMount({ phase, dismissed: false }),
      false,
      `phase ${phase}: Start is the instruction; First Steps is a tour`
    );
  }
});

/**
 * A dismissed card must not be *declared*, not merely render nothing.
 *
 * `planTodayBlocks` computes `room = max - pinned.length` from the candidate
 * list, so a pinned block whose component returns `null` still costs the screen
 * a top-level slot — permanently, since the dismissal is permanent. The card
 * hiding itself was never enough; the budget never saw it hide.
 */
test('a dismissed first-steps card is never declared, in any phase', () => {
  for (const phase of PHASES) {
    assert.equal(
      firstStepsMayMount({ phase, dismissed: true }),
      false,
      `phase ${phase}: a dismissed card that still mounts spends a pinned Today slot on nothing`
    );
  }
});

test('re-entry is answered over both inputs, not just the phase', () => {
  for (const phase of PHASES) {
    assert.equal(
      reentryCardMayMount({ phase, show: false }),
      false,
      `phase ${phase}: no gap means no card, whatever the phase says`
    );
  }
  for (const phase of PHASES) {
    assert.equal(
      reentryCardMayMount({ phase, show: true }),
      phase !== 'i-day',
      `phase ${phase}: a real gap should surface everywhere except in-processing`
    );
  }
});

test('an open session is not a return', () => {
  assert.equal(
    reentryCardMayMount({ phase: 'basic', show: true, sessionOpen: true }),
    false,
    'the quiet line must not claim days off while a workout is already running'
  );
});

/**
 * The bug was a mount site, so the guard has to read mount sites. A rule that
 * only tested the predicate would have passed on the broken build — the
 * predicate did not exist, and both shells were the problem.
 */
const SHELLS = ['src/page-components/HomeTodayLean.tsx', 'src/page-components/HomeTodayDashboard.tsx'];

test('both Today shells keep the quiet line and drop First Steps', () => {
  for (const shell of SHELLS) {
    const src = read(shell);
    assert.doesNotMatch(
      src,
      /<FirstStepsCard\b/,
      `${shell} still mounts <FirstStepsCard> — Today is Summary, not a tour`
    );
    assert.match(
      src,
      /reentry=\{/,
      `${shell} must pass reentry into JourneyHero so the 0.1 quiet line reaches both shells`
    );
  }
  const hero = read('src/components/journey/JourneyHero.tsx');
  assert.match(hero, /<TodayReentryCard\b/, 'the Start field renders the one missed-day line');
});

/**
 * And it has to be the *shared* decision. Two shells each with their own
 * inline phase test is the same defect one refactor later, which is the whole
 * argument `dayReviewMount.ts` was written to make.
 *
 * Lean calls the helpers at the mount site. Dashboard routes guidance through
 * `buildTodayCandidates` (the pure ladder that already calls both helpers).
 */
test('both shells ask the shared re-entry rule rather than re-deriving it', () => {
  for (const shell of SHELLS) {
    const src = read(shell);
    const viaLadder = /buildTodayCandidates\(/.test(src);
    const viaReentry = /reentryCardMayMount\(/.test(src);
    assert.ok(
      viaReentry || viaLadder,
      `${shell} must gate re-entry on the shared rule (reentryCardMayMount or buildTodayCandidates)`
    );
  }
});

test('both shells hide the quiet line while a workout is open', () => {
  const lean = read('src/page-components/HomeTodayLean.tsx');
  const dash = read('src/page-components/HomeTodayDashboard.tsx');
  assert.match(lean, /sessionOpen:\s*hasActiveWorkout/);
  assert.match(dash, /sessionOpen:\s*!!activeWorkout/);
  const hero = read('src/components/journey/JourneyHero.tsx');
  assert.match(hero, /reentry\?\.show && !activeWorkout/);
});
