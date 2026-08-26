/**
 * Our export comes back (`.1013`).
 *
 * Confirm-gated file-in of the History diary `.1011` just saved.
 * Empty / missing / unreadable invents nothing. Preview never writes.
 * Merge/upsert is the default confirm. Replace is a second named confirm.
 * Tombs stay tombs unless the file has that live row. Pure: no store.
 */

import { EXERCISES, getExerciseById } from '@/data/exercises';
import { isLocalDateKey, localDateKeyFromIso } from '@/lib/time/localDate';
import { localInstantFromDateAndTime } from '@/lib/workout/backfillSession';
import { humanizeExerciseId } from '@/lib/workout/customExercise';
import { countsTowardVolume, type SetKind } from '@/lib/workout/setKind';
import { resolveSetRowType, setRowVolume } from '@/lib/workout/setRowType';
import type { SetSide } from '@/lib/workout/unilateral';
import type { CompletedWorkoutLog } from '@/types';
import {
  EXPORT_DIARY_CSV_HEADER,
  type ExportDiaryRow,
} from '@/lib/history/exportDiary';

export type ImportDiarySession = {
  date: string;
  sessionTitle: string;
  workoutName: string;
  sessionNote: string;
  durationSeconds: number;
  exercises: ImportDiaryExercise[];
};

export type ImportDiaryExercise = {
  exerciseId: string;
  note?: string;
  sets: ImportDiarySet[];
};

export type ImportDiarySet = {
  reps: number;
  weight: number;
  kind?: SetKind;
  rpe?: 'easy' | 'med' | 'hard';
  rpe10?: number;
  side?: SetSide;
  durationSeconds?: number;
};

export type ImportDiaryDecision =
  | { kind: 'empty' }
  | {
      kind: 'ready';
      rows: ExportDiaryRow[];
      sessions: ImportDiarySession[];
      count: number;
    };

export type ImportDiaryConfirm =
  | 'merge'
  | 'replace'
  | 'replace-confirmed'
  | 'cancel';

export type ImportDiaryApplyDecision =
  | { kind: 'empty' }
  | { kind: 'needs-replace-confirm'; incoming: number; live: number }
  | {
      kind: 'apply';
      next: CompletedWorkoutLog[];
      mode: 'merge' | 'replace';
    };

const EMPTY: ImportDiaryDecision = { kind: 'empty' };
const HEADER_CELLS = EXPORT_DIARY_CSV_HEADER.split(',');

