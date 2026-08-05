'use client';

import { Medal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BADGE_DEFS } from '@/lib/rewards/catalog';
import type { BadgeId } from '@/lib/rewards/types';
import { summarizeRewards } from '@/lib/rewards/summary';
import { useWorkoutStore } from '@/store/workoutStore';

/** Profile collection — earned badges + empty honest state. */
export function ProfileRewardsCard() {
  const { t } = useTranslation();
  const history = useWorkoutStore((s) => s.workoutHistory);
  const summary = summarizeRewards(history);
  const owned = new Set(summary.badges);

  return (
    <Card className="content-card" data-testid="profile-rewards-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Medal className="h-5 w-5 text-primary" aria-hidden />
          {t('rewardProfileTitle', { defaultValue: 'Badges & rank' })}
        </CardTitle>
        <CardDescription>
          {t('rewardProfileRank', {
            level: summary.level,
            rank: t(summary.rankTitleKey, { defaultValue: summary.rankTitleDefault }),
            xp: summary.xpTotal,
            defaultValue: `Level ${summary.level} · ${summary.rankTitleDefault} · ${summary.xpTotal} XP`,
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {summary.badges.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('rewardProfileEmpty', {
              defaultValue: 'Complete your first workout to earn First Blood.',
            })}
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {BADGE_DEFS.filter((b) => owned.has(b.id as BadgeId)).map((b) => (
              <li
                key={b.id}
                className="border-2 border-border bg-card px-3 py-2 flex items-start justify-between gap-2"
              >
                <div>
                  <p className="text-sm font-medium">
                    {t(b.titleKey, { defaultValue: b.titleDefault })}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {t(b.descKey, { defaultValue: b.descDefault })}
                  </p>
                </div>
                {b.rarity === 'honor' ? (
                  <Badge variant="honor">{t('rewardHonor', { defaultValue: 'Honor' })}</Badge>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
