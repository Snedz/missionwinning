import 'server-only';

/**
 * One definition of "read the feedback notes".
 *
 * `.216` — `.214` put this query inline in `app/api/beta/feedback/route.ts`, and
 * the digest now needs the same rows. Two callers means two chances for the
 * filter to drift, and drift here is **silent**: the wrong `package_interest`
 * returns zero rows, which is indistinguishable from nobody having written in.
 * That is the exact failure `feedbackSource.ts` was extracted to prevent one
 * layer up, so the query gets the same treatment (`.178` — one definition per
 * word).
 *
 * The panel and the digest must never disagree about what the inbox contains.
 */

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { FEEDBACK_SOURCE_TAG, type FeedbackNote } from '@/lib/feedbackSource';

/**
 * What a read returns.
 *
 * `notes: null` means the read **failed** — it is never conflated with `[]`.
 * Returning an empty list from a misconfigured server would invite the single
 * most expensive wrong conclusion available here: "nobody is writing in", from a
 * founder whose whole beta gate is "get 10 users to write in".
 */
export interface FeedbackReadResult {
  notes: FeedbackNote[] | null;
  /** Machine-readable reason when `notes` is null. */
  error: 'no_service_role' | 'query_failed' | null;
  /** True when the cap was hit and older notes exist beyond it. */
  truncated: boolean;
}

export async function readFeedbackNotes(limit: number): Promise<FeedbackReadResult> {
  const admin = getSupabaseAdmin();
  if (!admin) return { notes: null, error: 'no_service_role', truncated: false };

  const { data, error } = await admin
    .from('leads')
    .select('created_at, name, email, goals')
    .eq('package_interest', FEEDBACK_SOURCE_TAG)
    // Newest first: the weekly ritual in POST_LAUNCH_CADENCE is "read 2 and fix
    // the #1 confusion within 48h", not "read all of them".
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[feedback] read failed: %s', error.message);
    return { notes: null, error: 'query_failed', truncated: false };
  }

  const notes: FeedbackNote[] = (data ?? []).map((row) => ({
    at: String(row.created_at ?? ''),
    name: String(row.name ?? '').trim(),
    email: String(row.email ?? '').trim(),
    text: String(row.goals ?? '').trim(),
  }));

  return { notes, error: null, truncated: notes.length === limit };
}
