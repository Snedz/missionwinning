/**
 * Optional 1–10 RPE on a logged set (`.967`).
 *
 * Scale is integer **1–10** (Strong / Boostcamp tracker grammar). Empty is
 * valid. Out of range is dropped — never clamped into a number the athlete
 * did not give. `rpe10` never replaces categorical `rpe` (easy/med/hard) and
 * is never required to Log set. Do not invent a 1–10 from Easy/Med/Hard.
 */

export const RPE10_MIN = 1;
export const RPE10_MAX = 10;
export const RPE10_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export type Rpe10 = (typeof RPE10_VALUES)[number];

/**
 * Boundary parse. Empty / omitted → `undefined`. Out of range, non-integer,
 * and NaN are dropped — never clamped.
 */
export function parseOptionalRpe10(value: unknown): number | undefined {
  if (value == null) return undefined;
  if (typeof value === 'boolean') return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return undefined;
    const n = Number(trimmed);
    if (!Number.isInteger(n) || n < RPE10_MIN || n > RPE10_MAX) return undefined;
    return n;
  }
  if (typeof value !== 'number') return undefined;
  if (!Number.isInteger(value) || value < RPE10_MIN || value > RPE10_MAX) return undefined;
  return value;
}
