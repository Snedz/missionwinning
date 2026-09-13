'use client';

import { Medal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { BADGE_DEFS, badgeIconPath } from '@/lib/rewards/catalog';
import type { BadgeId } from '@/lib/rewards/types';
import { summarizeRewards } from '@/lib/rewards/summary';
import { useWorkoutStore } from '@/store/workoutStore';

/**
 * Athlete Page shelf — earned badge medallions only.
 *
 * IDENTITY_SOCIAL_PLAN §3: the shelf is provenance, not a scoreboard.
 * Level / rank / XP / weekly challenges stay on Today (`TodayRewardsCard`).
 */
export function ProfileRewardsCard() {
  const { t } = useTranslation();
  const history = useWorkoutStore((s) => s.workoutHistory);
  const summary = summarizeRewards(history);
  const owned = new Set(summary.badges);

  return (
    <div className="house-card space-y-3" data-testid="profile-rewards-card">
      <h3 className="flex items-center gap-2 text-2xl font-semibold leading-none tracking-tight">
        <Medal className="h-5 w-5 text-primary" aria-hidden />
        {t('rewardProfileTitle', { defaultValue: 'Badges' })}
      </h3>
      <p className="text-sm text-muted-foreground">
        {t('rewardProfileShelfHint', {
          defaultValue: 'Earned from logs on this device. Not a ranking.',
        })}
      </p>
      {summary.badges.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t('rewardProfileEmpty', {
            defaultValue: 'Log workouts and pillar wins to earn badges. Free forever.',
          })}
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {BADGE_DEFS.filter((b) => owned.has(b.id as BadgeId)).map((b) => (
            <li
              key={b.id}
              className="border-2 border-border bg-card px-3 py-2 flex items-start gap-3"
            >
              <img
                src={badgeIconPath(b.id)}
                alt=""
                width={40}
                height={40}
                className="shrink-0 border border-border"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">
                    {t(b.titleKey, { defaultValue: b.titleDefault })}
                  </p>
                  {b.rarity === 'honor' ? (
                    <Badge variant="honor">{t('rewardHonor', { defaultValue: 'Honor' })}</Badge>
                  ) : null}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {t(b.descKey, { defaultValue: b.descDefault })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
