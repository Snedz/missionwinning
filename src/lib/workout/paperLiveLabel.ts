/**
 * Labels data rows as Paper or Live for the workout system.
 * Used to distinguish training plan versions from live workouts.
 */

export type RowKind = 'paper' | 'live';

/**
 * Labels a row with the appropriate prefix.
 * - paper → "[Paper] " + body
 * - live → "[Live] " + body
 * Empty body still returns the prefix with trailing space.
 */
export function labelRow(kind: RowKind, body: string): string {
  const prefix = kind === 'paper' ? '[Paper] ' : '[Live] ';
  return prefix + body;
}

export type LiveAuthEvidence = {
  liveLabelAuthorized: boolean | null | undefined;
  reviewerPass: boolean | null | undefined;
  scopeMatches: boolean | null | undefined;
  decisionFinal: boolean | null | undefined;
};

/**
 * Fail-closed gate: returns true only when every field is strictly `true`.
 * Absent, null, undefined, or false → false.
 */
export function isLiveAuthorized(evidence: LiveAuthEvidence): boolean {
  return (
    evidence.liveLabelAuthorized === true &&
    evidence.reviewerPass === true &&
    evidence.scopeMatches === true &&
    evidence.decisionFinal === true
  );
}
