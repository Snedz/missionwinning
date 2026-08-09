'use client';
/**
 * Share the Athlete Page out as a PNG — not a public URL (S4 URL waits on Club C2).
 *
 * Builds only from C5 public projection + career counts + card cosmetics.
 * Outline full-width button so `/profile` stays at 0 red actions.
 */

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWorkoutStore } from '@/store/workoutStore';
import { summarizeRewards, ownedBadgeDefs } from '@/lib/rewards/summary';
import { loadOperatorName } from '@/lib/leaderboard/computeLocalStats';
import { resolveAthleteCard } from '@/lib/identity/athleteCard';
import {
  buildAthletePublicProjection,
  resolveStoredAthletePage,
} from '@/lib/identity/athleteProfile';
import { buildAthletePageShareData } from '@/lib/identity/athletePageShare';
import { computeCareerLine } from '@/lib/careerLine';
import { cardCosmetics } from '@/lib/share/cardCosmetics';
import { renderShareCard, shareCardImage } from '@/lib/share/shareCard';

export function AthletePageShareCard() {
  const { t } = useTranslation();
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const summary = useMemo(() => summarizeRewards(workoutHistory), [workoutHistory]);
  const career = useMemo(() => computeCareerLine(workoutHistory), [workoutHistory]);
  const [busy, setBusy] = useState(false);

  const onShare = async () => {
    setBusy(true);
    try {
      const page = resolveStoredAthletePage(summary.level);
      const cardCfg = resolveAthleteCard(summary);
      const ownedShown = ownedBadgeDefs(summary.badges)
        .map((b) => b.id)
        .filter((id) => cardCfg.badges.includes(id));

      const projection = buildAthletePublicProjection({
        callSign: loadOperatorName(),
        callSignNumber: cardCfg.callSignNumber,
        kitId: page.kitId,
        table: page.table,
        badgeIds: ownedShown,
        rankTitle: summary.rankTitleDefault,
        level: summary.level,
      });

      const data = buildAthletePageShareData(projection, {
        sessions: career.sessions,
        daysTrained: career.daysTrained,
        cosmetics: cardCosmetics(cardCfg.frame, cardCfg.backdrop),
      });

      const blob = await renderShareCard(data);
      if (blob) {
        await shareCardImage(
          blob,
          t('athletePageShareText', { defaultValue: 'My Athlete Page — Mission Winning.' }),
          'https://www.missionwinning.com',
          'mission-winning-page.png'
        );
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="bg-card" data-testid="athlete-page-share">
      <CardContent className="space-y-3 pt-6">
        <p className="eyebrow">{t('athletePageShareTitle', { defaultValue: 'Share page' })}</p>
        <p className="text-sm text-muted-foreground">
          {t('athletePageShareBody', {
            defaultValue:
              'Renders on this device and leaves only if you send it. No public link yet.',
          })}
        </p>
        <Button
          type="button"
          variant="outline"
          size="block"
          onClick={onShare}
          disabled={busy}
          className="tap-target"
        >
          <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
          {busy
            ? t('athletePageShareBusy', { defaultValue: 'Preparing…' })
            : t('athletePageShareAction', { defaultValue: 'Share your page' })}
        </Button>
      </CardContent>
    </Card>
  );
}
