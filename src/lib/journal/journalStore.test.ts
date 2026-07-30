import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  JOURNAL_MAX_ENTRIES,
  getJournalEntry,
  listJournalEntries,
  saveJournalEntry,
  setJournalFeel,
  type SessionJournalEntry,
} from '@/lib/journal/journalStore';
import { __resetForTests as resetStorage } from '@/lib/storage/safeStorage';

function installStorage(): () => void {
  const map = new Map<string, string>();
  const g = globalThis as { localStorage?: Storage };
  const prev = g.localStorage;
  g.localStorage = {
    getItem: (k: string) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: (i: number) => [...map.keys()][i] ?? null,
    get length() {
      return map.size;
    },
  } as unknown as Storage;
  return () => {
    if (prev === undefined) delete g.localStorage;
    else g.localStorage = prev;
  };
}

function entry(workoutId: string, text = '700 kg moved'): SessionJournalEntry {
  return {
    workoutId,
    date: '2026-07-30T18:00:00.000Z',
    workoutName: 'Push Day',
    zone: 'steady',
    lines: [{ kind: 'effort', text }],
    savedAt: '2026-07-30T19:00:00.000Z',
  };
}

describe('journalStore', () => {
  it('what the coach said survives the sheet closing — the .184 claim', () => {
    const uninstall = installStorage();
    resetStorage();
    try {
      saveJournalEntry(entry('w1'));
      // A new read (fresh call, same storage) must return the same lines. Removing
      // the persistence turns this into null and the whole feature into vapor.
      const back = getJournalEntry('w1');
      assert.ok(back);
      assert.deepEqual(back.lines, [{ kind: 'effort', text: '700 kg moved' }]);
      assert.equal(getJournalEntry('nope'), null);
    } finally {
      uninstall();
    }
  });

  it('finishing the same workout twice replaces, never duplicates', () => {
    const uninstall = installStorage();
    resetStorage();
    try {
      saveJournalEntry(entry('w1', 'first'));
      saveJournalEntry(entry('w1', 'second'));
      assert.equal(listJournalEntries().length, 1);
      assert.equal(getJournalEntry('w1')?.lines[0].text, 'second');
    } finally {
      uninstall();
    }
  });

  it('growth is bounded — oldest entries fall off past the cap', () => {
    const uninstall = installStorage();
    resetStorage();
    try {
      for (let i = 0; i < JOURNAL_MAX_ENTRIES + 5; i++) saveJournalEntry(entry(`w${i}`));
      assert.equal(listJournalEntries().length, JOURNAL_MAX_ENTRIES);
      assert.equal(getJournalEntry('w0'), null, 'oldest dropped');
      assert.ok(getJournalEntry(`w${JOURNAL_MAX_ENTRIES + 4}`), 'newest kept');
    } finally {
      uninstall();
    }
  });

  it('a feel tap lands on the entry and nowhere else', () => {
    const uninstall = installStorage();
    resetStorage();
    try {
      saveJournalEntry(entry('w1'));
      saveJournalEntry(entry('w2'));
      setJournalFeel('w1', 4);
      assert.equal(getJournalEntry('w1')?.feel, 4);
      assert.equal(getJournalEntry('w2')?.feel, undefined);
      setJournalFeel('missing', 3); // must not throw or create an entry
      assert.equal(getJournalEntry('missing'), null);
    } finally {
      uninstall();
    }
  });
});
