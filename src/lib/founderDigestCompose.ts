/**
 * Pure founder digest composer (unit-testable, no server-only).
 *
 * ## `.216` — the section that told you to read something that did not exist
 *
 * Section 4 has always ended with *"Talk to 2 users or read 2 feedback emails"*.
 * That instruction was **unfollowable**: no feedback email has ever been sent to
 * anyone. Notes land in `public.leads`, and until `.214` nothing in the
 * repository read them back. So the digest's one qualitative action pointed at
 * an inbox that does not exist, every Monday, and the miss was invisible because
 * the digest cannot send either (see below) — nobody was reading the thing that
 * was wrong.
 *
 * The fix is not to reword it. It is to **put the notes in the digest**, so the
 * instruction and the material arrive together. A digest that says "go read your
 * feedback" is asking you to remember where it lives; a digest that carries the
 * prose is the ritual.
 *
 * ## What still does not work, stated rather than implied
 *
 * This digest **cannot be delivered today**. `weekly-digest/route.ts` returns
 * 503 without `CRON_SECRET` and skips without `FOUNDER_DIGEST_EMAIL`; both are
 * unset, and `CONTEXT.md`'s Status table records it. Section 5 is therefore
 * verified through `?dryRun=1`, and the **in-app panel is the path that works**.
 * Writing this section anyway is deliberate: the composer is pure and tested, so
 * the content is correct on the day the secrets are set rather than discovered
 * broken then.
 */

import type { FeedbackNote } from '@/lib/feedbackSource';
import { countFeedbackDests, formatDestCounts } from '@/lib/feedbackTriage';
import { localDateKeyFromIso } from '@/lib/time/localDate';

export type FounderDigestData = {
  generatedAt: string;
  funnel: {
    signedUpLast14Days: number;
    iDayComplete: number;
    basicComplete: number;
    commissioned: number;
  } | null;
  retention: { cohort_eligible: number; week4_retained: number } | null;
  referrals: {
    attributedTotal: number;
    topCodes: Array<{ code: string; count: number }>;
  } | null;
  /**
   * Newest-first feedback notes. `null` means the **read failed** — never
   * conflated with `[]`, which means the inbox is genuinely empty. Printing
   * "no feedback this week" over a broken service role would be the digest
   * confidently reporting the one thing the beta gate turns on.
   */
  feedback: FeedbackNote[] | null;
};

/**
 * How many notes ride inline.
 *
 * `POST_LAUNCH_CADENCE` §3 is *"read 2 users / fix the #1 confusion"*, not "read
 * everything" — so the digest carries a readable handful and says how many more
 * are waiting, rather than pasting a hundred notes into an email nobody finishes.
 */
export const DIGEST_FEEDBACK_LIMIT = 5;

/** Keep one note from turning the digest into a wall. Full text is in the panel. */
export const DIGEST_NOTE_CHARS = 400;

/**
 * One note as a digest block.
 *
 * Exported so the shape is assertable without regexing the whole email: `.196`
 * is the standing reminder that a rule spelled as a shape can only be checked as
 * one.
 */
export function formatDigestNote(note: FeedbackNote): string[] {
  const who = note.email || note.name || 'anonymous';
  const day = localDateKeyFromIso(note.at);
  const body = note.text.length > DIGEST_NOTE_CHARS
    ? `${note.text.slice(0, DIGEST_NOTE_CHARS)}…`
    : note.text;

  return [
    `  ${day} — ${who}`,
    // Indented rather than collapsed: the note already carries its own newlines
    // (the `/feedback` form packs four answers in, and `.215`'s sheet appends a
    // context block). Flattening them runs the whole thing into one paragraph.
    ...body.split('\n').map((line) => `    ${line}`),
  ];
}

export function composeFounderDigest(data: FounderDigestData): {
  subject: string;
  text: string;
} {
  const day = localDateKeyFromIso(data.generatedAt);
  const subject = `Mission Winning weekly — ${day}`;

  const lines: string[] = [
    `Mission Winning — weekly founder digest (${day})`,
    '',
    '1) Funnel / activation',
  ];

  if (data.funnel) {
    lines.push(
      `  Signed up last 14d: ${data.funnel.signedUpLast14Days}`,
      `  I-Day complete: ${data.funnel.iDayComplete}`,
      `  Basic complete: ${data.funnel.basicComplete}`,
      `  Commissioned: ${data.funnel.commissioned}`
    );
  } else {
    lines.push('  (funnel metrics unavailable — check service role / profiles)');
  }

  lines.push(
    '',
    '  Client I-Day steps (PostHog Insights — only if analytics allowed):',
    '  iday_started → iday_mission_accepted → iday_profile_completed → iday_completed → first_workout_completed'
  );

  lines.push('', '2) Week-4 retention (signed-in cloud loggers)');
  if (data.retention) {
    const rate =
      data.retention.cohort_eligible > 0
        ? (
            (100 * data.retention.week4_retained) /
            data.retention.cohort_eligible
          ).toFixed(1)
        : 'n/a';
    lines.push(
      `  Cohort eligible (≥28d since first workout): ${data.retention.cohort_eligible}`,
      `  Week-4 retained: ${data.retention.week4_retained} (${rate}%)`,
      '  Target: ≥10% across two cohorts'
    );
  } else {
    lines.push('  (retention RPC unavailable — apply migration 20260720_referrals)');
  }

  lines.push('', '3) Referrals (recognition only)');
  if (data.referrals) {
    lines.push(`  Attributed total: ${data.referrals.attributedTotal}`);
    if (data.referrals.topCodes.length) {
      lines.push('  Top codes:');
      for (const row of data.referrals.topCodes) {
        lines.push(`    ${row.code}: ${row.count}`);
      }
    } else {
      lines.push('  No attributed referrals yet');
    }
  } else {
    lines.push('  (referral stats unavailable)');
  }

  lines.push('', `4) What people wrote (newest ${DIGEST_FEEDBACK_LIMIT})`);
  if (data.feedback && data.feedback.length > 0) {
    lines.push(`  ${formatDestCounts(countFeedbackDests(data.feedback))}`);
  }
  if (data.feedback === null) {
    // Not "no feedback this week". A failed read and an empty inbox are opposite
    // facts, and only one of them means "go find users".
    lines.push('  (feedback read failed — check SUPABASE_SERVICE_ROLE_KEY)');
  } else if (data.feedback.length === 0) {
    lines.push(
      '  No notes yet.',
      '  Nobody has written in. That is the beta gate, not a quiet week —',
      '  REDTEAM A5 fires at 14 days with fewer than 10 users.'
    );
  } else {
    const shown = data.feedback.slice(0, DIGEST_FEEDBACK_LIMIT);
    for (const note of shown) lines.push(...formatDigestNote(note), '');
    if (data.feedback.length > shown.length) {
      lines.push(`  +${data.feedback.length - shown.length} more in Profile → Beta admin.`);
    }
  }

  lines.push(
    '',
    '5) Next actions (POST_LAUNCH_CADENCE)',
    /*
     * The old line read "Talk to 2 users or read 2 feedback emails" — an
     * instruction pointing at an inbox that has never existed. No feedback email
     * has ever been sent to anyone; the notes are in `leads`, and nothing read
     * them until `.214`. It now names the two places that actually hold them.
     */
    '  - Read the notes above; the full text is in Profile → Beta admin',
    '  - Fix the #1 confusion within 48h — ship it, then tell the tester',
    '  - If week-4 <10%: pause acquisition, run interviews',
    '',
    '— automated digest; FOUNDER_DIGEST_EMAIL'
  );

  return { subject, text: lines.join('\n') };
}
