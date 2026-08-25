/**
 * Open set-row type (`.994`).
 *
 * Custom `.992` names a movement. The row still spoke kg × reps.
 * This is the one home for weight · bodyweight reps · duration ·
 * assisted. Empty / unknown stays weight×reps. Vest is extra only —
 * never Track / profile bodyweight.
 */

import type { Exercise, LoggedSet, SetRowType } from '@/types';
import { formatDuration } from '@/lib/utils';
import { formatPrevPlusLoadLabel, formatSetLoadLine } from '@/lib/workout/bodyweightLoad';
import { isCustomExerciseId } from '@/lib/workout/customExercise';

export type { SetRowType };

export const SET_ROW_TYPES = ['weight', 'bodyweight', 'duration', 'assisted'] as const;

const TIME_CUE = /log finish time/i;
const ASSISTED = /assisted/i;
const DURATION_MAX_SECONDS = 86_400;

export type SetRowTypeExercise = {
  id?: string;
  name?: string;
  equipment?: string;
  cues?: string;
  logType?: string;
};

function isSetRowType(raw: string | undefined): raw is SetRowType {
  return SET_ROW_TYPES.includes(raw as SetRowType);
}

function equipmentLooksBodyweight(equipment?: string): boolean {
  if (!equipment) return false;
  const eq = equipment.trim().toLowerCase();
  return eq === 'bodyweight' || eq.startsWith('bodyweight');
}

function idLooksDip(id?: string): boolean {
  if (!id) return false;
  return id.toLowerCase().includes('dip');
}

function idLooksDuration(id?: string): boolean {
  if (!id) return false;
  const key = id.trim().toLowerCase();
  if (key === 'plank' || key.endsWith('-plank')) return true;
  if (key === 'wall-sit') return true;
  if (key.endsWith('-hold')) return true;
  return false;
}

function looksAssisted(ex: SetRowTypeExercise): boolean {
  return ASSISTED.test(ex.id ?? '') || ASSISTED.test(ex.name ?? '');
}

function looksDuration(ex: SetRowTypeExercise): boolean {
  if (idLooksDuration(ex.id)) return true;
  return TIME_CUE.test(ex.cues ?? '');
}

function looksBodyweight(ex: SetRowTypeExercise): boolean {
  return equipmentLooksBodyweight(ex.equipment) || idLooksDip(ex.id);
}

/** Explicit `logType` wins. Else infer. Null / custom leftover → weight. */
export function resolveSetRowType(ex?: SetRowTypeExercise | null): SetRowType {
  if (!ex) return 'weight';
  if (isSetRowType(ex.logType)) return ex.logType;
  if (ex.id && isCustomExerciseId(ex.id)) return 'weight';
  if (looksAssisted(ex)) return 'assisted';
  if (looksDuration(ex)) return 'duration';
  if (looksBodyweight(ex)) return 'bodyweight';
  return 'weight';
}

export function isBodyweightSetRowType(type: SetRowType): boolean {
  return type === 'bodyweight';
}

export type SetRowWork = {
  kind?: string;
  reps?: number;
  durationSeconds?: number;
};

/** Warmup excluded. Reps or a hold/finish time is diary evidence. */
export function setRowHasWork(set: SetRowWork | null | undefined): boolean {
  if (!set || set.kind === 'warmup') return false;
  const reps = Number(set.reps);
  if (Number.isFinite(reps) && reps > 0) return true;
  const hold = Number(set.durationSeconds);
  return Number.isFinite(hold) && hold > 0;
}

export function setRowVolume(set: Pick<LoggedSet, 'reps' | 'weight'>, type: SetRowType): number {
  if (type === 'duration' || type === 'assisted') return 0;
  const reps = Number.isFinite(set.reps) ? set.reps : 0;
  const load = Number.isFinite(set.weight) ? set.weight : 0;
  if (reps <= 0 || load <= 0) return 0;
  return reps * load;
}

/** Seconds. Accepts `45` or `1:30`. Blank / junk → 0. Cap 24h. */
export function parseDurationSeconds(raw: unknown): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return clampDuration(Math.round(raw));
  }
  if (typeof raw !== 'string') return 0;
  const text = raw.trim().replace(',', '.');
  if (!text) return 0;
  const clock = /^(\d{1,3}):([0-5]?\d)$/.exec(text);
  if (clock) {
    const minutes = Number(clock[1]);
    const seconds = Number(clock[2]);
    if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return 0;
    return clampDuration(minutes * 60 + seconds);
  }
  const parsed = Number(text.replace(/[^\d.]/g, ''));
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return clampDuration(Math.round(parsed));
}

function clampDuration(seconds: number): number {
  if (!Number.isFinite(seconds) || seconds <= 0) return 0;
  return Math.min(DURATION_MAX_SECONDS, seconds);
}

export function formatSetRowDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '';
  return formatDuration(Math.round(seconds));
}

export function formatSetRowLine(opts: {
  type: SetRowType;
  reps: number;
  weight: number;
  unitLabel: string;
  bodyweightLabel?: string;
  durationSeconds?: number;
}): string {
  if (opts.type === 'duration') {
    return formatSetRowDuration(opts.durationSeconds ?? 0);
  }
  if (opts.type === 'assisted') {
    const reps = opts.reps;
    if (!Number.isFinite(opts.weight) || opts.weight <= 0) return `${reps} × 0 ${opts.unitLabel}`;
    return `${reps} × −${opts.weight} ${opts.unitLabel}`;
  }
  return formatSetLoadLine({
    reps: opts.reps,
    weight: opts.weight,
    unitLabel: opts.unitLabel,
    bodyweightLabel: opts.bodyweightLabel,
    plusLoad: opts.type === 'bodyweight',
  });
}

export function formatSetRowPrev(opts: {
  type: SetRowType;
  reps: number;
  weight: number;
  durationSeconds?: number;
  bodyweightLabel?: string;
}): string {
  if (opts.type === 'duration') {
    return formatSetRowDuration(opts.durationSeconds ?? 0) || '—';
  }
  if (opts.type === 'assisted') {
    if (!Number.isFinite(opts.weight) || opts.weight <= 0) return `${opts.reps} × 0`;
    return `${opts.reps} × −${opts.weight}`;
  }
  if (opts.type === 'bodyweight') {
    return formatPrevPlusLoadLabel(opts.reps, opts.weight, opts.bodyweightLabel ?? 'BW');
  }
  return `${opts.reps} × ${opts.weight}`;
}

/** Catalog / leftover id only — no name guess. Custom prefix stays weight. */
export function resolveSetRowTypeFromId(id: string | null | undefined): SetRowType {
  const trimmed = String(id ?? '').trim();
  if (!trimmed) return 'weight';
  return resolveSetRowType({ id: trimmed });
}

export function exerciseFromCatalogLike(ex: Exercise | null | undefined): SetRowTypeExercise | null {
  if (!ex) return null;
  return {
    id: ex.id,
    name: ex.name,
    equipment: ex.equipment,
    cues: ex.cues,
    logType: ex.logType,
  };
}
