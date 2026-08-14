/**
 * The ritual has to be performable, not just documented.
 *
 * `POST_LAUNCH_CADENCE` §3: *"Talk to 2 users (or read 2 feedback emails) → fix
 * the #1 confusion within 48h — ship, tell the tester."* Three PRs have now
 * touched that sentence's dependencies:
 *
 *   - `.214` gave the notes a reader (nothing had ever selected `leads.goals`);
 *   - `.215` gave athletes a way to write them;
 *   - `.216` — this one — makes the digest carry them, and makes "the #1
 *     confusion" identifiable by tracking what is **new**.
 *
 * The defect class being held shut is the one this whole wave keeps finding: an
 * instruction, a count, or a section that **looks** like it reports something
 * and reports nothing. The digest line telling the founder to read feedback
 * emails that have never been sent is the purest example the repo has produced.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  DIGEST_FEEDBACK_LIMIT,
  composeFounderDigest,
  formatDigestNote,
  type FounderDigestData,
} from '@/lib/founderDigestCompose';
import { unreadCount } from '@/lib/feedbackUnread';
import type { FeedbackNote } from '@/lib/feedbackSource';
import {
  canAssignDest,
  classifyFeedbackNote,
  formatFeedbackTicket,
  ticketContainsEmail,
} from '@/lib/feedbackTriage';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

const SERVER = 'src/lib/founderDigestServer.ts';
const READ_ROUTE = 'app/api/beta/feedback/route.ts';
const READER = 'src/lib/feedbackServer.ts';
const PANEL = 'src/components/beta/BetaAdminPanel.tsx';

function note(at: string, text: string, email = ''): FeedbackNote {
  return { at, text, email, name: '' };
}

const BASE: Omit<FounderDigestData, 'feedback'> = {
  generatedAt: '2026-08-03T09:00:00.000Z',
  funnel: null,
  retention: null,
  referrals: null,
};

/* ── The instruction that pointed at nothing ─────────────────────────────── */

test('the digest no longer sends the founder to an inbox that does not exist', () => {
  const { text } = composeFounderDigest({ ...BASE, feedback: [] });

  /*
   * The exact string that shipped for the life of this file. No feedback email
   * has ever been sent to anyone — `emailServer` has no feedback template and
   * `RESEND_API_KEY` is unset — so this was an unfollowable instruction issued
   * every Monday. It survived because the digest cannot send either: nobody was
   * reading the thing that was wrong.
   */
  assert.doesNotMatch(
    text,
    /read 2 feedback emails/i,
    'no feedback email has ever existed; the notes are in `leads` and in the panel'
  );
  assert.match(
    text,
    /Profile → Beta admin/,
    'the replacement must name a place that actually holds the notes'
  );
});

test('the notes ride inline, not as a pointer', () => {
  const { text } = composeFounderDigest({
    ...BASE,
    feedback: [note('2026-08-02T10:00:00.000Z', 'the timer jumped mid-set', 'a@example.com')],
  });

  assert.match(text, /the timer jumped mid-set/, 'the prose itself must be in the digest');
  assert.match(text, /a@example\.com/, 'and who wrote it, so a reply is possible');
  assert.match(text, /2026-08-02/);
});

test('a broken read never prints as an empty inbox', () => {
  /*
   * The single most expensive wrong conclusion this digest can produce. "No
   * notes yet" tells the founder to go find users; "the read failed" tells them
   * to check a key. Those are opposite actions, and a null-to-empty collapse
   * silently picks the wrong one.
   */
  const broken = composeFounderDigest({ ...BASE, feedback: null }).text;
  assert.match(broken, /read failed/i);
  assert.doesNotMatch(broken, /No notes yet/i);

  const empty = composeFounderDigest({ ...BASE, feedback: [] }).text;
  assert.match(empty, /No notes yet/i);
  assert.match(empty, /REDTEAM A5/, 'an empty inbox IS the beta gate, not a quiet week');
  assert.doesNotMatch(empty, /read failed/i);
});

