/**
 * GET  — inbox + optional review join.
 * POST — founder rates dest (craft / voice / park / done).
 */

import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { resolveBetaAdminActor } from '@/lib/api/betaAdminAuth';
import { readFeedbackNotes, writeFeedbackReview } from '@/lib/feedbackServer';
import { parseFeedbackContext } from '@/lib/feedbackNote';
import { canAssignDest, classifyFeedbackNote, isFeedbackClass } from '@/lib/feedbackTriage';
import { parseJsonBody, feedbackReviewBodySchema } from '@/lib/apiSchemas';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';

export const dynamic = 'force-dynamic';

const MAX_NOTES = 100;

export const GET = withApiLogging('beta/feedback', async (request: NextRequest) => {
  if (!(await resolveBetaAdminActor(request))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const result = await readFeedbackNotes(MAX_NOTES);

  if (result.error === 'no_service_role') {
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
    persistAvailable: result.persistAvailable,
  });
});

export const POST = withApiLogging('beta/feedback/review', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request, 8 * 1024);
  if (oversized) return oversized;

  const actor = await resolveBetaAdminActor(request);
  if (!actor) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const limited = await rateLimitAsync(`feedback-review:${clientIp(request)}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = parseJsonBody(feedbackReviewBodySchema, raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const inbox = await readFeedbackNotes(MAX_NOTES);
  const note = inbox.notes?.find((n) => n.id === parsed.data.leadId);
  if (!note) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const ctx = parseFeedbackContext(note.text);
  const suggested = classifyFeedbackNote({
    text: note.text,
    screen: ctx.screen ?? note.screen,
  });
  const cls =
    parsed.data.class && isFeedbackClass(parsed.data.class) ? parsed.data.class : suggested.class;
  const rated = { ...suggested, class: cls };

  if (!canAssignDest(rated, parsed.data.dest, { founderOverride: true })) {
    return NextResponse.json({ error: 'dest_not_allowed' }, { status: 409 });
  }

  const written = await writeFeedbackReview({
    leadId: parsed.data.leadId,
    class: cls,
    dest: parsed.data.dest,
    reasons: suggested.reasons,
    decidedBy: actor,
  });

  if (!written.ok) {
    if (written.error === 'unavailable') {
      return NextResponse.json({ ok: false, error: 'reviews_unavailable' }, { status: 503 });
    }
    if (written.error === 'not_feedback') {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    if (written.error === 'no_service_role') {
      return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    }
    return NextResponse.json({ error: 'query_failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, review: written.review });
});
