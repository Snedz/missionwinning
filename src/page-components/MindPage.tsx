'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BreathingTimer } from '@/components/pillars/BreathingTimer';
import { DailyCheckIn } from '@/components/pillars/DailyCheckIn';
import { UnlockButton } from '@/components/UnlockButton';
import { usePremium } from '@/hooks/usePremium';
import type { GuidedMindSession } from '@/data/guidedMindSessions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { getPillarWins } from '@/lib/pillarLog';
import { GUIDED_MIND_SESSIONS } from '@/data/guidedMindSessions';
import { GuidedMindSessionRunner } from '@/components/pillars/GuidedMindSessionRunner';
import { Brain } from 'lucide-react';

export function MindPage() {
  const { t } = useTranslation();
  const { premium } = usePremium();
  const [premiumSessions, setPremiumSessions] = useState<GuidedMindSession[]>([]);
  const recentWins = typeof window !== 'undefined'
    ? getPillarWins(5).filter((w) => w.pillar === 'mind')
    : [];

  useEffect(() => {
    if (!premium) {
      setPremiumSessions([]);
      return;
    }
    fetch('/api/premium/mind')
      .then((r) => (r.ok ? r.json() : { sessions: [] }))
      .then((d) => setPremiumSessions(d.sessions ?? []))
      .catch(() => setPremiumSessions([]));
  }, [premium]);

  const allSessions = [...GUIDED_MIND_SESSIONS, ...premiumSessions];

  return (
    <PillarPageShell
      icon={Brain}
      title={t('mindTitle', { defaultValue: 'Mind & Recovery' })}
      subtitle={t('mindSubtitle', {
        defaultValue:
          '10 free guided sessions, breathing timer, and daily check-in. Premium adds 12 deeper sessions (Super Bundle).',
      })}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <BreathingTimer />
        <DailyCheckIn />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {t('mindGuidedFree', { defaultValue: 'Free guided sessions' })}
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {allSessions.map((s) => (
            <GuidedMindSessionRunner key={s.id} session={s} />
          ))}
        </div>
      </div>

      {premiumSessions.length > 0 && (
        <p className="text-xs text-emerald-400">
          {t('mindPremiumLoaded', { defaultValue: 'Premium sessions unlocked above.' })}
        </p>
      )}

      {recentWins.length > 0 && (
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
      )}

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
    </PillarPageShell>
  );
}
