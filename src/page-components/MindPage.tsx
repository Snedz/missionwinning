'use client';
/**
 * Page: /mind — mind pillar
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BreathingTimer } from '@/components/pillars/BreathingTimer';
import { DailyCheckIn } from '@/components/pillars/DailyCheckIn';
import { MindLockedPreview } from '@/components/mind/MindLockedPreview';
import { usePremium } from '@/hooks/usePremium';
import type { GuidedMindSession } from '@/data/guidedMindSessions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { getPillarWins } from '@/lib/pillarLog';
import type { PillarWin } from '@/lib/pillarLog';
import { GUIDED_MIND_SESSIONS } from '@/data/guidedMindSessions';
import { GuidedMindSessionRunner } from '@/components/pillars/GuidedMindSessionRunner';
import { Brain } from 'lucide-react';

export function MindPage() {
  const { t } = useTranslation();
  const { premium } = usePremium();
  const [premiumSessions, setPremiumSessions] = useState<GuidedMindSession[]>([]);
  const [recentWins, setRecentWins] = useState<PillarWin[]>([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setRecentWins(getPillarWins(5).filter((w) => w.pillar === 'mind'));
  }, [refresh]);

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {GUIDED_MIND_SESSIONS.map((s) => (
            <GuidedMindSessionRunner key={s.id} session={s} onLogged={() => setRefresh((r) => r + 1)} />
          ))}
        </div>
      </div>

      {premium && premiumSessions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">
            {t('mindPremiumSessions', { defaultValue: 'Premium guided sessions' })}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {premiumSessions.map((s) => (
              <GuidedMindSessionRunner key={s.id} session={s} onLogged={() => setRefresh((r) => r + 1)} />
            ))}
          </div>
        </div>
      )}

      {!premium && <MindLockedPreview />}

      {recentWins.length > 0 ? (
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
      ) : (
        <EmptyState
          icon={Brain}
          title={t('mindEmptyTitle', { defaultValue: 'No mind sessions logged yet' })}
          description={t('mindEmptyDesc', {
            defaultValue: 'Try a guided session or breathing timer — your first win shows here.',
          })}
        />
      )}
    </PillarPageShell>
  );
}
