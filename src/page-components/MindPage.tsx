'use client';
/**
 * Page: /mind — mind pillar
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import { BreathingTimer } from '@/components/pillars/BreathingTimer';
import { DailyCheckIn } from '@/components/pillars/DailyCheckIn';
import { MindLockedPreview } from '@/components/mind/MindLockedPreview';
import { usePremium } from '@/hooks/usePremium';
import type { GuidedMindSession } from '@/data/guidedMindSessions';
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
import { getContentInventory } from '@/lib/contentInventory';
import {
  filterMindByCollection,
  MIND_COLLECTIONS,
  parseMindCollectionParam,
  type MindCollectionId,
} from '@/lib/mind/filterSessions';
import { mindSeriesByCollectionId, orderSessionsForSeries } from '@/lib/mind/mindSeries';
import { cn } from '@/lib/utils';
import { isFreeBeta } from '@/lib/freeBeta';

export function MindPage() {
  const { t } = useTranslation();
  const fmt = useLocaleFormat();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { premium } = usePremium();
  const freeBeta = isFreeBeta();
  const [premiumSessions, setPremiumSessions] = useState<GuidedMindSession[]>([]);
  const [recentWins, setRecentWins] = useState<PillarWin[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [premiumFetchError, setPremiumFetchError] = useState(false);
  const [premiumRetry, setPremiumRetry] = useState(0);
  const [collectionId, setCollectionId] = useState<MindCollectionId>(() =>
    parseMindCollectionParam(
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('collection')
        : null
    )
  );
  const inv = getContentInventory();

  useEffect(() => {
    setCollectionId(parseMindCollectionParam(searchParams.get('collection')));
  }, [searchParams]);

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
          title: freeBeta
            ? t('mindPremiumFetchFailedOpenBeta', {
                defaultValue: 'Could not load extra guided sessions',
              })
            : t('mindPremiumFetchFailed', {
                defaultValue: 'Could not load premium sessions',
              }),
          description: t('mindPremiumFetchFailedDesc', {
            defaultValue: 'Free mind tools still work. Check your connection and try again.',
          }),
          variant: 'destructive',
        });
      });
  }, [premium, premiumRetry, t, toast, freeBeta]);

  const freeSessions = useMemo(
    () => filterMindByCollection(GUIDED_MIND_SESSIONS, collectionId),
    [collectionId]
  );
  const filteredPremium = useMemo(() => {
    const filtered = filterMindByCollection(premiumSessions, collectionId);
    const series = mindSeriesByCollectionId(collectionId);
    return series ? orderSessionsForSeries(filtered, series) : filtered;
  }, [premiumSessions, collectionId]);
  const activeSeries = mindSeriesByCollectionId(collectionId);

  return (
    <PillarPageShell
      className="house-mind"
      icon={Brain}
      eyebrow={t('mindEyebrow', { defaultValue: 'Mind' })}
      title={t('mindTitle', { defaultValue: 'Mind & Recovery' })}
      subtitle={t('mindSubtitleBrief', {
        defaultValue: 'Check in, then breathe.',
      })}
    >
      {/* Field manual: check-in is the return channel — first job on Mind. */}
      <DailyCheckIn />
      <BreathingTimer />

      <details className="house-card group">
        <summary
          className="flex min-h-[44px] cursor-pointer list-none items-center px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden"
          data-testid="mind-show-all"
        >
          {t('todayShowAll', { defaultValue: 'Show all' })}
        </summary>
        <div className="space-y-4 border-t-2 border-border p-4">
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
                'shrink-0 min-h-[44px] border-2 px-3 text-sm font-semibold transition-colors tap-target',
                // `is-active-tab`, not a red fill: a selection is not an action
                // (`.240`). `bg-primary` here read as a second red action on a
                // screen whose cap is one — the same defect `/programs` fixed.
                selected
                  ? 'is-active-tab border-primary text-foreground'
                  : 'border-border bg-card text-foreground hover:border-primary'
              )}
              onClick={() => setCollectionId(c.id)}
            >
              {t(c.titleKey, { defaultValue: c.titleDefault })}
            </button>
          );
        })}
      </div>

      {activeSeries ? (
        <div
          className="border-2 border-border bg-card p-4 space-y-1"
          data-testid="mind-series-banner"
        >
          <p className="text-sm font-semibold text-foreground">
            {t(activeSeries.titleKey, { defaultValue: activeSeries.titleDefault })}
          </p>
          <p className="text-xs text-muted-foreground">
            {freeBeta
              ? t('mindSeriesSleepWeekBlurbOpenBeta', {
                  count: activeSeries.sessionIds.length,
                  defaultValue: `A ${activeSeries.sessionIds.length}-night sequence — do nights in order when you can.`,
                })
              : t('mindSeriesSleepWeekBlurb', {
                  count: activeSeries.sessionIds.length,
                  defaultValue: `A ${activeSeries.sessionIds.length}-night sequence — do nights in order when you can. Premium sessions only.`,
                })}
          </p>
        </div>
      ) : null}

      <div id="mind-guided" className="space-y-3 scroll-mt-20">
        <h3 className="text-sm font-semibold text-muted-foreground">
          {t('mindGuidedFreeCount', {
            count: freeSessions.length,
            defaultValue: `Guided sessions (${freeSessions.length})`,
          })}
        </h3>
        {freeSessions.length === 0 ? (
          <div className="border-y-2 border-border py-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              {t('mindCollectionEmpty', {
                defaultValue: 'No sessions in this collection.',
              })}
            </p>
            {collectionId !== 'all' ? (
              <button
                type="button"
                className="min-h-[44px] border-2 border-border px-3 text-sm font-semibold tap-target hover:bg-muted"
                onClick={() => setCollectionId('all')}
              >
                {t('mindCollectionShowAll', { defaultValue: 'Show all sessions' })}
              </button>
            ) : null}
          </div>
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
          title={
            freeBeta
              ? t('mindPremiumFetchFailedOpenBeta', {
                  defaultValue: 'Could not load extra guided sessions',
                })
              : t('mindPremiumFetchFailed', {
                  defaultValue: 'Could not load premium sessions',
                })
          }
          description={
            freeBeta
              ? t('mindPremiumOfflineOpenBeta', {
                  defaultValue:
                    'Extra sessions unavailable offline — free tools above still work.',
                })
              : t('mindPremiumOffline', {
                  defaultValue:
                    'Premium sessions unavailable offline — free tools above still work.',
                })
          }
        />
      )}

      {premium && filteredPremium.length > 0 && (
        <details className="house-card group">
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
            <span>
              {freeBeta
                ? t('mindPremiumSessionsCountOpenBeta', {
                    count: filteredPremium.length,
                    defaultValue: `More guided sessions (${filteredPremium.length})`,
                  })
                : t('mindPremiumSessionsCount', {
                    count: filteredPremium.length,
                    defaultValue: `Premium guided sessions (${filteredPremium.length})`,
                  })}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="grid gap-4 border-t-2 border-border p-4 md:grid-cols-2">
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
            <span className="font-semibold text-muted-foreground">
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
        <details className="house-card group">
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center px-4 py-3 text-sm font-semibold text-muted-foreground [&::-webkit-details-marker]:hidden">
            {t('mindRecentWins', { defaultValue: 'Recent Mind Wins' })}
          </summary>
          <div className="space-y-1 border-t-2 border-border px-4 py-3 text-sm text-muted-foreground">
            {recentWins.map((w) => (
              <div key={w.id}>
                {fmt.date(w.completedAt)} — {w.title}
              </div>
            ))}
          </div>
        </details>
      ) : (
        <EmptyState
          className="house-empty"
          icon={Brain}
          title={t('mindEmptyTitle', { defaultValue: 'No mind sessions logged yet' })}
          description={t('mindEmptyDesc', {
            defaultValue: 'Try a guided session or breathing timer — your first win shows here.',
          })}
          actionLabel={t('mindEmptyCta', { defaultValue: 'Browse guided sessions' })}
          href="#mind-guided"
        />
      )}
        </div>
      </details>
    </PillarPageShell>
  );
}
