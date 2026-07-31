/**
 * The other end of the feedback pipe.
 *
 * `.179` made sure a feedback note **arrives** — it rides the durable outbox,
 * retries offline, and has tests. It lands in `public.leads`. And then nothing
 * in this repo ever read it back: `betaMetricsServer.ts:98` selects
 * `package_interest` and nothing else, so the founder panel showed one line
 * (`feedback-page  7`) while the rating, the testimonial and the "why I almost
 * quit" prose sat in a column no code has ever named.
 *
 * This is the read path. Founder-only, service-role, newest first.
 *
 * `leads` has RLS enabled and **zero policies** (`20260705_leads_api_only.sql`
 * dropped the last one), so there is no client-side read to build on and this
 * route is the only way the prose can reach a human.
 *
 * `.216` moved the query itself into `feedbackServer.ts`: the Monday digest now
 * needs the same rows, and a panel and a digest that disagree about what the
 * inbox holds is a defect neither of them could show you.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { authorizeBetaAdmin } from '@/lib/api/betaAdminAuth';
import { readFeedbackNotes } from '@/lib/feedbackServer';

export const dynamic = 'force-dynamic';

/**
 * Enough to read a week of a small beta in one sitting, bounded so a runaway
 * spam run cannot turn the founder's own panel into a denial of service.
 */
const MAX_NOTES = 100;

export const GET = withApiLogging('beta/feedback', async (request: NextRequest) => {
  if (!(await authorizeBetaAdmin(request))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const result = await readFeedbackNotes(MAX_NOTES);

  if (result.error === 'no_service_role') {
    /*
     * Distinguishable from "no feedback yet", deliberately. An empty list on a
     * misconfigured server would read as silence from users, which is the most
     * expensive wrong conclusion this panel could invite.
     */
    return NextResponse.json(
      { ok: false, error: 'Supabase service role not configured' },
      { status: 503 }
    );
  }
  if (result.error) {
    return NextResponse.json({ ok: false, error: 'query_failed' }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    notes: result.notes ?? [],
    truncated: result.truncated,
  });
});
