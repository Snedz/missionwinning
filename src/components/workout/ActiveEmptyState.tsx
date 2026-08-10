'use client';

import { isOfflineInstallable } from '@/lib/offlineCapability';
import { ChevronRight, Dumbbell, Timer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenDock } from '@/components/layout/ScreenDock';
import { PillarPageHeader } from '@/components/layout/PillarPageHeader';
import { WorkoutVictorySheet } from '@/components/workout/WorkoutVictorySheet';
import type { Debrief } from '@/lib/coach/debrief';
import type { WorkoutVictorySummary } from '@/lib/workout/workoutVictory';

type Props = {
  onStart: () => void;
  /** When false, Start is disabled until Zustand persist rehydrates. */
  hydrated?: boolean;
  victoryOpen: boolean;
  victorySummary: WorkoutVictorySummary | null;
  onVictoryOpenChange: (open: boolean) => void;
  onViewToday: () => void;
  onViewHistory: () => void;
  debrief?: Debrief | null;
  /** The athlete's journal fragments from the just-finished session. */
  fragments?: string[];
  /** Finished session id — lets a feel tap annotate that session's journal entry. */
  workoutId?: string;
};

/** Empty /active shell — start quick session or jump to Today / Builder. */
export function ActiveEmptyState({
  onStart,
  hydrated = true,
  victoryOpen,
  victorySummary,
  onVictoryOpenChange,
  debrief,
  fragments,
  workoutId,
  onViewToday,
  onViewHistory,
}: Props) {
  const { t } = useTranslation();

  return (
    /*
     * `aria-busy` while persist rehydrates, because this screen *is* busy.
     *
     * The Start button is disabled and relabelled "Loading session…" until
     * Zustand hands back the last workout, but nothing in the DOM said so: a
     * screen reader announced a disabled button with no explanation, and any
     * automated wait keyed on the semantic marker saw a settled page.
     *
     * `.253` — `a11y.spec.ts` carried a route special-case for exactly this
     * state (`if (path === '/active') await …getByRole('button', { name:
     * /start workout|loading session/i })`), which is `.220`'s shape: a rule
     * written as a list of the routes someone happened to hit, matched on the
     * button's *copy*, so changing that string silently removed the wait.
     * Declaring the state here makes `/active` a case of the general rule
     * rather than an exception beside it.
     */
    <div className="space-y-6 py-6" aria-busy={hydrated ? undefined : true}>
      <PillarPageHeader
        icon={Dumbbell}
        eyebrow={t('activeEyebrow', { defaultValue: 'Train' })}
        title={t('activeTitle', { defaultValue: 'Active workout' })}
        subtitle={
          /*
            Two literal keys, not a ternary `defaultValue` — a computed key is
            invisible to `i18n-coverage`'s counter, which is why `.596` had to
            split six of them. "Offline ready" is true of the feature and false
            of this build while the gate is up; the fallback states the part
            that holds without a service worker.
          */
          isOfflineInstallable()
            ? t('activeEmptySubtitle', {
                defaultValue: 'Log sets with rest timers, PRs, and form cues — offline ready.',
              })
            : t('activeEmptySubtitleNoSw', {
                defaultValue:
                  'Log sets with rest timers, PRs, and form cues. Lose signal mid-session and logging keeps going.',
              })
        }
      />
      {/*
        Invite only — no outline Start in the card. `.637` CX residual: empty
        Active had no red primary (EmptyState deliberately demotes CTAs). The
        one start action lives in the dock below, same as Today's hero.
      */}
      <EmptyState
        icon={Timer}
        title={
          hydrated
            ? t('activeNoWorkout', { defaultValue: 'No session running' })
            : t('activeLoadingSession', { defaultValue: 'Restoring session…' })
        }
        description={
          hydrated
            ? t('activeNoWorkoutDesc', {
                defaultValue:
                  'Start here, or open Today for the session already planned for you.',
              })
            : t('activeLoadingSessionDesc', {
                defaultValue: 'Reading the last workout saved on this device.',
              })
        }
      />
      {/* Flow-9 / K4 — one secondary hierarchy: Today outline, Builder quiet. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <Button variant="outline" className="min-h-[44px]" asChild>
          <a href="/log">{t('activeGoToday', { defaultValue: 'Today' })}</a>
        </Button>
        <a
          href="/builder"
          className="min-h-[44px] inline-flex items-center text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          {t('activeGoBuilder', { defaultValue: 'Builder' })}
        </a>
      </div>
      {/*
        Compact dock owns the one red Start. Desktop `ScreenDock` renders in
        place (same as Today), so the poster field still leads under the invite.
      */}
      <ScreenDock>
        <div className="poster-field px-4 pb-4 pt-3.5">
          <p className="poster-kicker mb-2 text-[11px] font-semibold uppercase tracking-[0.12em]">
            {t('activeEyebrow', { defaultValue: 'Train' })}
          </p>
          <p className="poster-sub mb-2.5 line-clamp-1 text-sm leading-relaxed">
            {hydrated
              ? t('activeNoWorkoutDesc', {
                  defaultValue:
                    'Start here, or open Today for the session already planned for you.',
                })
              : t('activeLoadingSessionDesc', {
                  defaultValue: 'Reading the last workout saved on this device.',
                })}
          </p>
          <button
            type="button"
            onClick={onStart}
            disabled={!hydrated}
            className="primary-action min-h-[52px] w-full text-[19px] disabled:opacity-60"
            aria-busy={hydrated ? undefined : true}
          >
            <span className="flex-1 text-start">
              {hydrated
                ? t('activeStartWorkout', { defaultValue: 'Start workout' })
                : t('activeLoadingSession', { defaultValue: 'Restoring session…' })}
            </span>
            <ChevronRight className="ms-auto h-5 w-5 shrink-0" aria-hidden />
          </button>
        </div>
      </ScreenDock>
      <WorkoutVictorySheet
        open={victoryOpen}
        summary={victorySummary}
        debrief={debrief}
        fragments={fragments}
        workoutId={workoutId}
        onOpenChange={onVictoryOpenChange}
        onViewToday={onViewToday}
        onViewHistory={onViewHistory}
      />
    </div>
  );
}
