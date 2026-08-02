/**
 * How many days this athlete has actually logged something.
 *
 * `.247` — the "1,146 days of data" number, and it **cannot be derived** from
 * what is stored. Every store in this app is capped:
 *
 * | Store | Cap |
 * |---|---|
 * | `workoutHistory` | `HISTORY_CAP` = 1000 sessions |
 * | `sessionJournal` | `JOURNAL_MAX_ENTRIES` = 200 |
 * | `bodyMetrics` | 200 |
 * | `pillarWins` | read at a limit, not stored unbounded |
 *
 * Those caps are correct — `localStorage` is finite and `.210` showed what an
 * unbounded write path costs on the logger. But they mean a two-year athlete's
 * first months are *gone*, and counting the rows that remain would report a
 * number that shrinks as they train more. So the day **keys** are kept
 * separately: ten bytes a day, ~3.6 KB per decade, and nothing else in the app
 * is small enough to promise that.
 *
 * ## One sweeper, not a writer at every call site
 *
 * The obvious design is `recordDayWithData()` called wherever something is
 * logged — and that is exactly `.220`'s defect waiting to happen. That wave
 * found a guard named *"both streak readers apply the recency rule"* that
 * opened two files when there were four, and the two it missed were the two
 * that mattered. A day-recorder wired into six log sites is six chances to
 * miss the seventh, and the failure is silent: the day simply never counts.
 *
 * So nothing writes on log. {@link sweepDaysWithData} reads every dated store,
 * unions what it finds into the persisted set, and runs on load. A new pillar
 * that writes dated rows is picked up by adding it to `SOURCES` here — one
 * table, in one file, with a test that fails when a dated store is missing
 * from it.
 *
 * ## What the number is allowed to claim
 *
 * **"Days logged", never "days since you started".** For an athlete who was
 * already past a cap when this shipped, the backfill can only see what
 * survived, so the count is a **lower bound**. Saying "N days logged" is true
 * either way; saying "N days on mission" would imply a continuity this cannot
 * prove, and inventing that is `.208`'s defect on the most emotive number in
 * the product.
 */

import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';
import { localDateKey, localDateKeyFromIso } from '@/lib/time/localDate';

/** `YYYY-MM-DD` local day keys, newest first. Never capped — see the header. */
const KEY = STORAGE_KEYS.daysWithData;

/**
 * Every store that records *when* something happened, and which field holds it.
 *
 * Two value shapes exist — `date` fields are already local `YYYY-MM-DD`, while
 * `completedAt` is an ISO **instant** — and {@link dayKeyOf} tells them apart
 * from the value rather than from a flag in this table.
 */
const SOURCES: { key: string; field: string }[] = [
  { key: STORAGE_KEYS.nutritionLog, field: 'date' },
  { key: STORAGE_KEYS.activityLog, field: 'date' },
  { key: STORAGE_KEYS.mindCheckIns, field: 'date' },
  { key: STORAGE_KEYS.bodyMetrics, field: 'date' },
  { key: STORAGE_KEYS.sessionJournal, field: 'date' },
  { key: STORAGE_KEYS.pillarWins, field: 'completedAt' },
];

/**
 * The local day a stored value refers to — asking the **value**, not a flag.
 *
 * The first version carried `isInstant: boolean` per source and sliced the
 * first ten characters when it was false. Two things were wrong with that, and
 * `.245`'s own guard caught it on the first run:
 *
 * 1. A blind `.slice(0, 10)` on something that turns out to be an instant
 *    yields the **UTC** date — the exact defect `.245` fixed across six files,
 *    reintroduced in the file that cites it.
 * 2. The flag is a second, hand-maintained description of the data's shape
 *    (`.178`). Set it wrong on a new source and every day from that store
 *    lands one off, silently, east of UTC.
 *
 * An ISO instant always contains `T`; a `YYYY-MM-DD` key never does. The value
 * is unambiguous, so nothing has to remember to declare it.
 */
function dayKeyOf(raw: string): string {
  return raw.includes('T') ? localDateKeyFromIso(raw) : raw;
}

function isDayKey(v: unknown): v is string {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

function load(): string[] {
  const raw = readJson<unknown>(KEY, []);
  return Array.isArray(raw) ? raw.filter(isDayKey) : [];
}

/**
 * Fold a set of day keys into storage.
 *
 * Sorted newest-first and de-duplicated, so the file is stable and a sweep that
 * finds nothing new writes byte-identical content — which `.210`'s
 * `dedupeWrites` then skips entirely rather than touching the disk on load.
 */
function persist(days: Set<string>): string[] {
  /*
   * `Set`, not `Iterable`. The first version took an iterable and re-wrapped it
   * in a `new Set()` to de-duplicate — and a mutation removing that wrap
   * survived every test, because both callers already pass a set. Defensive
   * code no test can reach is the shape `.246` deleted in the trend parser an
   * hour earlier. Uniqueness is now the *type's* job, so a caller that could
   * pass duplicates does not compile.
   */
  const sorted = [...days].filter(isDayKey).sort((a, b) => b.localeCompare(a));
  writeJson(KEY, sorted);
  return sorted;
}

/**
 * Read every dated store and union what it finds into the persisted set.
 *
 * Idempotent, cheap, and safe to call on every load: it is a few hundred string
 * comparisons and, when nothing is new, produces an identical payload.
 *
 * `workoutHistory` is passed in rather than read here — it lives in the zustand
 * store, and importing that into a lib would drag the whole logger in behind it.
 */
export function sweepDaysWithData(workoutDates: string[] = []): string[] {
  const found = new Set(load());

  for (const iso of workoutDates) {
    const day = localDateKeyFromIso(iso);
    if (day) found.add(day);
  }

  for (const source of SOURCES) {
    const rows = readJson<Record<string, unknown>[]>(source.key, []);
    if (!Array.isArray(rows)) continue;
    for (const row of rows) {
      const raw = row?.[source.field];
      if (typeof raw !== 'string' || !raw) continue;
      const day = dayKeyOf(raw);
      if (isDayKey(day)) found.add(day);
    }
  }

  return persist(found);
}

/** How many distinct days hold data. The headline number. */
export function daysWithDataCount(): number {
  return load().length;
}

/** The earliest day on record, or null. Newest-first, so it is the last entry. */
export function firstDayWithData(): string | null {
  const days = load();
  return days.length ? days[days.length - 1] : null;
}

/** Every day on record, newest first — the set `/history/[date]` navigates. */
export function listDaysWithData(): string[] {
  return load();
}

/** Did the athlete log anything on this local day? */
export function hasDataOn(day: string): boolean {
  return load().includes(day);
}

/**
 * Mark today explicitly.
 *
 * The sweep covers everything that writes a dated row, but a few actions leave
 * no dated trace of their own. This is the escape hatch for those — not the
 * primary mechanism, and deliberately not wired into the log sites the sweep
 * already sees, because two paths recording the same fact is `.178`.
 */
export function markTodayWithData(): string[] {
  const found = new Set(load());
  found.add(localDateKey());
  return persist(found);
}
