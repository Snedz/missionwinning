'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ChevronRight, Globe, Rocket, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { InfoPageFooter } from '@/components/layout/InfoPageFooter';
import { PillarPageHeader } from '@/components/layout/PillarPageHeader';
import { StaggerGroup, StaggerItem } from '@/components/layout/StaggerReveal';

const STEPS = [
  {
    n: 1,
    title: 'Unlock access',
    body: 'Use the private access code from your invite. Enter it on the gate page or append ?access=YOUR_CODE to any URL once.',
    href: '/private',
    cta: 'Enter access code',
  },
  {
    n: 2,
    title: 'Complete I-Day (≈2 min)',
    body: 'Welcome flow sets your goal and equipment. This syncs to your profile when you sign in.',
    href: '/welcome',
    cta: 'Start I-Day',
  },
  {
    n: 3,
    title: 'Log your first workout',
    body: 'Today → your next step → Train. One completed session unlocks streak tracking and leaderboard sync.',
    href: '/log',
    cta: 'Go to Today',
  },
  {
    n: 4,
    title: 'Sign in (optional but recommended)',
    body: 'Magic link on Profile keeps journey, workouts, and rankings in the cloud across devices.',
    href: '/profile',
    cta: 'Profile & sign in',
  },
  {
    n: 5,
    title: 'Explore rankings',
    body: 'Six boards including Under the Stars (night) and By Dawn\'s Early Light (early morning). Set a squad code to compare with friends.',
    href: '/leaderboard',
    cta: 'Open leaderboard',
  },
];

export function BetaStartPage() {
  const { t } = useTranslation();

  return (
    <StaggerGroup className="space-y-6">
      <StaggerItem index={0}>
        <PillarPageHeader
          icon={Rocket}
          title={t('infoBetaTitle', { defaultValue: 'Start here' })}
          subtitle={t('infoBetaSubtitle', {
            defaultValue:
              'Mission Winning is in private development. You are among the first Mission Operators helping us validate the journey, Today hub, and rankings before public launch.',
          })}
        />
      </StaggerItem>

      <StaggerItem index={1}>
        <Card className="content-card border-emerald-500/30 bg-emerald-950/20">
          <CardContent className="pt-6 space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-medium">
              <CheckCircle2 className="h-5 w-5" />
              {t('infoBetaNeedTitle', { defaultValue: 'What we need from you' })}
            </div>
            <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
              <li>Finish I-Day and at least one workout this week</li>
              <li>Try journey phases on Today — dashboard unlocks as you progress (readiness → commissioned)</li>
              <li>Report anything confusing via Profile → feedback or reply to your invite email</li>
            </ul>
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem index={2}>
        <ol className="space-y-3">
          {STEPS.map((step) => (
            <li key={step.n}>
              <Card className="content-card">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-sm">
                    {step.n}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h2 className="font-semibold">{step.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                  </div>
                  <Button asChild size="sm" variant="outline" className="shrink-0">
                    <Link href={step.href}>
                      {step.cta}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </StaggerItem>

      <StaggerItem index={3}>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <Card className="content-card">
            <CardContent className="p-4 flex gap-3">
              <Globe className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Languages</div>
                <p className="text-muted-foreground mt-1">
                  Nav and welcome work in 12+ languages. Change language on Profile → Language.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="content-card">
            <CardContent className="p-4 flex gap-3">
              <Trophy className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Leaderboard sync</div>
                <p className="text-muted-foreground mt-1">
                  Sign in and tap Sync on Rankings after workouts. Night and dawn sessions count on themed boards.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </StaggerItem>

      <StaggerItem index={4}>
        <InfoPageFooter
          showLegal
          showToday
          todayLabel={t('infoSkipToday', { defaultValue: 'Skip to Today' })}
        />
      </StaggerItem>
    </StaggerGroup>
  );
}
