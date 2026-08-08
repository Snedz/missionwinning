/**
 * A channel nobody can find is a channel nobody uses.
 *
 * `.214` fixed the far end: notes arriving in `leads.goals` now have a named
 * reader. This is the near end. Before `.215` the only way an athlete could
 * reach a human ran through `/feedback`, linked from `LegalNav` in muted 14px
 * between "Beta guide" and "Terms of Service" — and the form behind it required
 * an email address, in a product whose thesis is that logging needs no account.
 *
 * Two failure modes to hold shut, both of which this wave has already shipped
 * once each:
 *
 *   1. **Built but unreachable** — `.195`'s rule. A control rendered behind
 *      `showOwnerTools()` is a control for one person.
 *   2. **Reachable but vacuous** — `.204`, `.207`, `.210`, `.213`. Context
 *      attached to a note is worthless if it always says `/profile`; a
 *      character budget is worthless if the sheet does not enforce it.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  GOALS_COLUMN_LIMIT,
  MAX_NOTE_CHARS,
  canSendNote,
  composeFeedbackNote,
  remainingChars,
} from '@/lib/feedbackNote';
import { FEEDBACK_SOURCE_TAG } from '@/lib/feedbackSource';
import { TRAIL_MAX, previousScreen, pushScreen } from '@/lib/screenTrail';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

const PROFILE_PAGE = 'src/page-components/AccountPage.tsx';
const CARD = 'src/components/profile/ProfileFeedbackCard.tsx';
const SHEET = 'src/components/profile/FeedbackSheet.tsx';
const SHELL = 'src/components/layout/AppLayout.tsx';
const LEADS_ROUTE = 'app/api/leads/route.ts';
const SCHEMA = 'src/lib/apiSchemas.ts';

/* ── Reachability ────────────────────────────────────────────────────────── */

test('the feedback card is rendered, and not gated to the founder', () => {
  const page = stripComments(read(PROFILE_PAGE));
  assert.match(page, /<ProfileFeedbackCard\s*\/>/, 'the card must actually be mounted on Account');

  /*
   * `ownerTools &&` is how `BetaAdminPanel` and `ProfileOwnerTools` are gated on
   * this exact page, so the wrong spelling is one character away and would look
   * right in review. It would also be undetectable in testing: the founder is
   * the one account that always sees it.
   */
  assert.doesNotMatch(
    page,
    /ownerTools\s*&&\s*<ProfileFeedbackCard/,
    'a feedback button only the founder can reach collects feedback from the founder'
  );
  assert.doesNotMatch(
    page,
    /email\s*&&\s*<ProfileFeedbackCard/,
    'the anonymous athlete is the one this product is built for, and the one with no other ' +
      'way to reach us at all'
  );
});

test('the card opens the sheet', () => {
  const card = stripComments(read(CARD));
  assert.match(card, /<FeedbackSheet\b/, 'a button that opens nothing is the defect this fixes');
  assert.match(card, /min-h-\[44px\]/, 'the trigger is pressed one-handed in a gym');
});

/* ── The context that makes a note actionable ────────────────────────────── */

test('the shell records the screen trail', () => {
  /*
   * Without this call `previousScreen` is always null, every note reports
   * `Screen: /profile` and nothing else, and the whole context block is
   * decoration. The trail is written in one place; if that place stops calling,
   * nothing else in the app fails.
   */
  const shell = stripComments(read(SHELL));
  assert.match(shell, /recordScreen\(pathname\)/, 'the trail must be written on navigation');
});

test('the trail collapses repeats and stays bounded', () => {
  // Next re-runs effects on re-render as well as on navigation. Without the
  // collapse, sitting on Account flushes the previous route out of the trail.
  assert.deepEqual(pushScreen(['/log', '/profile'], '/profile'), ['/log', '/profile']);

  let trail: string[] = [];
  for (const route of ['/a', '/b', '/c', '/d', '/e', '/f']) trail = pushScreen(trail, route);
  assert.equal(trail.length, TRAIL_MAX);
  assert.equal(trail[trail.length - 1], '/f');
});

test('the previous screen is the last different one, or nothing', () => {
  assert.equal(previousScreen(['/log', '/active', '/profile'], '/profile'), '/active');
  // Not a fallback to `current`: a first visit that lands on Account genuinely
  // has no previous screen, and inventing one puts a wrong route on a bug report.
  assert.equal(previousScreen(['/profile'], '/profile'), null);
  assert.equal(previousScreen([], '/profile'), null);
});

