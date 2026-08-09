'use client';
/**
 * Page: /profile — the Athlete Page.
 *
 * Until `.606` this route was a 413-line settings screen wearing the nav label
 * "You". The settings moved to `/account`; what stayed is the part that is
 * actually yours — docs/IDENTITY_SOCIAL_PLAN.md §3.
 *
 * Blocks: Identity · Line · Table · Kit · Card · Shelf · **Page share** · **Private
 * note**. Kits are C6 compositions. Page share is share-OUT PNG (S4a); public URL
 * is S4b (Club C2). Private note is local free text only (C5).
 *
 * **This page is Social-domain and may read rewards.** What it may never do is
 * appear on the logging path — `domainBoundary.test.ts` C3 keeps `/profile` out
 * of `MOBILE_TAB_HREFS`, and no planner or logger module imports it.
 *
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { AppLegalFooter } from '@/components/layout/AppLegalFooter';
import { APP_BUILD_LABEL } from '@/lib/buildInfo';
import { ProfileRewardsCard } from '@/components/rewards/ProfileRewardsCard';
import { ProfileAthleteCard } from '@/components/profile/ProfileAthleteCard';
import { AthleteIdentityCard } from '@/components/profile/AthleteIdentityCard';
import { CareerLineCard } from '@/components/profile/CareerLineCard';
import { AthleteTableCard } from '@/components/profile/AthleteTableCard';
import { AthletePageKitCard } from '@/components/profile/AthletePageKitCard';
import { AthletePrivateNoteCard } from '@/components/profile/AthletePrivateNoteCard';
import { AthletePageShareCard } from '@/components/profile/AthletePageShareCard';
import { useMissionJourney } from '@/hooks/useMissionJourney';
import { daysSinceCommission } from '@/lib/missionJourney';
import { useWorkoutStore } from '@/store/workoutStore';
import { computeCareerLine, EMPTY_CAREER_LINE } from '@/lib/careerLine';
import { summarizeRewards } from '@/lib/rewards/summary';
import {
  ATHLETE_PAGE_CHANGED,
  pageKitById,
  resolveStoredAthletePage,
} from '@/lib/identity/athleteProfile';
import { pageKitLayoutClass } from '@/lib/identity/pageKitClasses';
import { cn } from '@/lib/utils';

export function ProfilePage() {
  const { t } = useTranslation();
  const { isCommissioned, state } = useMissionJourney();
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);

  /**
   * Zustand rehydrates after mount, so reading history during the first render
   * gives the empty array on the server and the real one on the client — which
   * is a hydration mismatch, not a loading state. Compute after mount and let
   * the card render its own zero state until then.
   */
  const [ready, setReady] = useState(false);
  const [kitId, setKitId] = useState('default');
  useEffect(() => setReady(true), []);

  const summary = useMemo(
    () => (ready ? summarizeRewards(workoutHistory) : null),
    [ready, workoutHistory]
  );

  useEffect(() => {
    if (!ready || !summary) return;
    const reload = () => {
      setKitId(resolveStoredAthletePage(summary.level).kitId);
    };
    reload();
    window.addEventListener(ATHLETE_PAGE_CHANGED, reload);
    return () => window.removeEventListener(ATHLETE_PAGE_CHANGED, reload);
  }, [ready, summary]);

  const career = useMemo(
    () => (ready ? computeCareerLine(workoutHistory) : EMPTY_CAREER_LINE),
    [ready, workoutHistory]
  );

  const kit = pageKitById(kitId);
  const kitClass = pageKitLayoutClass(kit);

  return (
    <PillarPageShell
      icon={User}
      eyebrow={t('profileEyebrow', { defaultValue: 'You' })}
      title={t('athletePageTitle', { defaultValue: 'Your record' })}
      subtitle={
        isCommissioned && state.commissionedAt
          ? t('profileCommissionedDay', {
              day: daysSinceCommission(state.commissionedAt),
              defaultValue: `Day ${daysSinceCommission(state.commissionedAt)} on the path`,
            })
          : t('athletePageSubtitle', {
              defaultValue: 'Authored here. Counted honestly. Yours on this device.',
            })
      }
      footer={<AppLegalFooter showBuild buildLabel={APP_BUILD_LABEL} />}
    >
      <div className={cn(kitClass)} data-testid="athlete-page-kit-root" data-page-kit={kitId}>
        <div className="athlete-page-kit__band" data-athlete-block>
          <AthleteIdentityCard career={career} />
        </div>

        <div data-athlete-block>
          <CareerLineCard career={career} />
        </div>

        <div data-athlete-block>
          <AthleteTableCard />
        </div>

        <div data-athlete-block>
          <AthletePageKitCard />
        </div>

        <div data-athlete-block>
          <ProfileAthleteCard />
        </div>

        <div data-athlete-block>
          <ProfileRewardsCard />
        </div>

        <div data-athlete-block>
          <AthletePageShareCard />
        </div>

        <div data-athlete-block>
          <AthletePrivateNoteCard />
        </div>

        <Card className="border-2 border-border bg-card" data-athlete-block>
          <CardContent className="pt-6">
            <p className="eyebrow mb-3 text-muted-foreground">
              {t('athletePageSettingsTitle', { defaultValue: 'Settings' })}
            </p>
            <Link
              href="/account"
              className="inline-flex min-h-[44px] items-center text-sm font-semibold text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              {t('athletePageSettingsLink', { defaultValue: 'Account & settings' })}
            </Link>
          </CardContent>
        </Card>
      </div>
    </PillarPageShell>
  );
}
