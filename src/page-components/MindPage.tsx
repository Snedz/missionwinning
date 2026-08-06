'use client';
/**
 * Page: /mind — mind pillar
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
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
import { getContentInventory } from '@/lib/contentInventory';
import {
  filterMindByCollection,
  MIND_COLLECTIONS,
  type MindCollectionId,
} from '@/lib/mind/filterSessions';
import { cn } from '@/lib/utils';

export function MindPage() {
  const { t } = useTranslation();
  const fmt = useLocaleFormat();
  const { toast } = useToast();
  const { premium } = usePremium();
  const [premiumSessions, setPremiumSessions] = useState<GuidedMindSession[]>([]);
  const [recentWins, setRecentWins] = useState<PillarWin[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [premiumFetchError, setPremiumFetchError] = useState(false);
  const [premiumRetry, setPremiumRetry] = useState(0);
  const [collectionId, setCollectionId] = useState<MindCollectionId>('all');
  const inv = getContentInventory();

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
  }, [premium, premiumRetry, t, toast]);

  const freeSessions = useMemo(
    () => filterMindByCollection(GUIDED_MIND_SESSIONS, collectionId),
    [collectionId]
  );
  const filteredPremium = useMemo(
    () => filterMindByCollection(premiumSessions, collectionId),
    [premiumSessions, collectionId]
  );

  return (
    <PillarPageShell
      icon={Brain}
      eyebrow={t('mindEyebrow', { defaultValue: 'Mind' })}
      title={t('mindTitle', { defaultValue: 'Mind' })}
      subtitle={t('mindSubtitleDepth', {
        free: inv.mind.free,
        premium: inv.mind.premium,
        defaultValue: isFreeBeta()
          ? `${inv.mind.free} free guided sessions · ${inv.unlockedTotal.mind} unlocked in open beta — breathing + check-in included.`
          : `${inv.mind.free} free guided sessions · Super Bundle adds ${inv.mind.premium} deeper timed sessions.`,
      })}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <BreathingTimer />
        <DailyCheckIn />
      </div>

      <div
        className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
        role="tablist"
        aria-label={t('mindCollections', { defaultValue: 'Collections' })}
      >
        {MIND_COLLECTIONS.map((c) => {
          const selected = collectionId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={cn(
                'shrink-0 min-h-[44px] border-2 px-3 text-sm font-medium transition-colors',
                selected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground hover:border-primary'
              )}
              onClick={() => setCollectionId(c.id)}
            >
              {t(c.titleKey, { defaultValue: c.titleDefault })}
            </button>
          );
        })}
      </div>

      <div id="mind-guided" className="space-y-3 scroll-mt-20">
        <h3 className="text-sm font-medium text-muted-foreground">
          {t('mindGuidedFreeCount', {
            count: freeSessions.length,
            defaultValue: `Guided sessions (${freeSessions.length})`,
          })}
        </h3>
        {freeSessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('mindCollectionEmpty', {
              defaultValue: 'No sessions in this collection — try All sessions.',
            })}
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {freeSessions.map((s) => (
              <GuidedMindSessionRunner key={s.id} session={s} onLogged={() => setRefresh((r) => r + 1)} />
            ))}
          </div>
        )}
      </div>

      {premiumFetchError && premium && (
        <ErrorState
          className="py-6"
          actionLabel={t('mindPremiumRetry', { defaultValue: 'Try again' })}
          onAction={() => setPremiumRetry((n) => n + 1)}
          title={t('mindPremiumFetchFailed', { defaultValue: 'Could not load premium sessions' })}
          description={t('mindPremiumOffline', {
            defaultValue: 'Premium sessions unavailable offline — free tools above still work.',
          })}
        />
      )}

      {premium && filteredPremium.length > 0 && (
        <details className="group space-y-3" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-1 min-h-[44px] [&::-webkit-details-marker]:hidden">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">
              {t('mindPremiumSessionsCount', {
                count: filteredPremium.length,
                defaultValue: `Premium guided sessions (${filteredPremium.length})`,
              })}
            </h3>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPremium.map((s) => (
              <GuidedMindSessionRunner key={s.id} session={s} onLogged={() => setRefresh((r) => r + 1)} />
            ))}
          </div>
        </details>
      )}

      {!premium && (
        <div className="space-y-2">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 border-2 border-border bg-card px-4 py-3 text-sm min-h-[44px]"
            onClick={() => setPremiumOpen((v) => !v)}
          >
            <span className="font-medium text-muted-foreground">
              {t('mindPremiumPreviewCount', {
                count: inv.mind.premium,
                defaultValue: `Premium guided sessions (${inv.mind.premium})`,
              })}
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
                {fmt.date(w.completedAt)} — {w.title}
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
