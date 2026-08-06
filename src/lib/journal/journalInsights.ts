/**
 * Honest counters over the journal — what is on this device, nothing more.
 *
 * The union mirrors `JournalTimeline.buildRows` exactly (session entries +
 * check-ins with a non-empty note), so these numbers can never disagree with
 * the surface they link to (`.178`). Words are counted from the athlete's own
 * writing only — `fragments` and check-in notes; the machine's debrief lines
 * are not the athlete's voice and are excluded by the input type itself.
 *
 * The 200-entry cap is surfaced, not hidden: at cap the entries figure means
 * "the last 200", and `atCap` lets the UI say so instead of implying a
 * lifetime total this store cannot hold (`daysWithData.ts` owns the longer
 * story on caps-as-honesty).
 */

import type { SessionJournalEntry } from '@/lib/journal/journalStore';
import { JOURNAL_MAX_ENTRIES } from '@/lib/journal/journalStore';
import type { MindCheckIn } from '@/lib/mindCheckIns';
import { localDateKey, localDateKeyFromIso } from '@/lib/time/localDate';

export interface JournalSummary {
  /** Session entries on device. At cap this means "the last 200". */
  entries: number;
  atCap: boolean;
  /** Distinct local days across entries and noted check-ins. */
  daysJournaled: number;
  /** Session entries whose local day falls in the current year. */
  entriesThisYear: number;
  /** The athlete's words only — fragments + check-in notes, whitespace-split. */
  wordsWritten: number;
}

/**
 * Entry dates are ISO instants (`completedAt`), check-in dates are already
 * local `YYYY-MM-DD` — same value-shape dispatch as `daysWithData.dayKeyOf`,
 * for the same reason: a blind `.slice(0, 10)` on an instant is the UTC date.
 */
function dayKeyOf(raw: string): string {
  return raw.includes('T') ? localDateKeyFromIso(raw) : raw;
}

function countWords(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

export function summarizeJournal(
  entries: readonly Pick<SessionJournalEntry, 'date' | 'fragments'>[],
  checkIns: readonly Pick<MindCheckIn, 'date' | 'note'>[],
  now: Date = new Date()
): JournalSummary {
  const notedCheckIns = checkIns.filter((c) => c.note?.trim());

  const days = new Set<string>();
  const thisYearPrefix = `${localDateKey(now).slice(0, 4)}-`;
  let entriesThisYear = 0;
  let wordsWritten = 0;

  for (const entry of entries) {
    const day = dayKeyOf(entry.date);
    if (day) {
      days.add(day);
      if (day.startsWith(thisYearPrefix)) entriesThisYear += 1;
    }
    for (const fragment of entry.fragments ?? []) {
      wordsWritten += countWords(fragment);
    }
  }

  for (const checkIn of notedCheckIns) {
    if (checkIn.date) days.add(checkIn.date);
    wordsWritten += countWords(checkIn.note ?? '');
  }

  return {
    entries: entries.length,
    atCap: entries.length >= JOURNAL_MAX_ENTRIES,
    daysJournaled: days.size,
    entriesThisYear,
    wordsWritten,
  };
}
