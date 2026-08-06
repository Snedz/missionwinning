import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { summarizeJournal } from '@/lib/journal/journalInsights';
import { JOURNAL_MAX_ENTRIES } from '@/lib/journal/journalStore';
import { localDateKey } from '@/lib/time/localDate';

/** ISO stamp `days` before the injected clock — fixtures never carry literals. */
function isoDaysAgo(now: Date, days: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function localKeyDaysAgo(now: Date, days: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return localDateKey(d);
}

describe('summarizeJournal', () => {
  const now = new Date();

  it('is all zeros on an empty device', () => {
    const s = summarizeJournal([], [], now);
    assert.deepEqual(s, {
      entries: 0,
      atCap: false,
      daysJournaled: 0,
      entriesThisYear: 0,
      wordsWritten: 0,
    });
  });

  it('unions entry days with noted check-in days, never double-counting a day', () => {
    const s = summarizeJournal(
      [{ date: now.toISOString(), fragments: [] }],
      [
        { date: localDateKey(now), note: 'good sleep' }, // same local day as the entry
        { date: localKeyDaysAgo(now, 1), note: 'long day' },
        { date: localKeyDaysAgo(now, 2), note: '   ' }, // blank note — not journaling
      ],
      now
    );
    assert.equal(s.daysJournaled, 2);
    assert.equal(s.entries, 1);
  });

  it('counts this-year entries from the local day, not the raw ISO', () => {
    const s = summarizeJournal(
      [
        { date: now.toISOString() },
        { date: isoDaysAgo(now, 366) }, // always the previous year or older
      ],
      [],
      now
    );
    assert.equal(s.entries, 2);
    assert.equal(s.entriesThisYear, 1);
  });

  it('counts only the athlete’s words — fragments and notes, nothing else', () => {
    const s = summarizeJournal(
      [{ date: now.toISOString(), fragments: ['felt strong today', 'grip  was  shaky'] }],
      [{ date: localDateKey(now), note: 'slept well' }],
      now
    );
    // 3 + 3 fragment words, 2 note words — a wider source would break this exact sum.
    assert.equal(s.wordsWritten, 8);
  });

  it('reports the cap so the UI can say "last 200" instead of implying a lifetime total', () => {
    const many = Array.from({ length: JOURNAL_MAX_ENTRIES }, () => ({
      date: now.toISOString(),
    }));
    assert.equal(summarizeJournal(many, [], now).atCap, true);
    assert.equal(summarizeJournal(many.slice(1), [], now).atCap, false);
  });
});