test('the digest stays readable and says what it left out', () => {
  const many = Array.from({ length: DIGEST_FEEDBACK_LIMIT + 3 }, (_, i) =>
    note(`2026-08-0${(i % 9) + 1}T10:00:00.000Z`, `note ${i}`)
  );
  const { text } = composeFounderDigest({ ...BASE, feedback: many });

  assert.match(text, /\+3 more/, 'silently truncating reads as "that is all of it"');
  assert.doesNotMatch(text, /note 7/, `only the newest ${DIGEST_FEEDBACK_LIMIT} ride inline`);
});

test('a multi-line note keeps its lines', () => {
  // The `/feedback` form packs four answers into one newline-separated field and
  // `.215`'s sheet appends a context block. Flattening runs it all together.
  const lines = formatDigestNote(note('2026-08-02T10:00:00.000Z', 'first\nsecond'));
  assert.ok(
    lines.some((l) => l.trimEnd().endsWith('first')) &&
      lines.some((l) => l.trimEnd().endsWith('second')),
    'both lines must survive as separate lines'
  );
});

/* ── One definition of the inbox ─────────────────────────────────────────── */

test('the panel and the digest read through the same query', () => {
  /*
   * `.214` put the select inline in the route; `.216` needs the same rows in the
   * digest. Two copies of a filter is two chances to drift, and drift here is
   * silent — the wrong tag returns zero rows, which reads as "nobody wrote in".
   */
  const reader = stripComments(read(READER));
  assert.match(reader, /\.select\([^)]*goals/, 'the shared reader must select the prose');
  assert.match(reader, /FEEDBACK_SOURCE_TAG/, 'and filter on the one shared tag');
  assert.match(reader, /ascending:\s*false/);

  for (const [file, label] of [
    [READ_ROUTE, 'the founder panel route'],
    [SERVER, 'the digest collector'],
  ] as const) {
    const src = stripComments(read(file));
    assert.match(src, /readFeedbackNotes\(/, `${label} must go through the shared reader`);
    assert.doesNotMatch(
      src,
      /\.from\('leads'\)/,
      `${label} must not re-implement the query — that is the second definition`
    );
  }
});

test('the digest reads past what it prints', () => {
  /*
   * "+N more" is only truthful if the fetch went beyond the print limit. Fetching
   * exactly DIGEST_FEEDBACK_LIMIT would make the line permanently absent — a
   * report of "that is all of it" that never measured anything.
   */
  const server = stripComments(read(SERVER));
  const match = server.match(/FEEDBACK_FETCH_LIMIT\s*=\s*(\d+)/);
  assert.ok(match, 'the digest fetch limit must be a named constant');
  assert.ok(
    Number(match[1]) > DIGEST_FEEDBACK_LIMIT,
    `fetch limit ${match[1]} must exceed the print limit ${DIGEST_FEEDBACK_LIMIT}, or "+N more" can never fire`
  );
});

/* ── Unread is measured, not asserted ────────────────────────────────────── */

test('never having read the inbox means everything is unread', () => {
  const notes = [note('2026-08-02T10:00:00.000Z', 'a'), note('2026-08-01T10:00:00.000Z', 'b')];
  // Not zero. "0 new" over a full inbox on first open is the same class of lie
  // as a thank-you screen over a dropped submission.
  assert.equal(unreadCount(notes, null), 2);
  assert.equal(unreadCount(notes, 'not-a-date'), 2, 'a corrupt mark must over-report, never hide');
});

test('unread counts by timestamp, not by position', () => {
  const notes = [
    note('2026-08-03T10:00:00.000Z', 'new'),
    note('2026-08-02T10:00:00.000Z', 'seen'),
    note('2026-08-01T10:00:00.000Z', 'seen'),
  ];
  assert.equal(unreadCount(notes, '2026-08-02T10:00:00.000Z'), 1);
  assert.equal(unreadCount(notes, '2026-08-03T10:00:00.000Z'), 0);

  /*
   * The reason this is a timestamp and not a count. A count-based mark ("I had
   * read 3") reports zero new the moment one note arrives and one falls off the
   * 100-row cap — the length is unchanged and the new note is invisible.
   */
  const afterChurn = [note('2026-08-04T10:00:00.000Z', 'arrived'), notes[0], notes[1]];
  assert.equal(afterChurn.length, notes.length);
  assert.equal(unreadCount(afterChurn, '2026-08-03T10:00:00.000Z'), 1);
});

test('an unparseable note timestamp counts as unread', () => {
  // Erring toward "look at this" costs a glance. Erring the other way hides a
  // real note forever — nothing ever moves it back above the mark.
  assert.equal(unreadCount([note('', 'x')], '2026-08-03T10:00:00.000Z'), 1);
});

test('the panel shows the unread count and can clear it', () => {
  const panel = stripComments(read(PANEL));
  assert.match(panel, /unreadCount\(/, 'the panel must compute unread, not just list notes');
  assert.match(panel, /\{unread\}/, 'and render it');
  assert.match(panel, /markReviewed\(/, 'a count you cannot clear is a badge, not a marker');
});

test('marking read uses the newest note, not the wall clock', () => {
  /*
   * `markReviewed` stamps the newest loaded note. Using `Date.now()` would also
   * bury anything that arrived between the fetch and the click — a note the
   * founder provably has not seen, hidden by the act of dismissing a different
   * one.
   */
  const src = stripComments(read('src/lib/feedbackUnread.ts'));
  assert.doesNotMatch(
    src,
    /function markReviewed[\s\S]{0,400}?Date\.now\(\)/,
    'stamping "now" hides notes that landed between the fetch and the click'
  );
});

test('a timer jump on Train is a wedge bug eligible for craft, not voice', () => {
  const t = classifyFeedbackNote({
    text: 'Timer jumped mid-set outdoors.',
    screen: '/active',
  });
  assert.equal(t.class, 'wedge-bug');
  assert.deepEqual(t.destEligible, ['craft']);
  assert.equal(canAssignDest(t, 'voice'), false);
});

test('an iOS ask is off-horizon and cannot go to Grok', () => {
  const t = classifyFeedbackNote({ text: 'Please add an iOS app' });
  assert.equal(t.class, 'off-horizon');
  assert.equal(canAssignDest(t, 'voice'), false);
  assert.equal(canAssignDest(t, 'craft', { founderOverride: true }), false);
});

test('medical content cannot be sent to voice', () => {
  const t = classifyFeedbackNote({
    text: 'Coach told me to train through chest pain',
    screen: '/coach',
  });
  assert.equal(t.class, 'medical-legal');
  assert.equal(canAssignDest(t, 'voice', { founderOverride: true }), false);
});

test('a craft ticket never carries a raw email', () => {
  const ticket = formatFeedbackTicket({
    class: 'wedge-bug',
    dest: 'craft',
    text: 'Timer jumped. Reply you@example.com\n---\nScreen: /active\nBuild: x',
    screen: '/active',
    buildLabel: 'x',
    aligned: true,
  });
  assert.equal(ticketContainsEmail(ticket), false);
});

test('the rate path is the one writer', () => {
  const route = stripComments(read('app/api/beta/feedback/route.ts'));
  assert.match(route, /export const POST/, 'inbox without a rate path cannot close the loop');
  assert.match(route, /writeFeedbackReview/, 'POST must delegate, not insert');
  assert.match(route, /canAssignDest/, 'dest is a classified decision, not a free enum');
  assert.doesNotMatch(
    route,
    /\.from\(['"]feedback_reviews['"]\)/,
    'the route must not query reviews itself — that is a second writer'
  );
});
