'use client';
/**
 * Page: /profile — the Athlete Page.
 *
 * Until `.606` this route was a 413-line settings screen wearing the nav label
 * "You". The settings moved to `/account`; what stayed is the part that is
 * actually yours — docs/IDENTITY_SOCIAL_PLAN.md §3.
 *
 * Three blocks, in the order the plan sets: **Identity** (call sign and when you
 * started), **The line** (what you have done, from `workoutHistory` alone), and
 * **The shelf** (the badge medallions that already shipped). Page kits and the
 * interests table are S3 and wait on the third design proposal; nothing here
 * anticipates them.
 *
 * **This page is Social-domain and may read rewards.** What it may never do is
 * appear on the logging path — `domainBoundary.test.ts` C3 keeps `/profile` out
 * of `MOBILE_TAB_HREFS`, and no planner or logger module imports it.
 *
 * Local only. No server call, no projection, no share beyond the shipped card —
 * those are S4 and gated on CLUB_PLAN C2.
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
import { AthleteIdentityCard } from '@/components/profile/AthleteIdentityCard';
import { CareerLineCard } from '@/components/profile/CareerLineCard';
import { useMissionJourney } from '@/hooks/useMissionJourney';
import { daysSinceCommission } from '@/lib/missionJourney';
import { useWorkoutStore } from '@/store/workoutStore';
import { computeCareerLine, EMPTY_CAREER_LINE } from '@/lib/careerLine';

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
  useEffect(() => setReady(true), []);

  const career = useMemo(
    () => (ready ? computeCareerLine(workoutHistory) : EMPTY_CAREER_LINE),
    [ready, workoutHistory]
  );

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
              defaultValue: 'Everything you have logged, counted honestly. Yours, on this device.',
            })
      }
      footer={<AppLegalFooter showBuild buildLabel={APP_BUILD_LABEL} />}
    >
      <AthleteIdentityCard career={career} />

      <CareerLineCard career={career} />

      <ProfileRewardsCard />

      {/* Settings left this page in `.606`. A quiet text link, not a red action —
          the one red on this route belongs to the identity card's Save. */}
      <Card className="bg-card">
        <CardContent className="pt-6">
          <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground">
            {t('athletePageSettingsTitle', { defaultValue: 'Settings' })}
          </p>
          <Link href="/account" className="text-sm font-semibold text-primary underline">
            {t('athletePageSettingsLink', { defaultValue: 'Account & settings' })}
          </Link>
        </CardContent>
      </Card>
    </PillarPageShell>
  );
}
