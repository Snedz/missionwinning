'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { badgeDef } from '@/lib/rewards/catalog';
import type { LastAwardsSnapshot } from '@/lib/rewards/storage';
import { consumeLastAwards, peekLastAwards } from '@/lib/rewards/storage';
import type { BadgeId } from '@/lib/rewards/types';

/**
 * Compact Victory line — XP + optional badge names. Consumes the last awards
 * snapshot once so a second open of the sheet does not re-celebrate.
 */
export function VictoryRewardsLine({ active }: { active: boolean }) {
  const { t } = useTranslation();
  const [snap, setSnap] = useState<LastAwardsSnapshot | null>(null);

  useEffect(() => {
    if (!active) return;
    const peeked = peekLastAwards();
    if (!peeked) return;
    setSnap(peeked);
    consumeLastAwards();
  }, [active]);

  if (!snap || (snap.xpGained <= 0 && snap.badgeIds.length === 0)) return null;

  const leveled = snap.levelAfter > snap.levelBefore;
  const badgeNames = snap.badgeIds
    .map((id) => {
      try {
        const def = badgeDef(id as BadgeId);
        return t(def.titleKey, { defaultValue: def.titleDefault });
      } catch {
        return id;
      }
    })
    .filter(Boolean);

  return (
    <p
      className="text-center text-sm font-medium text-foreground border-2 border-border bg-card px-3 py-2"
      data-testid="victory-rewards-line"
    >
      {snap.xpGained > 0
        ? t('rewardVictoryXp', {
            xp: snap.xpGained,
            defaultValue: `+${snap.xpGained} XP`,
          })
        : null}
      {leveled
        ? t('rewardVictoryLevel', {
            level: snap.levelAfter,
            defaultValue: ` · Level ${snap.levelAfter}`,
          })
        : null}
      {badgeNames.length > 0
        ? t('rewardVictoryBadges', {
            names: badgeNames.join(' · '),
            defaultValue: ` · ${badgeNames.join(' · ')}`,
          })
        : null}
    </p>
  );
}
