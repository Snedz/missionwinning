'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BreathingTimer } from '@/components/pillars/BreathingTimer';
import { DailyCheckIn } from '@/components/pillars/DailyCheckIn';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PillarPageHeader } from '@/components/layout/PillarPageHeader';
import { StaggerGroup, StaggerItem } from '@/components/layout/StaggerReveal';
import { getPillarWins } from '@/lib/pillarLog';
import { GUIDED_MIND_SESSIONS } from '@/data/guidedMindSessions';
import type { GuidedMindSession } from '@/data/guidedMindSessions';
import { PREMIUM_MIND_SESSION_COUNT } from '@/lib/mindPremiumMeta';
import { GuidedMindSessionRunner } from '@/components/pillars/GuidedMindSessionRunner';
import { usePremium } from '@/hooks/usePremium';
import { Brain } from 'lucide-react';

export function MindPage() {
  const { t } = useTranslation();
  const { premium, loading: premiumLoading } = usePremium();
  const [premiumSessions, setPremiumSessions] = useState<GuidedMindSession[]>([]);
  const recentWins = typeof window !== 'undefined'
    ? getPillarWins(5).filter((w) => w.pillar === 'mind')
    : [];

  useEffect(() => {
    if (!premium) {
      setPremiumSessions([]);
      return;
    }
    fetch('/api/premium/mind-sessions', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { sessions: [] }))
      .then((data) => setPremiumSessions(data.sessions ?? []))
      .catch(() => setPremiumSessions([]));
  }, [premium]);

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
        {premium && !premiumLoading && premiumSessions.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t('mindGuidedPremium', { defaultValue: 'Premium guided sessions (Super Bundle)' })}
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {premiumSessions.map((s) => (
                <GuidedMindSessionRunner key={s.id} session={s} />
              ))}
            </div>
          </div>
        ) : (
          <Card className="content-card border-emerald-500/30">
            <CardHeader>
              <CardTitle className="text-base">
                {t('mindPremiumLockedTitle', {
                  count: PREMIUM_MIND_SESSION_COUNT,
                  defaultValue: `+${PREMIUM_MIND_SESSION_COUNT} Premium Sessions`,
                })}
              </CardTitle>
              <CardDescription>
                {t('mindPremiumLockedBody', {
                  defaultValue:
                    'Unlock sleep stories, anxiety resets, focus blocks, and deep recovery scans via the Super Bundle.',
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="fitness" onClick={() => { window.location.href = '/bundle'; }}>
                {t('mindExploreBundle', { defaultValue: 'Explore Super Bundle' })}
              </Button>
            </CardContent>
          </Card>
        )}
      </StaggerItem>
    </StaggerGroup>
  );
}
