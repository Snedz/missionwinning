/**
 * Live earn table for the Why-this report.
 *
 * Source of truth is `rewards/catalog.ts` — what this device actually awards.
 * `docs/CLUB_PLAN.md` v1 numbers are planned and not live; the report says so
 * rather than publishing a second table as if it were awarding today.
 */

import {
  DAILY_ACTION_CAPS,
  DAILY_XP_SOFT_CAP,
  XP_BY_ACTION,
} from '@/lib/rewards/catalog';
import type { RewardActionId } from '@/lib/rewards/types';
import type { EarnTableRow } from '@/lib/transparency/types';

export const EARN_EVENT_LABELS: Record<RewardActionId, string> = {
  workout_finish: 'Finished workout',
  weekly_train_goal: 'Weekly train goal',
  fuel_day: 'Fuel day logged',
  pillar_move: 'Move win',
  pillar_mind: 'Mind session',
  pillar_track: 'Track log',
  pillar_learn: 'Learn win',
  challenge_complete: 'Weekly challenge completed',
  journey_first_workout: 'First workout (journey)',
  journey_commissioned: 'Commissioned',
  perfect_week_bonus: 'Perfect week bonus',
};

export const DAILY_XP_SOFT_CAP_LABEL = `Soft daily total ${DAILY_XP_SOFT_CAP} XP`;

export function capLabelForAction(actionId: RewardActionId): string {
  const n = DAILY_ACTION_CAPS[actionId];
  if (typeof n === 'number') return `${n}/day`;
  return `no daily action cap (${DAILY_XP_SOFT_CAP_LABEL})`;
}

export function publishEarnTable(): EarnTableRow[] {
  return (Object.keys(XP_BY_ACTION) as RewardActionId[]).map((actionId) => ({
    actionId,
    event: EARN_EVENT_LABELS[actionId],
    points: XP_BY_ACTION[actionId],
    cap: capLabelForAction(actionId),
  }));
}

export { DAILY_XP_SOFT_CAP };
