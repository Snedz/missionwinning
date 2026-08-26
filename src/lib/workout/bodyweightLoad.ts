/**
 * Bodyweight + added load on one set row (dip + belt, pull-up + vest).
 *
 * `LoggedSet.weight` on a plus-load exercise is the extra (belt/vest), not a
 * bar. Zero is skip — BW only, still a working set. Warmups stay `kind`.
 *
 * Frozen: docs/overnight/PLAN.md (.735).
 */

export type PlusLoadExercise = {
  id?: string;
  equipment?: string;
};

function equipmentLooksBodyweight(equipment?: string): boolean {
  if (!equipment) return false;
  const eq = equipment.trim().toLowerCase();
  return eq === 'bodyweight' || eq.startsWith('bodyweight');
}

function idLooksDip(id?: string): boolean {
  if (!id) return false;
  return id.toLowerCase().includes('dip');
}

/** Pull-ups, push-ups, dips — not barbell/DB/machine. */
export function isPlusLoadExercise(ex?: PlusLoadExercise | null): boolean {
  if (!ex) return false;
  return equipmentLooksBodyweight(ex.equipment) || idLooksDip(ex.id);
}

export type FormatSetLoadLineOpts = {
  reps: number;
  weight: number;
  unitLabel: string;
  bodyweightLabel?: string;
  plusLoad?: boolean;
};

/**
 * One home for how a set reads.
 *
 * Plus-load: `8 × BW` or `8 × BW + 20 kg`. Barbell unchanged (`5 × 100 kg`).
 * Weight ≤ 0 without plus-load still prints BW (empty logged load).
 */
export function formatSetLoadLine(opts: FormatSetLoadLineOpts): string {
  const bw = opts.bodyweightLabel ?? 'BW';
  const reps = opts.reps;
  const weight = opts.weight;
  if (opts.plusLoad) {
    if (!Number.isFinite(weight) || weight <= 0) return `${reps} × ${bw}`;
    return `${reps} × ${bw} + ${weight} ${opts.unitLabel}`;
  }
  if (!Number.isFinite(weight) || weight <= 0) return `${reps} × ${bw}`;
  return `${reps} × ${weight} ${opts.unitLabel}`;
}

/** Compact prev cell: `8 × BW` / `8 × BW+20` so the 5.5rem slot still fits. */
export function formatPlusLoadWeightCell(weight: number, bodyweightLabel = 'BW'): string {
  if (!Number.isFinite(weight) || weight <= 0) return bodyweightLabel;
  return `${bodyweightLabel}+${weight}`;
}

/** Completed kg cell. Empty load is BW, not 0. Barbell loaded stays the number. */
export function formatCompletedWeightCell(
  weight: number,
  bodyweightLabel: string,
  plusLoad: boolean
): string {
  if (!Number.isFinite(weight) || weight <= 0) return bodyweightLabel;
  if (plusLoad) return formatPlusLoadWeightCell(weight, bodyweightLabel);
  return String(weight);
}

export function formatPrevPlusLoadLabel(
  reps: number,
  weight: number,
  bodyweightLabel = 'BW'
): string {
  return `${reps} × ${formatPlusLoadWeightCell(weight, bodyweightLabel)}`;
}
