/**
 * CSV history transfer: Strong / Hevy / Boostcamp import + Mission Winning
 * round-trip export → `CompletedWorkoutLog[]`.
 *
 * Switchers are the early market for a new logger, and every one of them is
 * holding a CSV: Hevy caps free history at three months, Strong paywalls export
 * of your own logs, Boostcamp has no native CSV (athletes use a per-set dump).
 * This module turns those files into the web's native shape so `personalRecordsFor`,
 * `e1rmSeries`, `loadBands` light up against years of the athlete's own history.
 *
 * Export is the other half of the same contract: a portable MW CSV that this
 * parser re-imports as a no-op (and that Android `WorkoutTransfer.toMwCsv`
 * already speaks). History in and out is free forever, never gated — JSON
 * device backup stays on Profile for full-app restore; this is the log.
 *
 * Pure and DOM-free: parsing someone's training history must be provable in a
 * unit test rather than discovered by an athlete whose 400-session export
 * imported as 12.
 *
 * Shapes this parser refuses to guess about:
 * - **Quoted fields can contain newlines** (Hevy exercise notes routinely do), so
 *   records are split by a real CSV scanner, never `text.split('\n')`.
 * - **Unknown set types stay 'normal', unknown RPE stays absent.** Dropping a set
 *   because its label is unrecognised would silently shrink someone's history.
 */

import type { CompletedWorkoutLog, SetKind, Rpe } from '@/types';
import type { UnitsPref } from '@/lib/units';
import { EXERCISES } from '@/data/exercises';
import { rpeCategoryToNumber, rpeNumberToCategory } from '@/lib/sync/normalizeExercises';
import { compareKeys } from '@/lib/i18n/formatLocale';

export type CsvFormat = 'hevy' | 'strong' | 'boostcamp' | 'mw';

/** Android `WorkoutTransfer.toMwCsv` header — web export must match byte-for-byte on names. */
export const MW_CSV_HEADER =
  'workout_id,workout_name,completed_at,duration_seconds,weight_unit,' +
  'exercise_id,exercise_name,set_index,reps,weight,rpe,set_kind,note,superset_group';

export interface CsvImportResult {
  workouts: CompletedWorkoutLog[];
  format: CsvFormat | null;
  /** Data rows that could not be read. Reported, never silently swallowed. */
  skippedRows: number;
  error?: string;
}

const LB_PER_KG = 2.2046226218;

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

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
  const firstRecord = splitCsvRecords(stripBom(text).slice(0, 8192))[0];
  if (!firstRecord) return null;
  const header = firstRecord.map((h) => h.trim().toLowerCase());
  const has = (...names: string[]) => names.every((n) => header.includes(n));
  if (has('exercise_title') && (header.includes('set_index') || header.includes('start_time'))) {
    return 'hevy';
  }
  if (has('exercise name', 'set order')) return 'strong';
  if (has('workout_name', 'exercise_name')) return 'mw';
  if (has('session_date', 'exercise_name')) return 'boostcamp';
  if (
    header.includes('exercise') &&
    header.includes('set') &&
    (header.includes('workout') || header.includes('date')) &&
    header.includes('unit')
  ) {
    return 'boostcamp';
  }
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
const CATALOG_BY_ID = new Map<string, string>(EXERCISES.map((e) => [e.id, e.name]));

export function exerciseNameForId(id: string): string {
  return CATALOG_BY_ID.get(id) ?? id;
}

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
  const t = raw.trim();
  if (!t) return null;
  // Date-only must be local calendar, never UTC midnight (`new Date('YYYY-MM-DD')`
  // is UTC and east-of-UTC evenings land on the previous day).
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  if (dateOnly) {
    const d = new Date(
      Number(dateOnly[1]),
      Number(dateOnly[2]) - 1,
      Number(dateOnly[3]),
      12,
      0,
      0
    );
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  // Hevy: "14 Jul 2026, 18:05" or ISO; Strong: "2026-07-14 18:05:00".
  const direct = new Date(t);
  if (!Number.isNaN(direct.getTime())) return direct.toISOString();
  const strongish = new Date(t.replace(' ', 'T'));
  if (!Number.isNaN(strongish.getTime())) return strongish.toISOString();
  return null;
}

/**
 * Boostcamp History→CSV writes slash dates: EU `dd/mm/yy` when the row unit is kg,
 * US `mm/dd/yy` when it is lb. Unambiguous ISO stays ISO.
 */
