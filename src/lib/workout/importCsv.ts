/**
 * CSV import: Strong and Hevy exports → `CompletedWorkoutLog[]`.
 *
 * Switchers are the entire early market for a new logger, and every one of them is
 * holding a CSV: Hevy caps free history at three months (the export is how you leave),
 * Strong's export is its own escape hatch. This module turns either file into the
 * web's native shape so the engines that already exist — `personalRecordsFor`,
 * `e1rmSeries`, `loadBands` — light up against years of the athlete's own history the
 * moment the file lands. Import is free forever, never gated: that is the same
 * contract Android's importer already states, and this module keeps the two surfaces
 * honest with each other rather than inventing a second dialect
 * (`apps/android/core/data/WorkoutTransfer.kt` is the reference implementation).
 *
 * Pure and DOM-free on purpose: parsing someone's training history is exactly the
 * kind of thing that should be provable in a unit test rather than discovered by an
 * athlete whose 400-session export imported as 12.
 *
 * Two shapes this parser refuses to guess about:
 * - **Quoted fields can contain newlines** (Hevy exercise notes routinely do), so
 *   records are split by a real CSV scanner, never `text.split('\n')`.
 * - **Unknown set types stay 'normal', unknown RPE stays absent.** Dropping a set
 *   because its label is unrecognised would silently shrink someone's history.
 */

import type { CompletedWorkoutLog, SetKind, Rpe } from '@/types';
import type { UnitsPref } from '@/lib/units';
import { EXERCISES } from '@/data/exercises';
import { rpeNumberToCategory } from '@/lib/sync/normalizeExercises';
import { compareKeys } from '@/lib/i18n/formatLocale';

export type CsvFormat = 'hevy' | 'strong';

export interface CsvImportResult {
  workouts: CompletedWorkoutLog[];
  format: CsvFormat | null;
  /** Data rows that could not be read. Reported, never silently swallowed. */
  skippedRows: number;
  error?: string;
}

const LB_PER_KG = 2.2046226218;

/** Scan the whole text, honouring quoted fields (which may contain commas and newlines). */
export function splitCsvRecords(text: string): string[][] {
  const records: string[][] = [];
  let field = '';
  let record: string[] = [];
  let inQuotes = false;

  const pushField = () => {
    record.push(field);
    field = '';
  };
  const pushRecord = () => {
    pushField();
    // A record of one empty field is a blank line, not data.
    if (record.length > 1 || record[0] !== '') records.push(record);
    record = [];
  };

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      pushField();
    } else if (c === '\n') {
      pushRecord();
    } else if (c !== '\r') {
      field += c;
    }
  }
  if (field !== '' || record.length > 0) pushRecord();
  return records;
}

/** Which app produced this file, judged by its header row alone. */
export function detectCsvFormat(text: string): CsvFormat | null {
  const firstRecord = splitCsvRecords(text.slice(0, 4096))[0];
  if (!firstRecord) return null;
  const header = firstRecord.map((h) => h.trim().toLowerCase());
  if (header.includes('exercise_title') && header.includes('set_index')) return 'hevy';
  if (header.includes('exercise name') && header.includes('set order')) return 'strong';
  return null;
}

/**
 * Catalog match by normalised name, with the equipment parenthetical stripped —
 * Hevy writes "Bench Press (Barbell)", the catalog says "Bench Press". A name that
 * matches nothing becomes a slug id, which is how custom exercises already work; the
 * set is preserved either way. Matching must never be the reason a set is lost.
 */
const CATALOG_BY_NAME = new Map<string, string>(
  EXERCISES.map((e) => [e.name.trim().toLowerCase(), e.id])
);

export function exerciseIdForName(rawName: string): string {
  const name = rawName.trim();
  const lower = name.toLowerCase();
  const direct = CATALOG_BY_NAME.get(lower);
  if (direct) return direct;
  const stripped = lower.replace(/\s*\([^)]*\)\s*$/, '').trim();
  const viaStripped = CATALOG_BY_NAME.get(stripped);
  if (viaStripped) return viaStripped;
  const slug = stripped
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'unknown-exercise';
}

function mapSetType(raw: string): SetKind {
  const t = raw.trim().toLowerCase();
  if (t === 'warmup' || t === 'warm up' || t === 'warm-up') return 'warmup';
  if (t === 'failure') return 'failure';
  if (t === 'dropset' || t === 'drop set' || t === 'drop') return 'drop';
  return 'normal';
}

function toIso(raw: string): string | null {
  if (!raw.trim()) return null;
  // Hevy: "14 Jul 2026, 18:05" or ISO; Strong: "2026-07-14 18:05:00".
  const direct = new Date(raw.trim());
  if (!Number.isNaN(direct.getTime())) return direct.toISOString();
  const strongish = new Date(raw.trim().replace(' ', 'T'));
  if (!Number.isNaN(strongish.getTime())) return strongish.toISOString();
  return null;
}

