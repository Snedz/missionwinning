/**
 * The card that tells you what to do must reach you before you have done it.
 *
 * `.204` — the first-run guidance card was mounted in `HomeTodayDashboard` only, and
 * `HomePage` routes `i-day` and `basic` to `HomeTodayLean`. A new tester is
 * `basic` until `detectBasicMilestones` sees all five pillars, so the banner
 * saying *"Finish I-Day, log one workout, then open Mission Coach"* appeared
 * only to athletes who had already done all of it.
 *
 * These are enumerations, not spot checks: the defect was never a wrong answer
 * for a phase, it was a phase nobody asked about.
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

test('the first-steps card reaches every phase that can act on it', () => {
  for (const phase of PHASES) {
    assert.equal(
      firstStepsMayMount({ phase, dismissed: false }),
      phase !== 'i-day',
      `phase ${phase}: the card instructs "finish I-Day, log one workout, open Coach" — ` +
        `it is useful to everyone past in-processing and to nobody still inside it`
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

test('both Today shells render the guidance cards', () => {
  for (const shell of SHELLS) {
    const src = read(shell);
    for (const card of ['FirstStepsCard', 'TodayReentryCard']) {
      assert.match(
        src,
        new RegExp(`<${card}\\b`),
        `${shell} never renders <${card}> — a card in one shell is a card half the athletes cannot see`
      );
    }
  }
});

/**
 * And it has to be the *shared* decision. Two shells each with their own
 * inline phase test is the same defect one refactor later, which is the whole
 * argument `dayReviewMount.ts` was written to make.
 *
 * Lean calls the helpers at the mount site. Dashboard routes guidance through
 * `buildTodayCandidates` (the pure ladder that already calls both helpers).
 */
test('both shells ask the shared mount rule rather than re-deriving it', () => {
  for (const shell of SHELLS) {
    const src = read(shell);
    const viaLadder = /buildTodayCandidates\(/.test(src);
    const viaFirst = /firstStepsMayMount\(/.test(src);
    const viaReentry = /reentryCardMayMount\(/.test(src);
    assert.ok(
      viaFirst || viaLadder,
      `${shell} must gate first-steps on the shared rule (firstStepsMayMount or buildTodayCandidates)`
    );
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
});
