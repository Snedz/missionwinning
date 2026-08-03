/**
 * Fuel meal-estimate Log button gate (honesty — `.270` / edit-before-log).
 *
 * Low confidence (and optional requireEdit for rough/heuristic sources) must not
 * log until the athlete has touched the draft. Medium/high without requireEdit
 * keep the prior rule: non-empty name only.
 */

export type EstimateLogConfidence = 'low' | 'medium' | 'high';

export type EstimateLogAllowedOpts = {
  name: string;
  confidence?: EstimateLogConfidence;
  /**
   * Parent forces edit-before-log (e.g. NL `source === 'rough'` or photo
   * heuristic) even when confidence is medium.
   */
  requireEdit?: boolean;
  /** True after manual field edit or servings scale other than 1. */
  athleteTouched: boolean;
};

/**
 * Whether the Log meal control may fire for this estimate draft.
 * Pure — UI only maps state into these opts.
 */
export function estimateLogAllowed(opts: EstimateLogAllowedOpts): boolean {
  if (!opts.name.trim()) return false;
  const needsEdit = opts.confidence === 'low' || opts.requireEdit === true;
  if (needsEdit && !opts.athleteTouched) return false;
  return true;
}

/** True when the draft still requires an athlete edit before logging. */
export function estimateLogNeedsAthleteEdit(opts: {
  confidence?: EstimateLogConfidence;
  requireEdit?: boolean;
  athleteTouched: boolean;
}): boolean {
  const needsEdit = opts.confidence === 'low' || opts.requireEdit === true;
  return needsEdit && !opts.athleteTouched;
}
