/**
 * Field-level comparison of two normalized workout-row objects
 * after a CSV export → re-import.
 *
 * Never claims byte-for-byte equality. Unmapped extra keys are
 * reported as UNVERIFIED, not silent success.
 */

export type NormRow = Record<string, string | number | null>;

export type FieldMismatch = {
  field: string;
  left: string | number | null;
  right: string | number | null;
};

export type EquivResult = {
  equal: boolean;
  mismatches: FieldMismatch[];
  unverified: string[];
};

export const CORE_FIELDS: readonly string[] = [
  'exercise',
  'sets',
  'reps',
  'weight_value',
  'weight_unit',
  'timestamp',
];

function getFieldValue(row: NormRow, field: string): string | number | null {
  const value = row[field];
  // Explicitly return null for missing keys (undefined becomes null)
  return value ?? null;
}

/**
 * Compare two normalized rows field-by-field.
 *
 * - Core fields: strict equality via Object.is. Missing keys count as null.
 * - Extra keys: collected in `unverified` (sorted), never block equality.
 */
export function compareRows(left: NormRow, right: NormRow): EquivResult {
  const mismatches: FieldMismatch[] = [];

  // Compare each core field
  for (const name of CORE_FIELDS) {
    const leftVal = getFieldValue(left, name);
    const rightVal = getFieldValue(right, name);

    // Object.is treats NaN as equal, and distinguishes +0 vs -0
    if (!Object.is(leftVal, rightVal)) {
      mismatches.push({
        field: name,
        left: leftVal,
        right: rightVal,
      });
    }
  }

  // Collect extra keys not in CORE_FIELDS
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  const allKeys = new Set([...leftKeys, ...rightKeys]);

  const unverified = Array.from(allKeys)
    .filter((key) => !CORE_FIELDS.includes(key))
    .sort();

  return {
    equal: mismatches.length === 0,
    mismatches,
    unverified,
  };
}

/**
 * Detects if text falsely claims byte-for-byte round-trip equivalence.
 * Builders must not assert this; helper flags bad copy.
 */
export function claimsByteForByteRoundTrip(text: string): boolean {
  return /\bbyte[- ]for[- ]byte\b/i.test(text);
}
