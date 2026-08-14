import 'server-only';

/**
 * One definition of "read the feedback notes".
 * Reviews live in `feedback_reviews`. Missing table is not "no notes".
 */

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { FEEDBACK_SOURCE_TAG, type FeedbackNote } from '@/lib/feedbackSource';
import { parseFeedbackContext } from '@/lib/feedbackNote';
import { type FeedbackClass, type FeedbackDest } from '@/lib/feedbackTriage';

export interface FeedbackReadResult {
  notes: FeedbackNote[] | null;
  error: 'no_service_role' | 'query_failed' | null;
  truncated: boolean;
  persistAvailable: boolean;
}

function isMissingRelation(error: { code?: string } | null | undefined): boolean {
  return error?.code === '42P01' || error?.code === 'PGRST205';
}

function mapLead(row: {
  id?: unknown;
  created_at?: unknown;
  name?: unknown;
  email?: unknown;
  goals?: unknown;
}): FeedbackNote {
  const text = String(row.goals ?? '').trim();
  const ctx = parseFeedbackContext(text);
  const idRaw = row.id;
  const id = typeof idRaw === 'number' ? idRaw : Number(idRaw);
  return {
    id: Number.isFinite(id) ? id : null,
    at: String(row.created_at ?? ''),
    name: String(row.name ?? '').trim(),
    email: String(row.email ?? '').trim(),
    text,
    screen: ctx.screen,
    previousScreen: ctx.previousScreen,
    buildLabel: ctx.buildLabel,
    review: null,
  };
}

export async function readFeedbackNotes(limit: number): Promise<FeedbackReadResult> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { notes: null, error: 'no_service_role', truncated: false, persistAvailable: false };
  }

  const { data, error } = await admin
    .from('leads')
    .select('id, created_at, name, email, goals')
    .eq('package_interest', FEEDBACK_SOURCE_TAG)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[feedback] read failed: %s', error.message);
    return { notes: null, error: 'query_failed', truncated: false, persistAvailable: false };
  }

  const notes: FeedbackNote[] = (data ?? []).map(mapLead);
  const { persistAvailable } = await attachReviews(notes);
  return { notes, error: null, truncated: notes.length === limit, persistAvailable };
}

async function attachReviews(notes: FeedbackNote[]): Promise<{ persistAvailable: boolean }> {
  const ids = notes.map((n) => n.id).filter((id): id is number => typeof id === 'number');
  if (ids.length === 0) return { persistAvailable: true };

  const admin = getSupabaseAdmin();
  if (!admin) return { persistAvailable: false };

  const { data, error } = await admin
    .from('feedback_reviews')
    .select('lead_id, class, dest, decided_at')
    .in('lead_id', ids);

  if (error) {
    if (isMissingRelation(error)) return { persistAvailable: false };
    console.error('[feedback] reviews read failed: %s', error.message);
    return { persistAvailable: false };
  }

  const byLead = new Map<number, NonNullable<FeedbackNote['review']>>();
  for (const row of data ?? []) {
    const leadId = Number(row.lead_id);
    if (!Number.isFinite(leadId)) continue;
    byLead.set(leadId, {
      class: String(row.class ?? ''),
      dest: String(row.dest ?? ''),
      decidedAt: String(row.decided_at ?? ''),
    });
  }
  for (const note of notes) {
    if (typeof note.id === 'number') note.review = byLead.get(note.id) ?? null;
  }
  return { persistAvailable: true };
}

export type WriteReviewResult =
  | { ok: true; review: NonNullable<FeedbackNote['review']> }
  | { ok: false; error: 'no_service_role' | 'not_feedback' | 'unavailable' | 'query_failed' };

export async function writeFeedbackReview(input: {
  leadId: number;
  class: FeedbackClass;
  dest: FeedbackDest;
  reasons: string[];
  decidedBy: string;
}): Promise<WriteReviewResult> {
  const admin = getSupabaseAdmin();
  if (!admin) return { ok: false, error: 'no_service_role' };

  const { data: lead, error: leadError } = await admin
    .from('leads')
    .select('id, package_interest')
    .eq('id', input.leadId)
    .maybeSingle();

  if (leadError) {
    console.error('[feedback] lead lookup failed: %s', leadError.message);
    return { ok: false, error: 'query_failed' };
  }
  if (!lead || String(lead.package_interest) !== FEEDBACK_SOURCE_TAG) {
    return { ok: false, error: 'not_feedback' };
  }

  const decidedAt = new Date().toISOString();
  const { error } = await admin.from('feedback_reviews').upsert(
    {
      lead_id: input.leadId,
      class: input.class,
      dest: input.dest,
      reasons: input.reasons,
      decided_at: decidedAt,
      decided_by: input.decidedBy,
    },
    { onConflict: 'lead_id' }
  );

  if (error) {
    if (isMissingRelation(error)) return { ok: false, error: 'unavailable' };
    console.error('[feedback] review write failed: %s', error.message);
    return { ok: false, error: 'query_failed' };
  }

  return {
    ok: true,
    review: { class: input.class, dest: input.dest, decidedAt },
  };
}
