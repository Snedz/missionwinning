/**
 * What a friction report carries, and how long it is allowed to be.
 *
 * `.215` — the existing `/feedback` form asks for results, a testimonial, a 1–5
 * rating and "massive action". That is a **testimonial** instrument: it collects
 * proof for a launch page. It is not what someone reaches for when the timer
 * jumped or a button did nothing, and it lives in the legal footer between "Beta
 * guide" and "Terms of Service", styled as muted 14px text.
 *
 * So the sheet asks one question and attaches the two facts that decide whether
 * a note is actionable:
 *
 *   - **the screen they were on.** *"the timer jumped"* is unactionable; the same
 *     sentence tagged `/active` is a bug report.
 *   - **the build label.** Without it, a note from three deploys ago reads as a
 *     live defect and gets chased twice.
 *
 * Both are attached silently because asking someone to tell you which route they
 * were on is asking them to do your debugging.
 *
 * ## The length budget is real, not decorative
 *
 * `leadsBodySchema` caps `goals` at 2000 characters and `app/api/leads/route.ts`
 * re-slices to 2000 — **twice**, silently. Since the context lines are packed
 * into that same field, a note written right up to 2000 would lose its tail
 * without saying so. `MAX_NOTE_CHARS` is therefore 2000 minus the worst-case
 * context, and the sheet shows the remaining count rather than trimming after
 * the fact. A silent truncation of the one thing the athlete wanted to tell you
 * is the same class of defect as a thank-you screen over a dropped submission.
 */

import type { FeedbackPayload } from '@/lib/sync/feedbackSync';
import { FEEDBACK_SOURCE_TAG } from '@/lib/feedbackSource';

/** Hard ceiling on `leads.goals`, enforced by the schema and again by the route. */
export const GOALS_COLUMN_LIMIT = 2000;

/**
 * Worst-case size of the context block appended below. Computed generously —
 * a long route plus a long build label plus the labels and newlines — so the
 * budget can never be optimistic about how much room is left.
 */
const CONTEXT_RESERVE = 256;

/** What the athlete may type. The sheet counts down against this. */
export const MAX_NOTE_CHARS = GOALS_COLUMN_LIMIT - CONTEXT_RESERVE;

export interface FeedbackNoteInput {
  /** The one required answer. */
  text: string;
  /** Optional — a note without one is unanswerable, never unwelcome. */
  email?: string;
  /** Optional display name from the considered `/feedback` form. */
  name?: string;
  /** Route the sheet was opened from, e.g. `/active`. */
  screen: string;
  /**
   * The route before that, when there was one. Carried because the sheet lives
   * on Profile: without it every note claims the defect happened on `/profile`.
   */
  previousScreen?: string | null;
  /** `APP_BUILD_LABEL` at submit time. */
  buildLabel: string;
  /** False when the note was written with no connection — it queues either way. */
  online: boolean;
}

/**
 * Build the outbox payload.
 *
 * A function rather than an inline object at the call site, because the shape is
 * the thing worth pinning: which fields survive, what happens to an empty email,
 * and that the context is appended rather than replacing what was written.
 * `.196` is the standing reminder that a rule spelled as a shape can only be
 * checked as one.
 */
export function composeFeedbackNote(input: FeedbackNoteInput): FeedbackPayload {
  const text = input.text.trim().slice(0, MAX_NOTE_CHARS);
  const email = (input.email ?? '').trim();

  const context = [
    '',
    '---',
    `Screen: ${input.screen}`,
    // Omitted rather than written as "none" — an absent line reads as "we don't
    // know", which is true; `Came from: none` reads as a measurement.
    ...(input.previousScreen ? [`Came from: ${input.previousScreen}`] : []),
    `Build: ${input.buildLabel}`,
    ...(input.online ? [] : ['Written offline']),
  ].join('\n');

  return {
    name: (input.name ?? '').trim(),
    email,
    goals: `${text}${context}`,
    package_interest: FEEDBACK_SOURCE_TAG,
    source: FEEDBACK_SOURCE_TAG,
    message: text,
  };
}

/** Characters left before the sheet must stop accepting input. */
export function remainingChars(text: string): number {
  return MAX_NOTE_CHARS - text.length;
}

/** A note is sendable when it actually says something. */
export function canSendNote(text: string): boolean {
  return text.trim().length > 0;
}

export type ParsedFeedbackContext = {
  body: string;
  screen: string | null;
  previousScreen: string | null;
  buildLabel: string | null;
  writtenOffline: boolean;
};

export function parseFeedbackContext(goals: string): ParsedFeedbackContext {
  const idx = goals.lastIndexOf('\n---\n');
  const head = (idx === -1 ? goals : goals.slice(0, idx)).trim();
  const tail = idx === -1 ? '' : goals.slice(idx);
  return {
    body: head,
    screen: tail.match(/^Screen:\s+(\S+)/m)?.[1] ?? null,
    previousScreen: tail.match(/^Came from:\s+(\S+)/m)?.[1] ?? null,
    buildLabel: tail.match(/^Build:\s+(\S+)/m)?.[1] ?? null,
    writtenOffline: /Written offline/.test(tail),
  };
}