export function parseBoostcampDate(raw: string, unit: string): string | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/.exec(raw.trim());
  if (m) {
    // Slash dates must not go through Date.parse — it is US-biased (`03/04/26`
    // becomes March 4 even when the dump is EU).
    let year = Number(m[3]);
    if (year < 100) year += 2000;
    const u = unit.trim().toLowerCase();
    const dayFirst = u !== 'lb' && u !== 'lbs';
    const day = dayFirst ? Number(m[1]) : Number(m[2]);
    const month = dayFirst ? Number(m[2]) : Number(m[1]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const d = new Date(year, month - 1, day, 12, 0, 0);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  return toIso(raw);
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
  /** When present (MW native), reuse the exported id so round-trip stays stable. */
  workoutId?: string;
  workoutName: string;
  startIso: string | null;
  endIso: string | null;
  durationSeconds: number;
  exerciseName: string;
  exerciseId?: string;
  setIndex: number;
  reps: number;
  weight: number;
  kind: SetKind;
  rpe?: Rpe;
  note?: string;
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
      const id = s.exerciseId?.trim() || exerciseIdForName(s.exerciseName);
      const list = byExercise.get(id) ?? [];
      list.push(s);
      byExercise.set(id, list);
    }

    let totalVolume = 0;
    const exercises = [...byExercise.entries()].map(([exerciseId, exSets]) => {
      const note = exSets.find((s) => s.note)?.note;
      return {
        exerciseId,
        ...(note ? { note } : {}),
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
      };
    });

    const id = first.workoutId?.trim() || newId();
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

function isTruthyFlag(raw: string): boolean {
  const t = raw.trim().toLowerCase();
  return t === 'true' || t === '1' || t === 'yes';
}

function parseMw(records: string[][], units: UnitsPref, newId: () => string): CsvImportResult {
  const idx = headerIndex(records[0]);
  const iId = idx('workout_id');
  const iName = idx('workout_name');
  const iAt = idx('completed_at');
  const iDur = idx('duration_seconds');
  const iUnit = idx('weight_unit');
  const iExId = idx('exercise_id');
  const iEx = idx('exercise_name');
  const iSet = idx('set_index');
  const iReps = idx('reps');
  const iWeight = idx('weight');
  const iRpe = idx('rpe');
  const iKind = idx('set_kind');
  const iNote = idx('note');
  if (iName < 0 || (iEx < 0 && iExId < 0)) {
    return { workouts: [], format: 'mw', skippedRows: 0, error: 'missing_columns' };
  }

  let skipped = 0;
  const sets: RawSet[] = [];
  for (const cols of records.slice(1)) {
    const col = (i: number) => (i >= 0 ? (cols[i] ?? '').trim() : '');
    const exerciseName = col(iEx);
    const exerciseId = col(iExId);
    const reps = num(col(iReps));
    if ((!exerciseName && !exerciseId) || reps == null) {
      skipped++;
      continue;
    }
    const completed = col(iAt);
    const duration = Math.max(0, Math.round(num(col(iDur)) ?? 0));
    const endIso = toIso(completed);
    let startIso = endIso;
    if (endIso && duration > 0) {
      const start = new Date(new Date(endIso).getTime() - duration * 1000);
      if (!Number.isNaN(start.getTime())) startIso = start.toISOString();
    }
    const rowUnit = col(iUnit).toLowerCase();
    const weightRaw = num(col(iWeight));
    const kg = rowUnit === 'kg' ? weightRaw : rowUnit ? null : units === 'metric' ? weightRaw : null;
    const lbs =
      rowUnit === 'lbs' || rowUnit === 'lb'
        ? weightRaw
        : rowUnit
          ? null
          : units === 'imperial'
            ? weightRaw
            : null;
    const workoutId = col(iId);
    const workoutName = col(iName) || 'Imported workout';
    sets.push({
      workoutKey: workoutId || `${workoutName}|${completed}`,
      workoutId: workoutId || undefined,
      workoutName,
      startIso,
      endIso,
      durationSeconds: duration,
      exerciseName: exerciseName || exerciseId,
      exerciseId: exerciseId || undefined,
      setIndex: num(col(iSet)) ?? sets.length,
      reps: Math.max(0, Math.round(reps)),
      weight: toWebWeight(kg, lbs, units),
      kind: mapSetType(col(iKind)),
      rpe: rpeNumberToCategory(num(col(iRpe))),
      note: col(iNote) || undefined,
    });
  }

  return { workouts: assembleWorkouts(sets, newId), format: 'mw', skippedRows: skipped };
}

function parseBoostcamp(
  records: string[][],
  units: UnitsPref,
  newId: () => string
): CsvImportResult {
  const idx = headerIndex(records[0]);
  const iDate = idx('date', 'session_date', 'session_finished_at');
  const iName = idx('workout', 'session_title', 'session_name');
  const iWeek = idx('week', 'session_week');
  const iDay = idx('day', 'session_day');
  const iEx = idx('exercise', 'exercise_name');
  const iSet = idx('set', 'set_index');
  const iWeight = idx('archived_weight', 'set_value_weight', 'weight');
  const iReps = idx('archived_reps', 'set_amount_reps', 'reps');
  const iUnit = idx('unit', 'set_weight_unit', 'weight_unit');
  const iRpe = idx('archived_rpe', 'rpe');
  const iSkip = idx('set_skipped', 'skipped');
  const iWarm = idx('iswarmup', 'set_iswarmup', 'is_warmup');
  if (iEx < 0 || iDate < 0) {
    return { workouts: [], format: 'boostcamp', skippedRows: 0, error: 'missing_columns' };
  }

  let skipped = 0;
  const sets: RawSet[] = [];
  for (const cols of records.slice(1)) {
    const col = (i: number) => (i >= 0 ? (cols[i] ?? '').trim() : '');
    if (iSkip >= 0 && isTruthyFlag(col(iSkip))) {
      skipped++;
      continue;
    }
    const exerciseName = col(iEx);
    const reps = num(col(iReps));
    if (!exerciseName || reps == null) {
      skipped++;
      continue;
    }
    const rowUnit = col(iUnit);
    const date = col(iDate);
    const startIso = parseBoostcampDate(date, rowUnit);
    const week = col(iWeek);
    const day = col(iDay);
    const workoutName =
      col(iName) || [week, day].filter(Boolean).join(' ').trim() || 'Imported workout';
    const weightRaw = num(col(iWeight));
    const u = rowUnit.toLowerCase();
    const kg = u === 'kg' ? weightRaw : u ? null : units === 'metric' ? weightRaw : null;
    const lbs =
      u === 'lbs' || u === 'lb' ? weightRaw : u ? null : units === 'imperial' ? weightRaw : null;
    sets.push({
      workoutKey: `${workoutName}|${date}`,
      workoutName,
      startIso,
      endIso: startIso,
      durationSeconds: 0,
      exerciseName,
      setIndex: num(col(iSet)) ?? sets.length,
      reps: Math.max(0, Math.round(reps)),
      weight: toWebWeight(kg, lbs, units),
      kind: iWarm >= 0 && isTruthyFlag(col(iWarm)) ? 'warmup' : 'normal',
      rpe: rpeNumberToCategory(num(col(iRpe))),
    });
  }

  return { workouts: assembleWorkouts(sets, newId), format: 'boostcamp', skippedRows: skipped };
}

export function csvEscape(value: string): string {
  if (!/[",\n]/.test(value)) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

/**
 * Portable MW CSV — same columns as Android `WorkoutTransfer.toMwCsv`.
 * Re-importing this file is a no-op against the history it came from.
 */
export function workoutsToMwCsv(workouts: CompletedWorkoutLog[], units: UnitsPref): string {
  const unit = units === 'imperial' ? 'lb' : 'kg';
  const lines = [MW_CSV_HEADER];
  for (const w of workouts) {
    if (w.deletedAt) continue;
    for (const ex of w.exercises) {
      ex.sets.forEach((s, i) => {
        const rpe = rpeCategoryToNumber(s.rpe);
        lines.push(
          [
            w.id,
            w.workoutName,
            w.completedAt,
            String(w.durationSeconds),
            unit,
            ex.exerciseId,
            exerciseNameForId(ex.exerciseId),
            String(i),
            String(s.reps),
            String(s.weight),
            rpe != null ? String(rpe) : '',
            s.kind ?? 'normal',
            ex.note ?? '',
            '',
          ]
            .map((cell) => csvEscape(String(cell)))
            .join(',')
        );
      });
    }
  }
  return `${lines.join('\n')}\n`;
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

/** Parse a Strong, Hevy, Boostcamp, or Mission Winning CSV. Format from the header, never the filename. */
export function parseWorkoutCsv(
  text: string,
  units: UnitsPref,
  newId: () => string = defaultNewId
): CsvImportResult {
  const body = stripBom(text);
  const format = detectCsvFormat(body);
  if (!format) return { workouts: [], format: null, skippedRows: 0, error: 'unrecognized_format' };
  const records = splitCsvRecords(body);
  if (records.length < 2) return { workouts: [], format, skippedRows: 0, error: 'no_data_rows' };
  if (format === 'hevy') return parseHevy(records, units, newId);
  if (format === 'strong') return parseStrong(records, units, newId);
  if (format === 'mw') return parseMw(records, units, newId);
  return parseBoostcamp(records, units, newId);
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
