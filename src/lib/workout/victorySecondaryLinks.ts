/**
 * Quiet Super Bundle links under Victory primary CTA — pure.
 * Does not replace pickVictoryNextAction (one boss Peak-End action).
 *
 * S6: at most one seam line. A muscle-matched free Move flow wins and skips
 * fuel. Generic `/move` tourism is gone — deep-link a flow or show nothing Move.
 */

import {
  pickPostSessionMoveFlow,
  type PostSessionFlowPick,
} from '@/lib/move/postSessionFlow';

export type VictorySecondaryLink = {
  href: string;
  labelKey: string;
  defaultLabel: string;
  kind?: 'move' | 'fuel' | 'mind';
  flowName?: string;
  muscle?: string;
};

export function buildVictorySecondaryLinks(opts: {
  primaryHref: string;
  proteinLoggedToday?: boolean;
  strainDelta?: number;
  /** Working-set muscle snapshots from the session just locked. */
  workingMuscleGroups?: readonly string[][];
  /** When false (parked Move surface), skip the Move seam. */
  moveSurfaceEnabled?: boolean;
}): VictorySecondaryLink[] {
  const primary = opts.primaryHref || '';
  const moveEnabled = opts.moveSurfaceEnabled !== false;

  const movePick =
    moveEnabled && !primary.includes('/move')
      ? pickPostSessionMoveFlow(opts.workingMuscleGroups ?? [])
      : null;

  if (movePick) {
    return [moveSeamLink(movePick)];
  }

  if (!opts.proteinLoggedToday && !primary.includes('/nutrition') && !primary.includes('/bundle')) {
    return [
      {
        href: '/nutrition',
        labelKey: 'victorySecondaryFuel',
        defaultLabel: 'Log protein',
        kind: 'fuel',
      },
    ];
  }

  if ((opts.strainDelta ?? 0) >= 5 && !primary.includes('/mind')) {
    return [
      {
        href: '/mind',
        labelKey: 'victorySecondaryMind',
        defaultLabel: 'Mind downshift',
        kind: 'mind',
      },
    ];
  }

  return [];
}

function moveSeamLink(pick: PostSessionFlowPick): VictorySecondaryLink {
  return {
    href: pick.href,
    kind: 'move',
    flowName: pick.flowName,
    muscle: pick.muscle,
    labelKey: 'victorySecondaryMoveBecause',
    defaultLabel: `${pick.flowName} — because you trained ${pick.muscle}`,
  };
}
