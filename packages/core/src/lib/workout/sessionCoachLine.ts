/**
 * One trainer sentence for the open set (.1114).
 *
 * Rules are the source. Speech and the model are not. Every token is a
 * field already on the dial: set index, name, kind, load, reps, or a
 * hold. A blank name is silence. An empty barbell is not bodyweight and
 * is not `0 kg`.
 *
 * Sentence shape follows two license-fit peers, not their code:
 * yuhonas/free-exercise-db (Unlicense) keeps the first short sentence or
 * nothing (`cueFromInstructions`). lyuhiroyama/sets-n-reps (MIT) treats a
 * set as the weight and reps on the row, and a null weight stays unset.
 */

import { activeCoachTipKind } from '@/lib/workout/activeSessionView';
import { formatSetRowDuration, formatSetRowLine } from '@/lib/workout/setRowType';
import type { SetKind, SetRowType } from '@/types';

export type SessionCoachLineInput = {
  exerciseName: string;
  /** 1-based index among this exercise's sets. */
  setNumber: number;
  setCount: number;
  reps: number;
  weight: number;
  unitLabel: string;
  kind?: SetKind;
  rowType: SetRowType;
  durationSeconds?: number;
  /** Completed sets already marked hard. The tank line uses `activeCoachTipKind`. */
  hardCount: number;
  bodyweightLabel?: string;
};

function positive(n: number): boolean {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

function loadToken(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  return String(rounded);
}

function head(kind: SetKind | undefined, setNumber: number, setCount: number): string {
  const place = `Set ${setNumber} of ${setCount}.`;
  if (kind === 'warmup') return `Warm-up. ${place}`;
  if (kind === 'drop') return `Drop. ${place}`;
  if (kind === 'failure') return `Last clean rep. ${place}`;
  return place;
}

/** Work sets only. Warm-up, drop, and last-clean-rep already say what they are. */
function tankClause(kind: SetKind | undefined, hardCount: number): string {
  if (kind === 'warmup' || kind === 'drop' || kind === 'failure') return '';
  if (activeCoachTipKind(hardCount) !== 'high') return '';
  return ' Leave a little if the bar slows.';
}

function loadClause(input: SessionCoachLineInput): string {
  const unit = input.unitLabel.trim();
  const bw = (input.bodyweightLabel ?? 'BW').trim() || 'BW';

  if (input.rowType === 'duration') {
    const shown = formatSetRowDuration(input.durationSeconds ?? 0);
    if (shown) return `${shown}.`;
    if (positive(input.reps)) return `${loadToken(input.reps)} reps.`;
    return '';
  }

  if (input.rowType === 'bodyweight' || input.rowType === 'assisted') {
    if (!positive(input.reps) && positive(input.weight)) {
      if (input.rowType === 'assisted') {
        return unit
          ? `${loadToken(input.weight)} ${unit} assistance.`
          : `${loadToken(input.weight)} assistance.`;
      }
      return unit ? `${bw} + ${loadToken(input.weight)} ${unit}.` : `${bw} + ${loadToken(input.weight)}.`;
    }
    if (!positive(input.reps)) return '';
    const line = formatSetRowLine({
      type: input.rowType,
      reps: input.reps,
      weight: input.weight,
      unitLabel: unit,
      bodyweightLabel: bw,
      durationSeconds: input.durationSeconds,
    });
    return line ? `${line}.` : '';
  }

  if (positive(input.weight) && positive(input.reps)) {
    return unit
      ? `${loadToken(input.weight)} ${unit} for ${loadToken(input.reps)}.`
      : `${loadToken(input.weight)} for ${loadToken(input.reps)}.`;
  }
  if (positive(input.weight)) {
    return unit ? `${loadToken(input.weight)} ${unit}.` : `${loadToken(input.weight)}.`;
  }
  if (positive(input.reps)) return `${loadToken(input.reps)} reps.`;
  return '';
}

/** Null when there is no open set to state. Does not invent a load. */
export function sessionCoachLine(input: SessionCoachLineInput): string | null {
  const name = input.exerciseName.trim().replace(/\s+/g, ' ');
  if (!name) return null;
  if (!Number.isInteger(input.setNumber) || !Number.isInteger(input.setCount)) return null;
  if (input.setNumber < 1 || input.setCount < 1 || input.setNumber > input.setCount) return null;

  const lead = head(input.kind, input.setNumber, input.setCount);
  const load = loadClause(input);
  const sentence = load ? `${lead} ${name}. ${load}` : `${lead} ${name}.`;
  return `${sentence}${tankClause(input.kind, input.hardCount)}`;
}
