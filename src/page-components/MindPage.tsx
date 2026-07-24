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
import { ErrorState } from '@/components/ui/ErrorState';
import { getPillarWins } from '@/lib/pillarLog';
import type { PillarWin } from '@/lib/pillarLog';
import { GUIDED_MIND_SESSIONS } from '@/data/guidedMindSessions';
import { GuidedMindSessionRunner } from '@/components/pillars/GuidedMindSessionRunner';
import { Brain, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchPremiumCatalogJson } from '@/lib/premiumCatalogCache';
import { isFreeBeta } from '@/lib/freeBeta';

export function MindPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { premium } = usePremium();
  const [premiumSessions, setPremiumSessions] = useState<GuidedMindSession[]>([]);
  const [recentWins, setRecentWins] = useState<PillarWin[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [premiumFetchError, setPremiumFetchError] = useState(false);

  useEffect(() => {
    setRecentWins(getPillarWins(5).filter((w) => w.pillar === 'mind'));
  }, [refresh]);

  useEffect(() => {
    if (!premium) {
      setPremiumSessions([]);
      setPremiumFetchError(false);
      return;
    }
    setPremiumFetchError(false);
    fetchPremiumCatalogJson<{ sessions?: GuidedMindSession[] }>('/api/premium/mind')
      .then((d) => setPremiumSessions(d.sessions ?? []))
      .catch(() => {
        setPremiumSessions([]);
        setPremiumFetchError(true);
        toast({
          title: t('mindPremiumFetchFailed', { defaultValue: 'Could not load premium sessions' }),
          description: t('mindPremiumFetchFailedDesc', {
            defaultValue: 'Free mind tools still work. Check your connection and try again.',
          }),
          variant: 'destructive',
        });
      });
  }, [premium, t, toast]);

  return (
    <PillarPageShell
      icon={Brain}
      eyebrow={t('mindEyebrow', { defaultValue: 'Mind' })}
      title={t('mindTitle', { defaultValue: 'Mind' })}
      subtitle={t('mindSubtitle', {
        defaultValue: isFreeBeta()
          ? 'Breathing, check-in, and short guided sessions — keep recovery simple.'
          : 'Breathing, check-in, and guided sessions. Super Bundle adds deeper timed sessions when paid depth is on.',
      })}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <BreathingTimer />
        <DailyCheckIn />
      </div>

      <div id="mind-guided" className="space-y-3 scroll-mt-20">
        <h3 className="text-sm font-medium text-muted-foreground">
          {t('mindGuidedFree', { defaultValue: 'Guided sessions' })}
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {GUIDED_MIND_SESSIONS.map((s) => (
            <GuidedMindSessionRunner key={s.id} session={s} onLogged={() => setRefresh((r) => r + 1)} />
          ))}
        </div>
      </div>

      {premiumFetchError && premium && (
        <ErrorState
          className="py-6"
          title={t('mindPremiumFetchFailed', { defaultValue: 'Could not load premium sessions' })}
          description={t('mindPremiumOffline', {
            defaultValue: 'Premium sessions unavailable offline — free tools above still work.',
          })}
        />
      )}

      {premium && premiumSessions.length > 0 && (
        <details className="group space-y-3" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-1 min-h-[44px] [&::-webkit-details-marker]:hidden">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">
              {t('mindPremiumSessions', { defaultValue: 'Premium guided sessions' })}
            </h3>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="grid gap-4 md:grid-cols-2">
            {premiumSessions.map((s) => (
              <GuidedMindSessionRunner key={s.id} session={s} onLogged={() => setRefresh((r) => r + 1)} />
            ))}
          </div>
        </details>
      )}

      {!premium && (
        <div className="space-y-2">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-border/50 px-4 py-3 text-sm min-h-[44px]"
            onClick={() => setPremiumOpen((v) => !v)}
          >
            <span className="font-medium text-muted-foreground">
              {t('mindPremiumPreview', { defaultValue: 'Premium guided sessions' })}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${premiumOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {premiumOpen && <MindLockedPreview />}
        </div>
      )}

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
          actionLabel={t('mindEmptyCta', { defaultValue: 'Browse guided sessions' })}
          onAction={() =>
            document.getElementById('mind-guided')?.scrollIntoView({ behavior: 'smooth' })
          }
        />
      )}
    </PillarPageShell>
  );
}
