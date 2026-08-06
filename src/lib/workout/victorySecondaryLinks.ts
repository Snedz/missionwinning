/**
 * Quiet Super Bundle links under Victory primary CTA — pure.
 * Does not replace pickVictoryNextAction (one boss Peak-End action).
 */

export type VictorySecondaryLink = {
  href: string;
  labelKey: string;
  defaultLabel: string;
};

export function buildVictorySecondaryLinks(opts: {
  primaryHref: string;
  proteinLoggedToday?: boolean;
  strainDelta?: number;
}): VictorySecondaryLink[] {
  const primary = opts.primaryHref || '';
  const out: VictorySecondaryLink[] = [];

  if (!opts.proteinLoggedToday && !primary.includes('/nutrition') && !primary.includes('/bundle')) {
    out.push({
      href: '/nutrition',
      labelKey: 'victorySecondaryFuel',
      defaultLabel: 'Log protein',
    });
  }

  if ((opts.strainDelta ?? 0) >= 5) {
    if (!primary.includes('/mind')) {
      out.push({
        href: '/mind',
        labelKey: 'victorySecondaryMind',
        defaultLabel: 'Mind downshift',
      });
    }
  } else if (!primary.includes('/move') && !primary.includes('/active')) {
    // After Coach primary, offer mobility; don't compete with "Train again"
    out.push({
      href: '/move',
      labelKey: 'victorySecondaryMove',
      defaultLabel: 'Mobility',
    });
  }

  return out.slice(0, 2);
}
