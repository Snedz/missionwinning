/**
 * Under the Hood scoring weights — our earn table and visibility filters.
 *
 * BOOSTS are Mission Points from the live catalog (what this device awards)
 * plus the published Club v1 table (planned, not awarding today).
 * PENALTIES are visibility filters only. They never debit points.
 * There is no Mission Server ROOM SCORE table in this repo.
 */

import {
  DAILY_ACTION_CAPS,
  DAILY_XP_SOFT_CAP,
  XP_BY_ACTION,
} from '@/lib/rewards/catalog';
import { EARN_EVENT_LABELS, capLabelForAction } from '@/lib/transparency/earnTable';
import type { RewardActionId } from '@/lib/rewards/types';
import type { WeightRow } from '@/lib/transparency/types';

export const WEIGHTS_SOURCE_LIVE = 'src/lib/rewards/catalog.ts • defaults';
export const WEIGHTS_SOURCE_CLUB = 'docs/CLUB_PLAN.md • planned';
export const WEIGHTS_SOURCE_VISIBILITY = 'src/lib/transparency/weights.ts • visibility filters';

export const PENALTY_DISPLAY = 'does not debit points';

/** Club v1 earn table from docs/CLUB_PLAN.md — planned, not live. */
export const CLUB_PLANNED_BOOSTS: readonly WeightRow[] = [
  {
    id: 'club_session',
    label: 'Workout session (≥1 set)',
    kind: 'boost',
    points: 10,
    display: '+10',
    cap: '2/day',
    live: false,
    source: WEIGHTS_SOURCE_CLUB,
  },
  {
    id: 'club_coach_plan',
    label: 'Coach-plan session done',
    kind: 'boost',
    points: 5,
    display: '+5',
    cap: '1/day',
    live: false,
    source: WEIGHTS_SOURCE_CLUB,
  },
  {
    id: 'club_challenge',
    label: 'Weekly challenge',
    kind: 'boost',
    points: 15,
    display: '+15',
    cap: '8/week',
    live: false,
    source: WEIGHTS_SOURCE_CLUB,
  },
  {
    id: 'club_journey_first',
    label: 'Journey milestone',
    kind: 'boost',
    points: 20,
    display: '+20',
    cap: 'once',
    live: false,
    source: WEIGHTS_SOURCE_CLUB,
  },
  {
    id: 'club_journey_commissioned',
    label: 'Journey commissioned',
    kind: 'boost',
    points: 50,
    display: '+50',
    cap: 'once',
    live: false,
    source: WEIGHTS_SOURCE_CLUB,
  },
  {
    id: 'club_pr',
    label: 'Personal record',
    kind: 'boost',
    points: 5,
    display: '+5',
    cap: '3/day',
    live: false,
    source: WEIGHTS_SOURCE_CLUB,
  },
  {
    id: 'club_streak_7',
    label: 'Streak 7 days',
    kind: 'boost',
    points: 25,
    display: '+25',
    cap: 'once per level',
    live: false,
    source: WEIGHTS_SOURCE_CLUB,
  },
  {
    id: 'club_streak_30',
    label: 'Streak 30 days',
    kind: 'boost',
    points: 50,
    display: '+50',
    cap: 'once per level',
    live: false,
    source: WEIGHTS_SOURCE_CLUB,
  },
  {
    id: 'club_streak_100',
    label: 'Streak 100 days',
    kind: 'boost',
    points: 100,
    display: '+100',
    cap: 'once per level',
    live: false,
    source: WEIGHTS_SOURCE_CLUB,
  },
  {
    id: 'club_streak_365',
    label: 'Streak 365 days',
    kind: 'boost',
    points: 250,
    display: '+250',
    cap: 'once per level',
    live: false,
    source: WEIGHTS_SOURCE_CLUB,
  },
];

const PENALTY_IDS = ['report', 'mute', 'block', 'hide'] as const;

const PENALTY_LABELS: Record<(typeof PENALTY_IDS)[number], string> = {
  report: 'Report',
  mute: 'Mute',
  block: 'Block',
  hide: 'Hide',
};

export function publishLiveBoosts(): WeightRow[] {
  return (Object.keys(XP_BY_ACTION) as RewardActionId[]).map((actionId) => {
    const points = XP_BY_ACTION[actionId];
    return {
      id: actionId,
      label: EARN_EVENT_LABELS[actionId],
      kind: 'boost',
      points,
      display: `+${points}`,
      cap: capLabelForAction(actionId),
      live: true,
      source: WEIGHTS_SOURCE_LIVE,
    };
  });
}

export function publishClubPlannedBoosts(): WeightRow[] {
  return CLUB_PLANNED_BOOSTS.map((row) => ({ ...row }));
}

export function publishPenalties(): WeightRow[] {
  return PENALTY_IDS.map((id) => ({
    id,
    label: PENALTY_LABELS[id],
    kind: 'penalty' as const,
    points: null,
    display: PENALTY_DISPLAY,
    cap: 'visibility filter',
    live: true,
    source: WEIGHTS_SOURCE_VISIBILITY,
    note: 'Visibility only. Does not debit Mission Points.',
  }));
}

export function publishWeightsSources(): {
  live: string;
  club: string;
  visibility: string;
  dailySoftCap: number;
} {
  return {
    live: WEIGHTS_SOURCE_LIVE,
    club: WEIGHTS_SOURCE_CLUB,
    visibility: WEIGHTS_SOURCE_VISIBILITY,
    dailySoftCap: DAILY_XP_SOFT_CAP,
  };
}

export { DAILY_ACTION_CAPS, DAILY_XP_SOFT_CAP };
