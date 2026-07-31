/**
 * The one string that marks a `leads` row as feedback rather than a signup.
 *
 * `.214` — feedback and waitlist signups share the `leads` table, and the only
 * thing separating them is a tag. Three places need to agree on it: the form
 * that writes it, the confirmation email that must **not** fire for it, and the
 * founder read path that filters on it. A literal in three files is a literal
 * that drifts, and when it drifts here the failure is silent — the panel simply
 * shows nothing, which looks identical to "no one has written in".
 *
 * ## Why one tag and not two
 *
 * `FeedbackPage` used to set `package_interest: 'beta-feedback'` **and**
 * `source: 'feedback-page'`, which reads as a two-level taxonomy. It never was:
 * `submitLead` (`src/lib/supabase.ts:303,310-311`) computes
 * `source = lead.source || lead.package_interest` and then writes that single
 * value to *both* columns, so `'beta-feedback'` was discarded on every
 * submission ever made. The row has always said `feedback-page`.
 *
 * Rather than repair the two-tag design, this makes the one that exists
 * explicit — the reader can only filter on what is actually stored.
 */

/** Written to `leads.package_interest` (and `source`) for every feedback note. */
export const FEEDBACK_SOURCE_TAG = 'feedback-page';

/** True when a `leads` row is a feedback note rather than a waitlist signup. */
export function isFeedbackSource(source: string | null | undefined): boolean {
  return source === FEEDBACK_SOURCE_TAG;
}

/**
 * One feedback note as the founder panel receives it.
 *
 * Lives here rather than in the route so a client component can import the type
 * without reaching into a `server-only` module graph. `import type` is erased at
 * compile time either way, but the import graph is what `.209` was about — the
 * habit is worth keeping even where it happens to be free.
 */
export interface FeedbackNote {
  /** ISO timestamp from `leads.created_at`. */
  at: string;
  /** Whatever the sender typed, or the form's default. May be empty. */
  name: string;
  email: string;
  /** The prose. This is the field nothing read for the whole life of the form. */
  text: string;
}
