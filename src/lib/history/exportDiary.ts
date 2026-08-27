/**
 * Export this diary (`.1011`).
 *
 * File out of the live History diary. Empty / missing invents nothing.
 * Tombs stay out. Start-from does not shrink the file. Search does not
 * shrink the file. Not a Feed. Pure: no store.
 */

import type { CompletedWorkoutLog } from '@/types';
import { liveLogDateKey, liveSessionLogs } from '@/lib/history/liveLogs';
import { humanizeExerciseId } from '@/lib/workout/customExercise';

export const EXPORT_DIARY_CSV_HEADER =
  'date,sessionTitle,workoutName,lift,setType,kg,reps,rpe,tags,notes,duration';

export const EXPORT_DIARY_CSV_NAME = 'mission-winning-diary.csv';
export const EXPORT_DIARY_JSON_NAME = 'mission-winning-diary.json';

export type ExportDiaryRow = {
  date: string;
  sessionTitle: string;
  workoutName: string;
  lift: string;
  setType: string;
  kg: string;
  reps: string;
  rpe: string;
  tags: string;
  notes: string;
  duration: string;
};

export type ExportDiaryDecision =
  | { kind: 'empty' }
  | {
      kind: 'ready';
      rows: ExportDiaryRow[];
      csv: string;
      json: string;
      count: number;
    };

function textCell(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function numberCell(value: unknown): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '';
  return String(value);
}

function csvEscape(value: string): string {
  if (!/[",\n]/.test(value)) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

function kindTag(kind: unknown): string {
  if (kind === 'warmup') return 'W';
  if (kind === 'drop') return 'D';
  if (kind === 'failure') return 'F';
  return '';
}

function sideTag(side: unknown): string {
  if (side === 'L' || side === 'R' || side === 'Alt') return side;
  return '';
}

function rpeCell(set: { rpe10?: number; rpe?: string }): string {
  if (typeof set.rpe10 === 'number' && Number.isFinite(set.rpe10)) {
    return String(set.rpe10);
  }
  return textCell(set.rpe);
}

function tagsCell(set: { kind?: string; side?: string }): string {
  return [kindTag(set.kind), sideTag(set.side)].filter(Boolean).join(' ');
}

function notesCell(sessionNote: unknown, exerciseNote: unknown): string {
  return [textCell(sessionNote), textCell(exerciseNote)].filter(Boolean).join(' | ');
}

function durationCell(
  sessionDuration: number,
  setDuration: unknown
): string {
  if (typeof setDuration === 'number' && Number.isFinite(setDuration) && setDuration > 0) {
    return String(setDuration);
  }
  if (sessionDuration > 0) return String(sessionDuration);
  return '';
}

function rowsFromLog(log: CompletedWorkoutLog): ExportDiaryRow[] {
  const date = liveLogDateKey(log);
  const sessionTitle = textCell(log.sessionTitle);
  const workoutName = textCell(log.workoutName);
  const sessionNote = log.sessionNote;
  const sessionDuration =
    typeof log.durationSeconds === 'number' && Number.isFinite(log.durationSeconds)
      ? log.durationSeconds
      : 0;
  const out: ExportDiaryRow[] = [];
  for (const ex of log.exercises ?? []) {
    if (!ex?.exerciseId) continue;
    const lift = humanizeExerciseId(ex.exerciseId);
    if (!lift) continue;
    for (const set of ex.sets ?? []) {
      if (!set) continue;
      out.push({
        date,
        sessionTitle,
        workoutName,
        lift,
        setType: textCell(set.kind),
        kg: numberCell(set.weight),
        reps: numberCell(set.reps),
        rpe: rpeCell(set),
        tags: tagsCell(set),
        notes: notesCell(sessionNote, ex.note),
        duration: durationCell(sessionDuration, set.durationSeconds),
      });
    }
  }
  return out;
}

function toCsv(rows: readonly ExportDiaryRow[]): string {
  const lines = [EXPORT_DIARY_CSV_HEADER];
  for (const row of rows) {
    lines.push(
      [
        row.date,
        row.sessionTitle,
        row.workoutName,
        row.lift,
        row.setType,
        row.kg,
        row.reps,
        row.rpe,
        row.tags,
        row.notes,
        row.duration,
      ]
        .map((cell) => csvEscape(cell))
        .join(',')
    );
  }
  return `${lines.join('\n')}\n`;
}

export function decideExportDiary(
  logs: readonly CompletedWorkoutLog[] | null | undefined
): ExportDiaryDecision {
  const live = liveSessionLogs(logs);
  const rows: ExportDiaryRow[] = [];
  for (const item of live) {
    rows.push(...rowsFromLog(item));
  }
  if (rows.length === 0) return { kind: 'empty' };
  return {
    kind: 'ready',
    rows,
    csv: toCsv(rows),
    json: `${JSON.stringify(rows, null, 2)}\n`,
    count: rows.length,
  };
}