function stampNow(): string {
  const d = new Date();
  const pad = (n: number, w = 2) => String(n).padStart(w, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}.${pad(d.getUTCMilliseconds(), 3)}Z`;
}

function textCell(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function parseCsv(text: string): string[][] | null {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 1;
          continue;
        }
        quoted = false;
        continue;
      }
      cell += ch;
      continue;
    }
    if (ch === '"') {
      quoted = true;
      continue;
    }
    if (ch === ',') {
      row.push(cell);
      cell = '';
      continue;
    }
    if (ch === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      continue;
    }
    if (ch === '\r') continue;
    cell += ch;
  }
  if (quoted) return null;
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function asExportRow(raw: unknown): ExportDiaryRow | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const date = textCell(o.date);
  const lift = textCell(o.lift);
  if (!isLocalDateKey(date) || !lift) return null;
  return {
    date,
    sessionTitle: textCell(o.sessionTitle),
    workoutName: textCell(o.workoutName),
    lift,
    setType: textCell(o.setType),
    kg: textCell(o.kg),
    reps: textCell(o.reps),
    rpe: textCell(o.rpe),
    tags: textCell(o.tags),
    notes: textCell(o.notes),
    duration: textCell(o.duration),
  };
}

function rowsFromCsv(text: string): ExportDiaryRow[] | null {
  const table = parseCsv(text);
  if (!table || table.length === 0) return null;
  const header = (table[0] ?? []).map((cell) => cell.trim());
  if (header.length < HEADER_CELLS.length) return null;
  if (HEADER_CELLS.some((name, i) => header[i] !== name)) return null;
  const rows: ExportDiaryRow[] = [];
  for (const cells of table.slice(1)) {
    if (cells.every((cell) => textCell(cell) === '')) continue;
    const raw: Record<string, string> = {};
    for (let i = 0; i < HEADER_CELLS.length; i += 1) {
      raw[HEADER_CELLS[i] ?? ''] = cells[i] ?? '';
    }
    const row = asExportRow(raw);
    if (row) rows.push(row);
  }
  return rows;
}

function rowsFromJson(text: string): ExportDiaryRow[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;
  const rows: ExportDiaryRow[] = [];
  for (const item of parsed) {
    const row = asExportRow(item);
    if (row) rows.push(row);
  }
  return rows;
}

function resolveLiftId(lift: string): string | null {
  const name = lift.trim();
  if (!name) return null;
  const lower = name.toLowerCase();
  const byHuman = EXERCISES.find((ex) => humanizeExerciseId(ex.id) === name);
  if (byHuman) return byHuman.id;
  const byName = EXERCISES.find((ex) => ex.name.trim().toLowerCase() === lower);
  if (byName) return byName.id;
  const slug = lower.replace(/[_\s]+/g, '-').replace(/-+/g, '-');
  const byId = EXERCISES.find((ex) => ex.id === slug);
  if (byId) return byId.id;
  return slug || null;
}

function parseKind(raw: string): SetKind | undefined {
  if (raw === 'warmup' || raw === 'drop' || raw === 'failure' || raw === 'normal') {
    return raw;
  }
  return undefined;
}

function parseSide(tags: string): SetSide | undefined {
  const parts = tags.trim().split(/\s+/);
  if (parts.includes('L')) return 'L';
  if (parts.includes('R')) return 'R';
  if (parts.includes('Alt') || parts.includes('alt')) return 'alt';
  return undefined;
}

function parseRpe(raw: string): Pick<ImportDiarySet, 'rpe' | 'rpe10'> {
  const text = raw.trim();
  if (!text) return {};
  if (text === 'easy' || text === 'med' || text === 'hard') return { rpe: text };
  const n = Number(text);
  if (Number.isInteger(n) && n >= 1 && n <= 10) return { rpe10: n };
  return {};
}

function parseNumberCell(raw: string): number {
  if (!raw.trim()) return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function durationValue(raw: string): number {
  const n = parseNumberCell(raw);
  return n > 0 ? n : 0;
}

function isHoldRow(row: ExportDiaryRow): boolean {
  const kg = parseNumberCell(row.kg);
  const reps = parseNumberCell(row.reps);
  return durationValue(row.duration) > 0 && kg <= 0 && reps <= 0;
}

function splitNotes(rows: readonly ExportDiaryRow[]): {
  sessionNote: string;
  perRow: string[];
} {
  const notes = rows.map((row) => row.notes.trim());
  if (notes.every((note) => note === '')) return { sessionNote: '', perRow: notes };
  if (notes.every((note) => note === notes[0])) {
    const shared = notes[0] ?? '';
    const idx = shared.indexOf(' | ');
    if (idx >= 0) {
      return {
        sessionNote: shared.slice(0, idx),
        perRow: notes.map(() => shared.slice(idx + 3)),
      };
    }
    return { sessionNote: shared, perRow: notes.map(() => '') };
  }
  const heads = notes.map((note) => {
    const idx = note.indexOf(' | ');
    return idx >= 0 ? note.slice(0, idx) : '';
  });
  const common = heads[0] && heads.every((head) => head === heads[0]) ? heads[0] : '';
  if (common) {
    return {
      sessionNote: common,
      perRow: notes.map((note) =>
        note.startsWith(`${common} | `) ? note.slice(common.length + 3) : note
      ),
    };
  }
  return { sessionNote: '', perRow: notes };
}

function groupSessions(rows: readonly ExportDiaryRow[]): ExportDiaryRow[][] {
  const groups: ExportDiaryRow[][] = [];
  for (const row of rows) {
    const last = groups[groups.length - 1];
    const head = last?.[0];
    if (
      head &&
      head.date === row.date &&
      head.sessionTitle === row.sessionTitle &&
      head.workoutName === row.workoutName
    ) {
      last.push(row);
    } else {
      groups.push([row]);
    }
  }
  return groups;
}

function sessionFromRows(rows: readonly ExportDiaryRow[]): ImportDiarySession | null {
  const head = rows[0];
  if (!head || !isLocalDateKey(head.date)) return null;
  const notes = splitNotes(rows);
  const holdFlags = rows.map((row) => isHoldRow(row));
  const workDurations = rows
    .map((row, i) => (holdFlags[i] ? 0 : durationValue(row.duration)))
    .filter((n) => n > 0);
  const sessionDuration =
    workDurations.length > 0 && workDurations.every((n) => n === workDurations[0])
      ? workDurations[0]
      : 0;

  const exercises: ImportDiaryExercise[] = [];
  let current: ImportDiaryExercise | null = null;
  let currentLift = '';

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (!row) continue;
    const exerciseId = resolveLiftId(row.lift);
    if (!exerciseId) continue;
    const set: ImportDiarySet = {
      reps: parseNumberCell(row.reps),
      weight: parseNumberCell(row.kg),
      ...parseRpe(row.rpe),
    };
    const kind = parseKind(row.setType);
    if (kind) set.kind = kind;
    const side = parseSide(row.tags);
    if (side) set.side = side;
    const hold = durationValue(row.duration);
    if (holdFlags[i] && hold > 0) set.durationSeconds = hold;

    const note = notes.perRow[i] ?? '';
    if (!current || currentLift !== row.lift) {
      current = { exerciseId, sets: [] };
      if (note) current.note = note;
      exercises.push(current);
      currentLift = row.lift;
    } else if (note && !current.note) {
      current.note = note;
    }
    current.sets.push(set);
  }

  if (exercises.length === 0) return null;
  return {
    date: head.date,
    sessionTitle: head.sessionTitle,
    workoutName: head.workoutName,
    sessionNote: notes.sessionNote,
    durationSeconds: sessionDuration,
    exercises,
  };
}

export function decideImportDiary(
  text: string | null | undefined
): ImportDiaryDecision {
  if (typeof text !== 'string') return EMPTY;
  const body = text.replace(/^\uFEFF/, '').trim();
  if (!body) return EMPTY;

  let rows: ExportDiaryRow[] | null = null;
  if (body.startsWith('[')) {
    rows = rowsFromJson(body);
  } else if (body.startsWith(EXPORT_DIARY_CSV_HEADER) || body.startsWith('date,sessionTitle')) {
    rows = rowsFromCsv(body);
  }
  if (!rows || rows.length === 0) return EMPTY;

  const sessions: ImportDiarySession[] = [];
  for (const group of groupSessions(rows)) {
    const session = sessionFromRows(group);
    if (session) sessions.push(session);
  }
  if (sessions.length === 0) return EMPTY;
  return { kind: 'ready', rows, sessions, count: rows.length };
}

function identityKey(date: string, title: string, name: string): string {
  return `${date}\u0000${title}\u0000${name}`;
}

function sessionIdentity(session: ImportDiarySession): string {
  return identityKey(session.date, session.sessionTitle, session.workoutName);
}

function logIdentity(log: CompletedWorkoutLog): string {
  const date = localDateKeyFromIso(log.completedAt || log.startedAt) ?? '';
  return identityKey(date, (log.sessionTitle ?? '').trim(), (log.workoutName ?? '').trim());
}

function volumeOf(exercises: ImportDiaryExercise[]): number {
  return exercises.reduce((sum, ex) => {
    const type = resolveSetRowType(getExerciseById(ex.exerciseId) ?? { id: ex.exerciseId });
    const work = ex.sets.filter((set) => countsTowardVolume(set.kind));
    return sum + work.reduce((n, set) => n + setRowVolume(set, type), 0);
  }, 0);
}

function exercisesForLog(session: ImportDiarySession): CompletedWorkoutLog['exercises'] {
  return session.exercises.map((ex) => {
    const catalog = getExerciseById(ex.exerciseId);
    return {
      exerciseId: ex.exerciseId,
      sets: ex.sets.map((set) => ({ ...set })),
      ...(ex.note ? { note: ex.note } : {}),
      ...(catalog?.muscleGroups ? { muscleGroups: [...catalog.muscleGroups] } : {}),
    };
  });
}

function clockFor(session: ImportDiarySession): { startedAt: string; completedAt: string } {
  const noon = localInstantFromDateAndTime(session.date, '12:00') ?? `${session.date}T12:00:00.000Z`;
  return { startedAt: noon, completedAt: noon };
}

function toLog(
  session: ImportDiarySession,
  ids: { id: string; clientId: string },
  now: string,
  prior?: CompletedWorkoutLog
): CompletedWorkoutLog {
  const clock = clockFor(session);
  const next: CompletedWorkoutLog = {
    id: prior?.id ?? ids.id,
    clientId: prior?.clientId ?? ids.clientId,
    revision: (prior?.revision ?? 0) + 1,
    updatedAt: now,
    deletedAt: null,
    workoutName: session.workoutName,
    startedAt: prior?.startedAt ?? clock.startedAt,
    completedAt: prior?.completedAt ?? clock.completedAt,
    durationSeconds: session.durationSeconds,
    exercises: exercisesForLog(session),
    totalVolume: volumeOf(session.exercises),
  };
  if (session.sessionTitle) next.sessionTitle = session.sessionTitle;
  else if (prior?.sessionTitle) next.sessionTitle = prior.sessionTitle;
  if (session.sessionNote) next.sessionNote = session.sessionNote;
  else if (prior?.sessionNote) next.sessionNote = prior.sessionNote;
  return next;
}

function liveLogs(history: readonly CompletedWorkoutLog[] | null | undefined): CompletedWorkoutLog[] {
  if (!Array.isArray(history)) return [];
  return history.filter((log) => Boolean(log) && !log.deletedAt);
}

export function decideImportApply(input: {
  history?: readonly CompletedWorkoutLog[] | null;
  parsed?: ImportDiaryDecision | null;
  confirm?: ImportDiaryConfirm | null;
  ids?: () => { id: string; clientId: string };
  now?: string;
}): ImportDiaryApplyDecision {
  const parsed = input.parsed;
  if (!parsed || parsed.kind !== 'ready') return { kind: 'empty' };
  const confirm = input.confirm;
  if (confirm !== 'merge' && confirm !== 'replace' && confirm !== 'replace-confirmed') {
    return { kind: 'empty' };
  }
  const history = Array.isArray(input.history) ? [...input.history] : [];
  if (confirm === 'replace') {
    return {
      kind: 'needs-replace-confirm',
      incoming: parsed.sessions.length,
      live: liveLogs(history).length,
    };
  }

  const mint = input.ids;
  const now = input.now ?? stampNow();
  const used = new Set<string>();
  const byId = new Map<string, CompletedWorkoutLog>();
  for (const row of history) {
    if (row?.id) byId.set(row.id, row);
  }

  const pickMatch = (session: ImportDiarySession): CompletedWorkoutLog | undefined => {
    const key = sessionIdentity(session);
    const liveHit = history.find(
      (row) => row && !row.deletedAt && !used.has(row.id) && logIdentity(row) === key
    );
    if (liveHit) return liveHit;
    return history.find(
      (row) => row && row.deletedAt && !used.has(row.id) && logIdentity(row) === key
    );
  };

  const incoming: CompletedWorkoutLog[] = [];
  let n = 0;
  for (const session of parsed.sessions) {
    const prior = pickMatch(session);
    if (prior) {
      used.add(prior.id);
      incoming.push(toLog(session, { id: prior.id, clientId: prior.clientId ?? prior.id }, now, prior));
      continue;
    }
    n += 1;
    const minted = mint?.() ?? { id: `log-import-${n}`, clientId: `cid-import-${n}` };
    incoming.push(toLog(session, minted, now));
  }

  if (confirm === 'merge') {
    const next = history.map((row) => {
      const updated = incoming.find((item) => item.id === row.id);
      return updated ?? row;
    });
    for (const item of incoming) {
      if (!byId.has(item.id)) next.unshift(item);
    }
    return { kind: 'apply', next, mode: 'merge' };
  }

  const next: CompletedWorkoutLog[] = [];
  for (const row of history) {
    const updated = incoming.find((item) => item.id === row.id);
    if (updated) {
      next.push(updated);
      continue;
    }
    if (row.deletedAt) {
      next.push(row);
      continue;
    }
    next.push({
      ...row,
      deletedAt: now,
      revision: (row.revision ?? 0) + 1,
      updatedAt: now,
    });
  }
  for (const item of incoming) {
    if (!byId.has(item.id)) next.unshift(item);
  }
  return { kind: 'apply', next, mode: 'replace' };
}
