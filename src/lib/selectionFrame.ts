/**
 * Every cohort number names who it was drawn from.
 *
 * H-09: a retention or adherence figure without a selection frame is not a
 * number we can sign. `unknown: true` is legal and must stay visible in the
 * formatted output — a silent pass is the failure mode the hypothesis named.
 */

export type SelectionFrame = {
  included: string;
  excluded: string;
  unknown: boolean;
};

export type FramedCohort = {
  value: number;
  frame: SelectionFrame;
};

export function frameCohort(value: number, frame: SelectionFrame): FramedCohort {
  if (!Number.isFinite(value)) {
    throw new Error('framed cohort value must be finite');
  }
  if (!frame.included.trim() || !frame.excluded.trim()) {
    throw new Error('selection frame must name included and excluded');
  }
  return { value, frame };
}

/** The frame is part of the output. `unknown=yes` cannot be dropped. */
export function formatFramedCohort(n: FramedCohort): string {
  const unknown = n.frame.unknown ? ' unknown=yes' : '';
  return `${n.value} [included: ${n.frame.included}; excluded: ${n.frame.excluded}${unknown}]`;
}

/** Signed-in week-4 RPC (`mw_week4_retention`). Workout sessions, not working-set weeks. */
export const WEEK4_RPC_FRAME: SelectionFrame = {
  included:
    'signed-in users whose first live workout_logs row is ≥28 days ago (days 21–27 window for retained)',
  excluded: 'guests, tombstoned logs (deleted_at), first workout younger than 28 days',
  unknown: false,
};