test('the note carries where they were, and says so before sending', () => {
  const note = composeFeedbackNote({
    text: 'the timer jumped',
    screen: '/profile',
    previousScreen: '/active',
    buildLabel: '2026.07-unified.215',
    online: true,
  });

  assert.match(note.goals, /^the timer jumped/, 'the context is appended, never replaces the note');
  assert.match(note.goals, /Screen: \/profile/);
  assert.match(note.goals, /Came from: \/active/, '"the timer jumped" on /profile is unactionable');
  assert.match(note.goals, /Build: 2026\.07-unified\.215/, 'a note from three deploys ago reads as live');
  assert.doesNotMatch(note.goals, /Written offline/);
  assert.equal(note.source, FEEDBACK_SOURCE_TAG, 'the reader from `.214` filters on this');

  const offline = composeFeedbackNote({
    text: 'x',
    screen: '/active',
    previousScreen: null,
    buildLabel: 'b',
    online: false,
  });
  assert.match(offline.goals, /Written offline/);
  assert.doesNotMatch(
    offline.goals,
    /Came from/,
    'omitted rather than "none" — an absent line reads as "unknown", which is true'
  );

  // The sheet must disclose what it attaches. Silently shipping two routes and a
  // build label off a settings screen is the kind of thing you tell people about.
  const sheet = stripComments(read(SHEET));
  assert.match(sheet, /feedbackSheetContext/, 'the sheet must state what rides along');
});

/* ── Email stays optional, all the way down ──────────────────────────────── */

test('a note with no email is sendable end to end', () => {
  assert.equal(canSendNote('something broke'), true);
  assert.equal(canSendNote('   '), false, 'whitespace is not a report');

  const anon = composeFeedbackNote({
    text: 'something broke',
    screen: '/log',
    buildLabel: 'b',
    online: true,
  });
  assert.equal(anon.email, '');

  /*
   * Three layers had to agree, and each one of them rejected an empty address
   * before `.215`: the zod schema (`email()` required), the route (400 without
   * one), and `submitLead` (which would send `email: ''` into a column whose
   * own validator rejects it). Any one reverting puts the barrier back with the
   * sheet's copy still promising it is optional — the app lying about itself.
   */
  /*
   * Scoped to `leadsBodySchema`'s own body, not searched file-wide. `.215`'s
   * first draft of this guard matched `inviteCreateBodySchema.email` 150 lines
   * below — a different schema, already optional for its own reasons — and so
   * reported green with the lead schema reverted to required. Ninth vacuous
   * guard in this wave, found by the mutant it exists to catch.
   */
  const schema = stripComments(read(SCHEMA));
  const open = schema.indexOf('export const leadsBodySchema = z.object({');
  assert.ok(open !== -1, 'leadsBodySchema was renamed — re-read this guard');
  const body = schema.slice(open, schema.indexOf('export const', open + 1));
  assert.match(
    body,
    /email:\s*z\.string\(\)[^,\n]*\.optional\(\)/,
    'the lead schema must allow a note with no email'
  );

  const route = stripComments(read(LEADS_ROUTE));
  assert.match(
    route,
    /!email\s*&&\s*!isFeedbackSource\(source\)/,
    'the waitlist still needs an address; a bug report does not'
  );

  const sheet = stripComments(read(SHEET));
  assert.match(
    sheet,
    /disabled=\{!canSend\}/,
    'Send is gated on the note having content — and on nothing else'
  );
  assert.doesNotMatch(sheet, /disabled=\{[^}]*email/, 'requiring an email is the barrier this removes');
});

/* ── The length budget is enforced, not described ────────────────────────── */

test('a long note cannot be silently truncated', () => {
  /*
   * `leadsBodySchema` caps `goals` at 2000 and the route re-slices to 2000,
   * both silently — and the context block is packed into that same field. A
   * note written to the column limit would lose its tail, which is the one part
   * an athlete writes last and cares about most.
   */
  const worst = composeFeedbackNote({
    text: 'x'.repeat(MAX_NOTE_CHARS + 500),
    email: 'a@example.com',
    screen: '/exercises/muscle/chest',
    previousScreen: '/exercises/barbell-bench-press',
    buildLabel: '2026.07-unified.215-with-room-to-spare',
    online: false,
  });
  assert.ok(
    worst.goals.length <= GOALS_COLUMN_LIMIT,
    `worst-case note is ${worst.goals.length} chars, over the ${GOALS_COLUMN_LIMIT} column limit — ` +
      'the reserve is too small and the route will slice the context off'
  );

  assert.equal(remainingChars(''), MAX_NOTE_CHARS);
  assert.equal(remainingChars('abc'), MAX_NOTE_CHARS - 3);

  // Stopped at the keyboard with a visible countdown, not trimmed after the
  // fact. A silent truncation and a thank-you screen are the same defect.
  const sheet = stripComments(read(SHEET));
  assert.match(sheet, /maxLength=\{MAX_NOTE_CHARS\}/, 'the textarea must enforce the same budget');
  assert.match(sheet, /feedbackSheetRemaining/, 'and show what is left');
});

/* ── Transport ───────────────────────────────────────────────────────────── */

test('the sheet reuses the durable outbox rather than fetching', () => {
  /*
   * `.179` built retry, dedupe and offline delivery for exactly this payload,
   * and `app/offline/OfflineContent.tsx` already labels the kind "Feedback
   * note". A direct `fetch` here would drop every note written in a basement
   * gym — `.170`'s bug, for the fourth time.
   */
  const sheet = stripComments(read(SHEET));
  assert.match(sheet, /enqueueFeedback\(/, 'delivery must go through the outbox');
  assert.doesNotMatch(sheet, /fetch\(/, 'a second transport is a second thing to keep correct');
});
