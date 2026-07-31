/**
 * Where you stopped reading.
 *
 * `.216` — `.214` made the notes visible and `.215` made them arrive in volume.
 * Neither answers the question the weekly ritual actually asks. `POST_LAUNCH_CADENCE`
 * §3 is *"read 2 users → fix the **#1** confusion within 48h"*, and "the #1
 * confusion" is not a property of a list — it is a property of **what is new
 * since you last looked**. A panel showing 40 notes newest-first looks the same
 * on the Monday three arrived as on the Monday none did.
 *
 * So the panel keeps a mark. It is deliberately **device-local**:
 *
 *   - it is a reading position, not data — losing it costs one re-read, and
 *     syncing it would need a table, a migration and an auth path for a fact
 *     only one person holds;
 *   - `leads` has RLS with zero policies, so there is no client-writable
 *     surface to put it on without inventing one.
 *
 * ## The counting rule, and why it is a rule
 *
 * Unread is decided by **timestamp**, not by index or count. A count-based mark
 * ("I had read 12") silently miscounts the moment anything is deleted, and a
 * `notes.length` diff reports zero new when one arrives and one falls off the
 * 100-row cap. `.202`'s lesson holds: a measurement that can be satisfied
 * without measuring is not a measurement.
 */

import { readRaw, writeRaw } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import type { FeedbackNote } from '@/lib/feedbackSource';

/**
 * Notes newer than `reviewedAt`.
 *
 * Pure, and takes the mark as an argument rather than reading storage, so the
 * cases worth pinning — never read before, a note with an unparseable
 * timestamp, a mark in the future — are assertable without a browser.
 *
 * **Never read before returns everything.** Not zero: a founder opening the
 * panel for the first time has read none of it, and showing "0 new" over a full
 * inbox is the same class of lie as a thank-you screen over a dropped
 * submission.
 */
export function unreadCount(notes: readonly FeedbackNote[], reviewedAt: string | null): number {
  if (!reviewedAt) return notes.length;
  const mark = Date.parse(reviewedAt);
  if (Number.isNaN(mark)) return notes.length;

  return notes.filter((note) => {
    const at = Date.parse(note.at);
    // A note whose timestamp cannot be parsed counts as unread. Erring toward
    // "look at this" costs a glance; erring the other way hides a real note
    // forever, because nothing ever moves it back above the mark.
    if (Number.isNaN(at)) return true;
    return at > mark;
  }).length;
}

/** The mark, or null when this device has never read the inbox. */
export function loadReviewedAt(): string | null {
  const raw = readRaw(STORAGE_KEYS.feedbackReviewedAt);
  if (!raw) return null;
  // A corrupt value must not pin the mark somewhere unreachable — treat it as
  // never-read, which over-reports rather than hides.
  return Number.isNaN(Date.parse(raw)) ? null : raw;
}

/**
 * Mark everything currently loaded as read.
 *
 * Takes the timestamp of the newest note rather than "now" on purpose. Using the
 * wall clock would also mark as read anything that arrived between the fetch and
 * the click — a note the founder has provably not seen, buried by the act of
 * dismissing a different one.
 */
export function markReviewed(notes: readonly FeedbackNote[]): string | null {
  const newest = notes
    .map((n) => Date.parse(n.at))
    .filter((t) => !Number.isNaN(t))
    .sort((a, b) => b - a)[0];
  if (newest === undefined) return null;

  const stamp = new Date(newest).toISOString();
  writeRaw(STORAGE_KEYS.feedbackReviewedAt, stamp);
  return stamp;
}
