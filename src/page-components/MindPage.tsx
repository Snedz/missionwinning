'use client';

import { useTranslation } from 'react-i18next';
import { BreathingTimer } from '@/components/pillars/BreathingTimer';
import { DailyCheckIn } from '@/components/pillars/DailyCheckIn';
import { UnlockButton } from '@/components/UnlockButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PillarPageHeader } from '@/components/layout/PillarPageHeader';
import { StaggerGroup, StaggerItem } from '@/components/layout/StaggerReveal';
import { getPillarWins } from '@/lib/pillarLog';
import { GUIDED_MIND_SESSIONS } from '@/data/guidedMindSessions';
import { GuidedMindSessionRunner } from '@/components/pillars/GuidedMindSessionRunner';
import { Brain } from 'lucide-react';

export function MindPage() {
  const { t } = useTranslation();
  const recentWins = typeof window !== 'undefined'
    ? getPillarWins(5).filter((w) => w.pillar === 'mind')
    : [];

  return (
    <StaggerGroup className="space-y-6">
      <StaggerItem index={0}>
        <PillarPageHeader
          icon={Brain}
          title={t('mindTitle', { defaultValue: 'Mind & Recovery' })}
          subtitle={t('mindSubtitle', {
            defaultValue:
              'Free breathing timer, guided sessions, and daily check-in. Premium unlocks full audio libraries (Super Bundle).',
          })}
        />
      </StaggerItem>

      <StaggerItem index={1}>
        <div className="grid gap-6 lg:grid-cols-2">
          <BreathingTimer />
          <DailyCheckIn />
        </div>
      </StaggerItem>

      <StaggerItem index={2}>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t('mindGuidedFree', { defaultValue: 'Free guided sessions' })}
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            {GUIDED_MIND_SESSIONS.map((s) => (
              <GuidedMindSessionRunner key={s.id} session={s} />
            ))}
          </div>
        </div>
      </StaggerItem>

      {recentWins.length > 0 && (
        <StaggerItem index={3}>
          <Card className="content-card">
            <CardHeader>
              <CardTitle className="text-base">
                {t('mindRecentWins', { defaultValue: 'Recent Mind Wins' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              {recentWins.map((w) => (
                <div key={w.id} className="text-muted-foreground">
                  {new Date(w.completedAt).toLocaleDateString()} — {w.title}
                </div>
              ))}
            </CardContent>
          </Card>
        </StaggerItem>
      )}

      <StaggerItem index={recentWins.length > 0 ? 4 : 3}>
        <Card className="content-card border-white/10 bg-card/50">
          <CardHeader>
            <CardTitle className="text-base">
              {t('mindPremiumTitle', { defaultValue: 'Premium — Calm / Waking Up depth' })}
            </CardTitle>
            <CardDescription>
              {t('mindPremiumDesc', {
                defaultValue: 'Guided sessions, sleep stories, expert lessons on building resilience.',
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UnlockButton
              productId="mind-premium"
              price="7"
              title={t('mindPremiumBtn', { defaultValue: 'Mind & Recovery Premium' })}
              isSubscription
            />
          </CardContent>
        </Card>
      </StaggerItem>
    </StaggerGroup>
  );
}