/** Strong writes duration as "1h 5m" / "45m" / "32s". */
export function parseDurationSeconds(raw: string): number {
  let seconds = 0;
  const h = /(\d+)\s*h/.exec(raw);
  const m = /(\d+)\s*m(?!s)/.exec(raw);
  const s = /(\d+)\s*s/.exec(raw);
  if (h) seconds += Number(h[1]) * 3600;
  if (m) seconds += Number(m[1]) * 60;
  if (s) seconds += Number(s[1]);
  return seconds;
}

interface RawSet {
  workoutKey: string;
  workoutName: string;
  startIso: string | null;
  endIso: string | null;
  durationSeconds: number;
  exerciseName: string;
  setIndex: number;
  reps: number;
  weight: number;
  kind: SetKind;
  rpe?: Rpe;
}

function toWebWeight(kg: number | null, lbs: number | null, units: UnitsPref): number {
  // The logger stores the number the athlete sees, in their display unit.
  if (units === 'metric') {
    if (kg != null) return round1(kg);
    if (lbs != null) return round1(lbs / LB_PER_KG);
  } else {
    if (lbs != null) return round1(lbs);
    if (kg != null) return round1(kg * LB_PER_KG);
  }
  return 0;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function num(raw: string | undefined): number | null {
  if (raw == null || raw.trim() === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function assembleWorkouts(sets: RawSet[], newId: () => string): CompletedWorkoutLog[] {
  const byWorkout = new Map<string, RawSet[]>();
  for (const s of sets) {
    const list = byWorkout.get(s.workoutKey) ?? [];
    list.push(s);
    byWorkout.set(s.workoutKey, list);
  }

  const workouts: CompletedWorkoutLog[] = [];
  for (const group of byWorkout.values()) {
    const first = group[0];
    const completedAt = first.endIso ?? first.startIso ?? new Date(0).toISOString();
    const startedAt = first.startIso ?? completedAt;
    const duration =
      first.durationSeconds > 0
        ? first.durationSeconds
        : first.startIso && first.endIso
          ? Math.max(
              0,
              Math.round(
                (new Date(first.endIso).getTime() - new Date(first.startIso).getTime()) / 1000
              )
            )
          : 0;

    // Nested by exercise, sets in recorded order — the web's native shape.
    const byExercise = new Map<string, RawSet[]>();
    for (const s of group) {
      const id = exerciseIdForName(s.exerciseName);
      const list = byExercise.get(id) ?? [];
      list.push(s);
      byExercise.set(id, list);
    }

    let totalVolume = 0;
    const exercises = [...byExercise.entries()].map(([exerciseId, exSets]) => ({
      exerciseId,
      sets: exSets
        .sort((a, b) => a.setIndex - b.setIndex)
        .map((s) => {
          totalVolume += Math.max(0, s.reps * s.weight);
          const set: { reps: number; weight: number; kind?: SetKind; rpe?: Rpe } = {
            reps: s.reps,
            weight: s.weight,
          };
          if (s.kind !== 'normal') set.kind = s.kind;
          if (s.rpe) set.rpe = s.rpe;
          return set;
        }),
    }));

    const id = newId();
    workouts.push({
      id,
      clientId: id,
      workoutName: first.workoutName || 'Imported workout',
      startedAt,
      completedAt,
      durationSeconds: duration,
      exercises,
      totalVolume: Math.round(totalVolume),
    });
  }

  return workouts.sort((a, b) => compareKeys(a.completedAt, b.completedAt));
}

function headerIndex(header: string[]): (...names: string[]) => number {
  const lower = header.map((h) => h.trim().toLowerCase());
  return (...names: string[]) => {
    for (const n of names) {
      const i = lower.indexOf(n);
      if (i >= 0) return i;
    }
    return -1;
  };
}

function parseHevy(records: string[][], units: UnitsPref, newId: () => string): CsvImportResult {
  const idx = headerIndex(records[0]);
  const iTitle = idx('title');
  const iStart = idx('start_time');
  const iEnd = idx('end_time');
  const iEx = idx('exercise_title');
  const iSet = idx('set_index');
  const iType = idx('set_type');
  const iKg = idx('weight_kg');
  const iLbs = idx('weight_lbs');
  const iReps = idx('reps');
  const iRpe = idx('rpe');
  if (iTitle < 0 || iEx < 0) {
    return { workouts: [], format: 'hevy', skippedRows: 0, error: 'missing_columns' };
  }

  let skipped = 0;
  const sets: RawSet[] = [];
  for (const cols of records.slice(1)) {
    const col = (i: number) => (i >= 0 ? (cols[i] ?? '').trim() : '');
    const exerciseName = col(iEx);
    const reps = num(col(iReps));
    if (!exerciseName || reps == null) {
      skipped++;
      continue;
    }
    const start = col(iStart);
    sets.push({
      workoutKey: `${col(iTitle)}|${start}`,
      workoutName: col(iTitle),
      startIso: toIso(start),
      endIso: toIso(col(iEnd)),
      durationSeconds: 0,
      exerciseName,
      setIndex: num(col(iSet)) ?? sets.length,
      reps: Math.max(0, Math.round(reps)),
      weight: toWebWeight(num(col(iKg)), num(col(iLbs)), units),
      kind: mapSetType(col(iType)),
      rpe: rpeNumberToCategory(num(col(iRpe))),
    });
  }

  return { workouts: assembleWorkouts(sets, newId), format: 'hevy', skippedRows: skipped };
}

function parseStrong(records: string[][], units: UnitsPref, newId: () => string): CsvImportResult {
  const idx = headerIndex(records[0]);
  const iDate = idx('date');
  const iName = idx('workout name');
  const iDur = idx('duration', 'workout duration');
  const iEx = idx('exercise name');
  const iOrder = idx('set order');
  const iWeight = idx('weight');
  const iUnit = idx('weight unit');
  const iReps = idx('reps');
  const iRpe = idx('rpe');
  if (iDate < 0 || iEx < 0) {
    return { workouts: [], format: 'strong', skippedRows: 0, error: 'missing_columns' };
  }

  let skipped = 0;
  const sets: RawSet[] = [];
  for (const cols of records.slice(1)) {
    const col = (i: number) => (i >= 0 ? (cols[i] ?? '').trim() : '');
    const exerciseName = col(iEx);
    const reps = num(col(iReps));
    if (!exerciseName || reps == null) {
      skipped++;
      continue;
    }
    // "Rest Timer" / note-only rows in some Strong exports have no weight and 0 reps —
    // they fall out via the reps check above only when reps is blank, so a genuine
    // 0-rep set survives.
    const weightRaw = num(col(iWeight));
    const rowUnit = col(iUnit).toLowerCase();
    const kg = rowUnit === 'kg' ? weightRaw : rowUnit ? null : units === 'metric' ? weightRaw : null;
    const lbs = rowUnit === 'lbs' || rowUnit === 'lb' ? weightRaw : rowUnit ? null : units === 'imperial' ? weightRaw : null;
    const date = col(iDate);
    sets.push({
      workoutKey: `${col(iName)}|${date}`,
      workoutName: col(iName),
      startIso: toIso(date),
      endIso: null,
      durationSeconds: parseDurationSeconds(col(iDur)),
      exerciseName,
      setIndex: num(col(iOrder)) ?? sets.length,
      reps: Math.max(0, Math.round(reps)),
      weight: toWebWeight(kg, lbs, units),
      kind: 'normal',
      rpe: rpeNumberToCategory(num(col(iRpe))),
    });
  }

  return { workouts: assembleWorkouts(sets, newId), format: 'strong', skippedRows: skipped };
}

let idCounter = 0;
function defaultNewId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  idCounter += 1;
  return `import-${Date.now()}-${idCounter}`;
}

/** Parse a Strong or Hevy export. Format is detected from the header, never guessed from the filename. */
export function parseWorkoutCsv(
  text: string,
  units: UnitsPref,
  newId: () => string = defaultNewId
): CsvImportResult {
  const format = detectCsvFormat(text);
  if (!format) return { workouts: [], format: null, skippedRows: 0, error: 'unrecognized_format' };
  const records = splitCsvRecords(text);
  if (records.length < 2) return { workouts: [], format, skippedRows: 0, error: 'no_data_rows' };
  return format === 'hevy' ? parseHevy(records, units, newId) : parseStrong(records, units, newId);
}

/**
 * Merge imported workouts into existing history without duplicating.
 *
 * Identity is (completedAt minute, workoutName, working-set count) — re-importing the
 * same file must be a no-op, and an import must never clobber a session the athlete
 * logged natively at the same time. Existing history always wins: an import is a
 * migration, not an authority.
 */
export function mergeImportedLogs(
  existing: CompletedWorkoutLog[],
  imported: CompletedWorkoutLog[]
): { merged: CompletedWorkoutLog[]; added: number; duplicates: number } {
  const keyOf = (log: CompletedWorkoutLog) => {
    const minute = log.completedAt.slice(0, 16);
    const setCount = log.exercises.reduce((n, e) => n + e.sets.length, 0);
    return `${minute}|${log.workoutName.trim().toLowerCase()}|${setCount}`;
  };
  const seen = new Set(existing.filter((l) => !l.deletedAt).map(keyOf));
  const fresh: CompletedWorkoutLog[] = [];
  let duplicates = 0;
  for (const log of imported) {
    const key = keyOf(log);
    if (seen.has(key)) {
      duplicates++;
      continue;
    }
    seen.add(key);
    fresh.push(log);
  }
  // History is stored newest-first (workoutStore prepends on complete).
  const merged = [...fresh, ...existing].sort((a, b) =>
    compareKeys(b.completedAt, a.completedAt)
  );
  return { merged, added: fresh.length, duplicates };
}
