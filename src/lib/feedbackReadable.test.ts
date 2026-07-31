/**
 * An inbound channel needs someone at the other end.
 *
 * `.214` — this is the wave's own defect class turned around. `.195` asked
 * *"was it built, and can anyone get to it?"* about things the app shows the
 * athlete. This asks the same question about things the athlete sends **us**.
 *
 * `.179` did the hard half properly: a feedback note rides the durable outbox,
 * retries offline, dedupes, and has tests. Its header calls these notes *"the
 * 'why I almost quit' interview record the beta exists to collect."* They land
 * in `public.leads`.
 *
 * And then nothing read them. `betaMetricsServer.ts` selects `package_interest`
 * and nothing else, so the founder panel displayed `feedback-page  7` while the
 * prose sat in a column no code in the repository has ever named. Meanwhile
 * `founderDigestCompose.ts` instructs the founder to *"read 2 feedback emails"*
 * that have never existed, and `app/api/leads/route.ts` replied to every
 * testimonial with *"You're on the Mission Winning list"* and an unsubscribe
 * link.
 *
 * The rule, stated so the next inbound channel cannot repeat it: **something
 * a user sends must have a named reader, and the path from arrival to a human
 * must be assertable.**
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { FEEDBACK_SOURCE_TAG, isFeedbackSource } from '@/lib/feedbackSource';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

const READ_ROUTE = 'app/api/beta/feedback/route.ts';
const PANEL = 'src/components/beta/BetaAdminPanel.tsx';
const FORM = 'src/page-components/FeedbackPage.tsx';
const LEADS = 'app/api/leads/route.ts';

test('the source tag has one definition, and writer and reader share it', () => {
  assert.equal(isFeedbackSource(FEEDBACK_SOURCE_TAG), true);
  assert.equal(isFeedbackSource('general'), false);
  assert.equal(isFeedbackSource(null), false);

  /*
   * The form must not hardcode the string. When writer and reader drift the
   * failure is silent — the panel simply shows nothing, which is
   * indistinguishable from "nobody has written in".
   */
  const form = stripComments(read(FORM));
  assert.match(form, /FEEDBACK_SOURCE_TAG/, 'the form must write the shared constant');
  assert.doesNotMatch(
    form,
    /source:\s*'feedback-page'/,
    'the tag is a literal here and a constant in the reader — that is two definitions'
  );
});

test('the prose column is actually selected somewhere', () => {
  const route = stripComments(read(READ_ROUTE));
  assert.match(
    route,
    /\.select\([^)]*goals/,
    'nothing selects `leads.goals`. That was true of the entire repository for the whole life ' +
      'of the feedback form: the note arrived and no human could read it.'
  );
  assert.match(route, /FEEDBACK_SOURCE_TAG/, 'the read must filter on the shared tag');
  assert.match(
    route,
    /ascending:\s*false/,
    'newest first — the weekly ritual is "read 2 and fix the #1 confusion", not "read all"'
  );
});

test('the read path is founder-only and fails closed', () => {
  const route = stripComments(read(READ_ROUTE));
  assert.match(
    route,
    /authorizeBetaAdmin\(request\)/,
    'feedback contains user email addresses and free text — it cannot be world-readable'
  );
  assert.match(route, /status:\s*403/, 'an unauthorised read must be refused, not empty');
});

/**
 * A misconfigured server must not look like silence from users. Returning `[]`
 * when the service role is missing would invite the single most expensive wrong
 * conclusion this panel can produce: "nobody is writing in".
 */
test('a broken read is distinguishable from an empty inbox', () => {
  const route = stripComments(read(READ_ROUTE));
  assert.match(route, /status:\s*503/, 'no service role must be an error, not an empty list');

  const panel = stripComments(read(PANEL));
  assert.match(panel, /feedbackError/, 'the panel must render the failure rather than an empty state');
  assert.match(
    panel,
    /feedback === null/,
    'null (not loaded / not permitted) and [] (genuinely none) must render differently'
  );
});

test('the panel reaches the endpoint and renders the text', () => {
  const panel = stripComments(read(PANEL));
  assert.match(panel, /fetch\('\/api\/beta\/feedback'/, 'the panel must actually call the read route');
  assert.match(
    panel,
    /note\.text/,
    'the panel must render the prose — showing only a count is the defect this fixes'
  );
  assert.match(
    panel,
    /whitespace-pre-wrap/,
    'the form packs four answers into one newline-separated field; collapsing them runs the ' +
      'whole note into one paragraph'
  );
});

/**
 * The trust half. A tester who writes a testimonial should not be enrolled in
 * the launch mailing list and told their "interest tag".
 */
test('a feedback note never triggers the waitlist confirmation', () => {
  const leads = stripComments(read(LEADS));
  const idx = leads.indexOf('maybeSendLeadConfirmation(email, source)');
  assert.ok(idx !== -1, 'the confirmation call moved — re-read this guard');

  const before = leads.slice(Math.max(0, idx - 400), idx);
  assert.match(
    before,
    /isFeedbackSource\(source\)/,
    'every insert fired the waitlist confirmation, so a beta tester who wrote a testimonial ' +
      'received "You\'re on the Mission Winning list" with an unsubscribe link'
  );
});
