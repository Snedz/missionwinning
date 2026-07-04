'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ChevronRight, Globe, Rocket, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { InfoPageFooter } from '@/components/layout/InfoPageFooter';
import { InfoPageShell } from '@/components/layout/InfoPageShell';

import { BETA_STEP_DEFS } from '@/i18n/betaLocales';

export function BetaStartPage() {
  const { t } = useTranslation();

  return (
    <InfoPageShell
      icon={Rocket}
      title={t('infoBetaTitle', { defaultValue: 'Start here' })}
      subtitle={t('infoBetaSubtitle', {
        defaultValue:
          'Mission Winning is in private development. You are among the first Mission Operators helping us validate the journey, Today hub, and rankings before public launch.',
      })}
      variant="sections"
      footer={
        <InfoPageFooter
          showLegal
          showToday
          todayLabel={t('infoSkipToday', { defaultValue: 'Skip to Today' })}
        />
      }
    >
        <Card className="content-card border-emerald-500/30 bg-emerald-950/20">
          <CardContent className="pt-6 space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-medium">
              <CheckCircle2 className="h-5 w-5" />
              {t('infoBetaNeedTitle', { defaultValue: 'What we need from you' })}
            </div>
            <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
              <li>{t('betaNeedLi1', { defaultValue: 'Finish I-Day and at least one workout this week' })}</li>
              <li>
                {t('betaNeedLi2', {
                  defaultValue:
                    'Try journey phases on Today — dashboard unlocks as you progress',
                })}
              </li>
              <li>
                {t('betaNeedLi3', {
                  defaultValue:
                    'Report anything confusing via Profile → feedback or reply to your invite email',
                })}
              </li>
            </ul>
          </CardContent>
        </Card>

        <ol className="space-y-3">
          {BETA_STEP_DEFS.map((step) => (
            <li key={step.n}>
              <Card className="content-card">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-sm">
                    {step.n}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h2 className="font-semibold">{t(step.titleKey)}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t(step.bodyKey)}</p>
                  </div>
                  <Button asChild size="sm" variant="outline" className="shrink-0">
                    <Link href={step.href}>
                      {t(step.ctaKey)}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>

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
    </InfoPageShell>
  );
}
