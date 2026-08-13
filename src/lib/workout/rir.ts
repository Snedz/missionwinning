/**
 * Optional reps-in-reserve on a logged set (`.725`).
 *
 * Scale is integer **0–5** (0 = no reps left; 5 = easy reserve). The repo had no
 * RIR field; 0–10 is rejected because it collides mentally with Android/API RPE
 * 6–10. Empty is valid. RIR never replaces categorical RPE and is never required
 * to Log set.
 */

export const RIR_MIN = 0;
export const RIR_MAX = 5;
export const RIR_VALUES = [0, 1, 2, 3, 4, 5] as const;

export type Rir = (typeof RIR_VALUES)[number];

/**
 * Boundary parse. Empty / omitted → `undefined`. Out of range, non-integer,
 * and NaN are dropped — never clamped into a number the athlete did not give.
 */
export function parseOptionalRir(value: unknown): number | undefined {
  if (value == null) return undefined;
  if (typeof value === 'boolean') return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return undefined;
    const n = Number(trimmed);
    if (!Number.isInteger(n) || n < RIR_MIN || n > RIR_MAX) return undefined;
    return n;
  }
  if (typeof value !== 'number') return undefined;
  if (!Number.isInteger(value) || value < RIR_MIN || value > RIR_MAX) return undefined;
  return value;
}
